"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MessageSquare, Brain, CheckCircle2, Clock, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAppStore } from "@/lib/store"

export function QuickActionsSidebar() {
  const router = useRouter()
  const { notebooks, studyTasks, studyMetrics } = useAppStore()

  const lastNotebook = notebooks.reduce((latest, current) => {
    return new Date(current.lastUpdated) > new Date(latest.lastUpdated) ? current : latest
  }, notebooks[0])

  const pendingTasks = studyTasks.filter((t) => !t.completed).slice(0, 3)

  return (
    <aside className="space-y-4">
      {/* Quick Actions */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={() => lastNotebook && router.push(`/notebook/${lastNotebook.id}`)}
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            Continue Last Chat
          </Button>
          <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => router.push("/study-plan")}>
            <Brain className="h-4 w-4 text-chart-3" />
            Start Quick Quiz
          </Button>
          <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => router.push("/study-plan")}>
            <Calendar className="h-4 w-4 text-chart-2" />
            View Study Plan
          </Button>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {"Today's Tasks"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <ul className="space-y-3">
              {pendingTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(task.dueDate), "MMM d")}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">All caught up!</p>
          )}
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Overall Coverage</span>
              <span className="text-foreground font-medium">{Math.round(studyMetrics.overallCoverage * 100)}%</span>
            </div>
            <Progress value={studyMetrics.overallCoverage * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Quiz Accuracy</span>
              <span className="text-foreground font-medium">{Math.round(studyMetrics.averageQuizAccuracy * 100)}%</span>
            </div>
            <Progress value={studyMetrics.averageQuizAccuracy * 100} className="h-2" />
          </div>
          <div className="text-xs text-muted-foreground">
            Total study time: {Math.round(studyMetrics.timeSpentMinutes / 60)}h {studyMetrics.timeSpentMinutes % 60}m
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
