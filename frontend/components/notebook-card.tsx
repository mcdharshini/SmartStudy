"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Book, Clock, Calendar, ChevronRight, MoreVertical, Trash2, Edit, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { Notebook } from "@/lib/types"

interface NotebookCardProps {
  notebook: Notebook
}

const subjectColors: Record<string, string> = {
  ML: "bg-chart-1/20 text-chart-1",
  CS: "bg-chart-2/20 text-chart-2",
  Math: "bg-chart-3/20 text-chart-3",
  Physics: "bg-chart-4/20 text-chart-4",
  default: "bg-primary/20 text-primary",
}

export function NotebookCard({ notebook }: NotebookCardProps) {
  const router = useRouter()
  const { deleteNotebook, completeNotebook, userStats } = useAppStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const progressPercent = Math.round(notebook.progress * 100)
  const colorClass = subjectColors[notebook.subject] || subjectColors.default

  const isCompleted = userStats?.completedNotebooks?.includes(notebook.id)

  const handleDelete = () => {
    deleteNotebook(notebook.id)
    toast.success(`"${notebook.title}" has been deleted`)
    setShowDeleteDialog(false)
  }

  const handleComplete = () => {
    completeNotebook(notebook.id)
    toast.success(`"${notebook.title}" marked as complete! Your skills have been updated.`)
  }

  return (
    <>
      <Card
        className={`group cursor-pointer border-border bg-card hover:bg-secondary/50 transition-all duration-200 hover:border-primary/50 ${isCompleted ? "border-primary/30 bg-primary/5" : ""}`}
        onClick={() => router.push(`/notebook/${notebook.id}`)}
        role="button"
        tabIndex={0}
        aria-label={`Open ${notebook.title} notebook`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            router.push(`/notebook/${notebook.id}`)
          }
        }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${colorClass}`}>
                  <Book className="h-4 w-4" />
                </div>
                <Badge variant="secondary" className={`text-xs ${colorClass}`}>
                  {notebook.subject}
                </Badge>
                {isCompleted && (
                  <Badge variant="default" className="text-xs bg-primary/20 text-primary">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-foreground truncate mb-3 group-hover:text-primary transition-colors">
                {notebook.title}
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(notebook.lastUpdated), "MMM d")}</span>
                  </div>
                  {notebook.examDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Exam: {format(new Date(notebook.examDate), "MMM d")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Notebook options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => router.push(`/notebook/${notebook.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Open
                  </DropdownMenuItem>
                  {!isCompleted && (
                    <DropdownMenuItem onClick={handleComplete} className="text-primary focus:text-primary">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{notebook.title}&quot;? This will permanently remove all documents,
              chat history, and quizzes associated with this notebook. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
