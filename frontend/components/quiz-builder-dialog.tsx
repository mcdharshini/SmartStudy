"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, Zap, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useAppStore } from "@/lib/store"
import type { Quiz, QuizQuestion } from "@/lib/types"
import { toast } from "sonner"

interface QuizBuilderDialogProps {
  notebookId: string
  trigger?: React.ReactNode
}

const difficultyColors = {
  easy: "text-success",
  medium: "text-warning",
  hard: "text-destructive",
}

export function QuizBuilderDialog({ notebookId, trigger }: QuizBuilderDialogProps) {
  const router = useRouter()
  const { createQuiz, setCurrentQuiz, notebooks, documents, selectedDocumentId } = useAppStore()
  const [open, setOpen] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [numQuestions, setNumQuestions] = useState([5])
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const { api } = await import("@/lib/api")

      // key part: determine topic & context
      const notebook = notebooks.find((n) => n.id === notebookId)
      const searchTopic = topic || notebook?.subject || notebook?.title || "General"

      // Try to get active document content for "Real Time" generation
      const notebookDocs = documents[notebookId] || []
      const selectedDoc = notebookDocs.find(d => d.documentId === selectedDocumentId)

      // If we have a specific document selected, use its name/content to refine the quiz
      // The API currently takes (topic, difficulty, notebookId). 
      // We'll pass the document name as the 'topic' if no specific topic was entered,
      // or we might need to update the API to accept raw context.
      // For now, let's pass a context filter if we can. 
      // The current backend generate_quiz uses topic to search vector DB.

      // Let's rely on the backend's vector search finding the right context based on the topic.
      // BUT to ensure "real time" feel, if a doc is selected, we should prioritize it.

      let finalTopic = searchTopic
      if (!topic && selectedDoc) {
        finalTopic = `${selectedDoc.name} - ${searchTopic}`
      }

      const data = await api.generateQuiz(finalTopic, difficulty, notebookId)

      console.log("Quiz Data:", data)

      if (!data || !data.questions || !Array.isArray(data.questions)) {
        console.error("Invalid quiz data structure:", data)
        throw new Error(data?.error || "Failed to generate valid quiz questions. Please try again.")
      }

      const questions: QuizQuestion[] = data.questions.map((q: any, i: number) => ({
        questionId: `q${Date.now()}-${i}`,
        type: q.type === "true_false" ? "tf" : (q.type || "mcq"),
        questionText: q.questionText,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
        // Optional source mapping if backend provides it later
      }))

      const quiz: Quiz = {
        quizId: `quiz${Date.now()}`,
        notebookId,
        topic: searchTopic,
        difficulty,
        questions,
        createdAt: new Date(),
      }

      createQuiz(quiz)
      setCurrentQuiz(quiz)

      toast.success("Quiz generated successfully!")
      setOpen(false)

      router.push(`/quiz/${quiz.quizId}`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate quiz. Is the backend running?")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" className="gap-2">
            <Brain className="h-4 w-4" />
            Generate Quiz
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Generate Quiz
          </DialogTitle>
          <DialogDescription>Create a quiz based on your study materials.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Topic */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Topic (Optional)
            </Label>
            <Input
              placeholder="Auto-detected from notebook if empty"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Difficulty
            </Label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={difficulty === d ? "default" : "outline"}
                  size="sm"
                  className={difficulty === d ? "" : difficultyColors[d]}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Questions
              </span>
              <span className="text-primary font-medium">{numQuestions[0]}</span>
            </Label>
            <Slider value={numQuestions} onValueChange={setNumQuestions} min={3} max={15} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </span>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
