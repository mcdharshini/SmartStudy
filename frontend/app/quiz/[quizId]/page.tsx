"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flag,
  RotateCcw,
  Home,
  BookOpen,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"
import { useAppStore } from "@/lib/store"
import type { QuizResult } from "@/lib/types"
import { toast } from "sonner"

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quizzes, quizAnswers, setQuizAnswer, clearQuizAnswers, setCurrentQuiz, currentQuiz, submitQuiz } =
    useAppStore()

  const quiz = quizzes.find((q) => q.quizId === quizId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<QuizResult | null>(null)

  useEffect(() => {
    if (quiz) {
      setCurrentQuiz(quiz)
      clearQuizAnswers()
    }
    return () => setCurrentQuiz(null)
  }, [quiz, setCurrentQuiz, clearQuizAnswers])

  if (!quiz) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Quiz not found</h2>
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const currentQuestion = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100

  const currentAnswer = quizAnswers.find((a) => a.questionId === currentQuestion?.questionId)

  const handleAnswer = (optionId: string) => {
    if (currentQuestion) {
      setQuizAnswer({
        questionId: currentQuestion.questionId,
        selectedOptionId: optionId,
        flagged: currentAnswer?.flagged,
      })
    }
  }

  const handleFlag = () => {
    if (currentQuestion) {
      setQuizAnswer({
        ...currentAnswer,
        questionId: currentQuestion.questionId,
        flagged: !currentAnswer?.flagged,
      })
    }
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }

  const handleSubmit = () => {
    // Calculate results
    let correct = 0
    const wrongQuestions: string[] = []

    quiz.questions.forEach((q) => {
      const answer = quizAnswers.find((a) => a.questionId === q.questionId)
      if (answer?.selectedOptionId === q.correctOptionId) {
        correct++
      } else {
        wrongQuestions.push(q.questionId)
      }
    })

    const result: QuizResult = {
      score: correct / totalQuestions,
      perTopic: [
        { topic: quiz.topic || "General", correct, total: totalQuestions },
        { topic: "Concepts", correct: Math.floor(correct * 0.6), total: Math.floor(totalQuestions * 0.6) },
        { topic: "Applications", correct: Math.floor(correct * 0.4), total: Math.floor(totalQuestions * 0.4) },
      ],
      wrongQuestions,
    }

    submitQuiz(correct, totalQuestions)

    // Show achievement toast if score is good
    if (result.score >= 0.9) {
      toast.success("Excellent! You scored 90%+!")
    } else if (result.score >= 0.7) {
      toast.success("Great job! You passed the quiz!")
    }

    setResults(result)
    setShowResults(true)
  }

  const handleRetake = () => {
    clearQuizAnswers()
    setCurrentIndex(0)
    setShowResults(false)
    setResults(null)
  }

  // Results View
  if (showResults && results) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <AppHeader />

          <main className="container max-w-3xl mx-auto px-4 py-8">
            <Card className="border-border bg-card">
              <CardHeader className="text-center pb-2">
                <div
                  className={cn(
                    "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4",
                    results.score >= 0.7
                      ? "bg-success/20"
                      : results.score >= 0.5
                        ? "bg-warning/20"
                        : "bg-destructive/20",
                  )}
                >
                  {results.score >= 0.7 ? (
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  ) : (
                    <XCircle className="h-10 w-10 text-destructive" />
                  )}
                </div>
                <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                <p className="text-muted-foreground">
                  You scored <span className="text-foreground font-semibold">{Math.round(results.score * 100)}%</span>
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Score breakdown */}
                <div className="grid gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Score</span>
                      <span className="text-foreground font-medium">{Math.round(results.score * 100)}%</span>
                    </div>
                    <Progress value={results.score * 100} className="h-3" />
                  </div>
                </div>

                {/* Topic Breakdown */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Performance by Topic</h3>
                  <div className="space-y-3">
                    {results.perTopic.map((topic, idx) => {
                      const topicScore = topic.total > 0 ? (topic.correct / topic.total) * 100 : 0
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground">{topic.topic}</span>
                              <span className="text-muted-foreground">
                                {topic.correct}/{topic.total}
                              </span>
                            </div>
                            <Progress value={topicScore} className="h-2" />
                          </div>
                          <Badge
                            variant={topicScore >= 70 ? "default" : topicScore >= 50 ? "secondary" : "destructive"}
                            className={cn(
                              "min-w-[60px] justify-center",
                              topicScore >= 70
                                ? "bg-success/20 text-success"
                                : topicScore >= 50
                                  ? "bg-warning/20 text-warning"
                                  : "bg-destructive/20 text-destructive",
                            )}
                          >
                            {Math.round(topicScore)}%
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Weak Topics */}
                {results.wrongQuestions.length > 0 && (
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Areas to Review
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      You missed {results.wrongQuestions.length} question
                      {results.wrongQuestions.length > 1 ? "s" : ""}. Consider reviewing these topics.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={async () => {
                        const toastId = toast.loading("Generating focused review quiz...")
                        try {
                          const { api } = await import("@/lib/api")
                          const { createQuiz, setCurrentQuiz } = useAppStore.getState()

                          const baseTopic = quiz.topic || "General"
                          const cleanTopic = baseTopic.replace(/^Review:\s*/, "")
                          const data = await api.generateQuiz(`Review: ${cleanTopic}`, "medium", quiz.notebookId)

                          if (data?.error) throw new Error(data.error)
                          if (!data || !data.questions) throw new Error("Invalid quiz response from server")

                          const questions = data.questions.map((q: any, i: number) => ({
                            questionId: `q${Date.now()}-${i}`,
                            type: q.type || "mcq",
                            questionText: q.questionText,
                            options: q.options,
                            correctOptionId: q.correctOptionId,
                            explanation: q.explanation,
                          }))

                          const newQuiz = {
                            quizId: `quiz${Date.now()}`,
                            notebookId: quiz.notebookId,
                            topic: `Review: ${quiz.topic}`,
                            difficulty: "medium" as const,
                            questions,
                            createdAt: new Date(),
                          }

                          createQuiz(newQuiz)
                          setCurrentQuiz(newQuiz)
                          toast.dismiss(toastId)
                          toast.success("Review quiz ready!")
                          window.location.href = `/quiz/${newQuiz.quizId}` // Force reload/nav
                        } catch (e) {
                          console.error(e)
                          toast.dismiss(toastId)
                          toast.error("Failed to generate review quiz")
                        }
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Generate Focused Quiz
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => router.push("/dashboard")}
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 bg-transparent" onClick={handleRetake}>
                    <RotateCcw className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                  <Button className="flex-1 gap-2" onClick={() => router.push(`/notebook/${quiz.notebookId}`)}>
                    <BookOpen className="h-4 w-4" />
                    Review Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthGuard>
    )
  }

  // Quiz Question View
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="container max-w-3xl mx-auto px-4 py-6">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/notebook/${quiz.notebookId}`)}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit
              </Button>
              <div className="flex items-center gap-2">
                {quiz.topic && (
                  <Badge variant="secondary" className="text-xs">
                    {quiz.topic}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    quiz.difficulty === "easy"
                      ? "text-success border-success"
                      : quiz.difficulty === "medium"
                        ? "text-warning border-warning"
                        : "text-destructive border-destructive",
                  )}
                >
                  {quiz.difficulty}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={progressPercent} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs uppercase">
                      {currentQuestion.type === "mcq"
                        ? "Multiple Choice"
                        : currentQuestion.type === "tf"
                          ? "True/False"
                          : "Short Answer"}
                    </Badge>
                    {currentAnswer?.flagged && (
                      <Badge variant="outline" className="text-warning border-warning text-xs">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-relaxed">{currentQuestion.questionText}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFlag}
                  className={cn(currentAnswer?.flagged && "text-warning")}
                  aria-label={currentAnswer?.flagged ? "Unflag question" : "Flag for review"}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Options */}
              <RadioGroup
                value={currentAnswer?.selectedOptionId || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option.id}>
                    <Label
                      htmlFor={option.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                        currentAnswer?.selectedOptionId === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50",
                      )}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <span className="text-foreground">{option.text}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="gap-1 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Question dots */}
                <div className="hidden sm:flex items-center gap-1">
                  {quiz.questions.map((_, idx) => {
                    const answer = quizAnswers.find((a) => a.questionId === quiz.questions[idx].questionId)
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full transition-colors",
                          idx === currentIndex
                            ? "bg-primary"
                            : answer?.selectedOptionId
                              ? "bg-success"
                              : answer?.flagged
                                ? "bg-warning"
                                : "bg-muted",
                        )}
                        aria-label={`Go to question ${idx + 1}`}
                      />
                    )
                  })}
                </div>

                {currentIndex === totalQuestions - 1 ? (
                  <Button onClick={handleSubmit} className="gap-1">
                    Submit Quiz
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="gap-1">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skip to submit hint */}
          {quizAnswers.length === totalQuestions && currentIndex < totalQuestions - 1 && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setCurrentIndex(totalQuestions - 1)} className="text-primary gap-1">
                All questions answered - Go to submit
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
