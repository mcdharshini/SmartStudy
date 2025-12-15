"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, startOfWeek, isToday, isPast } from "date-fns"
import {
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  BookOpen,
  Brain,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Target,
  Flame,
  Award,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import { CreatePlanDialog } from "@/components/create-plan-dialog"

const taskTypeIcons = {
  review: Eye,
  quiz: Brain,
  read: BookOpen,
}

const taskTypeColors = {
  review: "bg-chart-2/20 text-chart-2",
  quiz: "bg-chart-1/20 text-chart-1",
  read: "bg-chart-3/20 text-chart-3",
}

export default function StudyPlanPage() {
  const router = useRouter()
  const { studyTasks, studyMetrics, notebooks, toggleTaskComplete, customPlans, deleteCustomPlan } = useAppStore()

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [isRegenerating, setIsRegenerating] = useState(false)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const tasksByDate = studyTasks.reduce(
    (acc, task) => {
      const dateKey = format(new Date(task.dueDate), "yyyy-MM-dd")
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(task)
      return acc
    },
    {} as Record<string, typeof studyTasks>,
  )

  const completedTasks = studyTasks.filter((t) => t.completed).length
  const totalTasks = studyTasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const handlePrevWeek = () => setCurrentWeekStart((d) => addDays(d, -7))
  const handleNextWeek = () => setCurrentWeekStart((d) => addDays(d, 7))
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success("Study plan regenerated!")
    setIsRegenerating(false)
  }

  const handleDeletePlan = (planId: string, planTitle: string) => {
    deleteCustomPlan(planId)
    toast.success(`Deleted plan: ${planTitle}`)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="container mx-auto px-4 py-6 md:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Study Plan</h1>
              <p className="text-muted-foreground text-sm mt-1">Track your progress and stay on schedule</p>
            </div>
            <div className="flex gap-2">
              <CreatePlanDialog>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Create Plan
                </Button>
              </CreatePlanDialog>
              <Button onClick={handleRegenerate} disabled={isRegenerating} className="gap-2">
                {isRegenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Plan
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Coverage</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(studyMetrics.overallCoverage * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Award className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quiz Accuracy</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(studyMetrics.averageQuizAccuracy * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/20">
                    <Flame className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Study Time</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(studyMetrics.timeSpentMinutes / 60)}h {studyMetrics.timeSpentMinutes % 60}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Done</p>
                    <p className="text-2xl font-bold text-foreground">
                      {completedTasks}/{totalTasks}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {customPlans.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Your Custom Plans</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customPlans.map((plan) => {
                  const planTasks = plan.tasks || []
                  const completedPlanTasks = planTasks.filter(
                    (t) => studyTasks.find((st) => st.id === t.id)?.completed,
                  ).length
                  const progress = planTasks.length > 0 ? (completedPlanTasks / planTasks.length) * 100 : 0

                  return (
                    <Card key={plan.id} className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{plan.title}</CardTitle>
                            {plan.description && (
                              <CardDescription className="text-xs mt-1">{plan.description}</CardDescription>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeletePlan(plan.id, plan.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {completedPlanTasks}/{planTasks.length} tasks
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          {plan.targetDate && (
                            <p className="text-xs text-muted-foreground">
                              Target: {format(new Date(plan.targetDate), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Main Content */}
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <Clock className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </TabsTrigger>
            </TabsList>

            {/* Calendar View */}
            <TabsContent value="calendar">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleToday}>
                        Today
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const dateKey = format(day, "yyyy-MM-dd")
                      const dayTasks = tasksByDate[dateKey] || []
                      const isCurrentDay = isToday(day)
                      const isPastDay = isPast(day) && !isCurrentDay

                      return (
                        <div
                          key={dateKey}
                          className={cn(
                            "min-h-[120px] p-2 rounded-lg border transition-colors",
                            isCurrentDay
                              ? "border-primary bg-primary/5"
                              : isPastDay
                                ? "border-border bg-muted/30"
                                : "border-border bg-card hover:border-primary/50",
                          )}
                        >
                          <div className="text-center mb-2">
                            <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                            <p
                              className={cn(
                                "text-sm font-medium",
                                isCurrentDay ? "text-primary" : isPastDay ? "text-muted-foreground" : "text-foreground",
                              )}
                            >
                              {format(day, "d")}
                            </p>
                          </div>
                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map((task) => {
                              const Icon = taskTypeIcons[task.type]
                              return (
                                <button
                                  key={task.id}
                                  onClick={() => toggleTaskComplete(task.id)}
                                  className={cn(
                                    "w-full flex items-center gap-1 p-1 rounded text-xs transition-colors",
                                    task.completed ? "opacity-50 line-through" : "",
                                    taskTypeColors[task.type],
                                  )}
                                >
                                  <Icon className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{task.title.split(" ").slice(0, 2).join(" ")}</span>
                                </button>
                              )
                            })}
                            {dayTasks.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center">+{dayTasks.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">All Tasks</CardTitle>
                  <CardDescription>Click to mark as complete</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {studyTasks
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .map((task) => {
                        const Icon = taskTypeIcons[task.type]
                        const notebook = notebooks.find((n) => n.id === task.notebookId)
                        const isPastDue = isPast(new Date(task.dueDate)) && !task.completed

                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                              task.completed
                                ? "bg-muted/30 border-border"
                                : isPastDue
                                  ? "bg-destructive/10 border-destructive/30"
                                  : "bg-card border-border hover:border-primary/50",
                            )}
                            onClick={() => toggleTaskComplete(task.id)}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className={cn("p-1.5 rounded-md flex-shrink-0", taskTypeColors[task.type])}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  task.completed && "line-through text-muted-foreground",
                                )}
                              >
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notebook?.title} • {format(new Date(task.dueDate), "MMM d")}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs capitalize",
                                task.type === "quiz"
                                  ? "bg-chart-1/20 text-chart-1"
                                  : task.type === "review"
                                    ? "bg-chart-2/20 text-chart-2"
                                    : "bg-chart-3/20 text-chart-3",
                              )}
                            >
                              {task.type}
                            </Badge>
                          </div>
                        )
                      })}

                    {studyTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No tasks scheduled</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress View */}
            <TabsContent value="progress">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Overall Progress */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Task Completion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-muted"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${completionRate * 3.52} 352`}
                            className="text-primary transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-foreground">{Math.round(completionRate)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      {completedTasks} of {totalTasks} tasks completed
                    </div>
                  </CardContent>
                </Card>

                {/* Notebook Progress */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Notebook Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {notebooks.map((notebook) => (
                      <div key={notebook.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span
                            className="text-foreground truncate cursor-pointer hover:text-primary"
                            onClick={() => router.push(`/notebook/${notebook.id}`)}
                          >
                            {notebook.title}
                          </span>
                          <span className="text-muted-foreground">{Math.round(notebook.progress * 100)}%</span>
                        </div>
                        <Progress value={notebook.progress * 100} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Study Streaks */}
                <Card className="border-border bg-card md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-around gap-2 h-32">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                        const height = [60, 80, 45, 90, 70, 30, 50][i]
                        return (
                          <div key={day} className="flex flex-col items-center gap-2 flex-1">
                            <div
                              className="w-full bg-primary/20 rounded-t-md transition-all hover:bg-primary/30"
                              style={{ height: `${height}%` }}
                            >
                              <div
                                className="w-full bg-primary rounded-t-md"
                                style={{ height: `${Math.min(100, height + 20)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{day}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
