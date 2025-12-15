"use client"

import type React from "react"
import { useState } from "react"
import { Plus, X, Calendar, Target } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { StudyTask } from "@/lib/types"

interface CreatePlanDialogProps {
  children: React.ReactNode
}

export function CreatePlanDialog({ children }: CreatePlanDialogProps) {
  const { notebooks, createCustomPlan } = useAppStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [tasks, setTasks] = useState<Omit<StudyTask, "id">[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskType, setNewTaskType] = useState<"read" | "quiz" | "review">("read")
  const [newTaskNotebook, setNewTaskNotebook] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskNotebook || !newTaskDueDate) {
      toast.error("Please fill in all task fields")
      return
    }
    setTasks([
      ...tasks,
      {
        title: newTaskTitle,
        type: newTaskType,
        notebookId: newTaskNotebook,
        dueDate: newTaskDueDate,
        completed: false,
      },
    ])
    setNewTaskTitle("")
    setNewTaskDueDate("")
  }

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleCreate = () => {
    if (!title) {
      toast.error("Please enter a plan title")
      return
    }
    if (tasks.length === 0) {
      toast.error("Please add at least one task")
      return
    }

    const tasksWithIds: StudyTask[] = tasks.map((task, index) => ({
      ...task,
      id: `task${Date.now()}-${index}`,
    }))

    createCustomPlan({
      title,
      description,
      targetDate,
      tasks: tasksWithIds,
    })

    toast.success("Study plan created!")
    setOpen(false)
    setTitle("")
    setDescription("")
    setTargetDate("")
    setTasks([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create Custom Study Plan
          </DialogTitle>
          <DialogDescription>Design your own personalized study schedule</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plan-title">Plan Title</Label>
            <Input
              id="plan-title"
              placeholder="e.g., Finals Preparation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-description">Description (optional)</Label>
            <Textarea
              id="plan-description"
              placeholder="Describe your study goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-date">Target Completion Date (optional)</Label>
            <Input id="target-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>

          <div className="border-t pt-4">
            <Label className="text-base font-medium">Tasks</Label>
            <p className="text-sm text-muted-foreground mb-3">Add tasks to your study plan</p>

            {tasks.length > 0 && (
              <div className="space-y-2 mb-4">
                {tasks.map((task, index) => {
                  const notebook = notebooks.find((n) => n.id === task.notebookId)
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {notebook?.title} • {task.type} • {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveTask(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-3 p-3 border rounded-lg bg-card">
              <Input placeholder="Task title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={newTaskType} onValueChange={(v) => setNewTaskType(v as typeof newTaskType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTaskNotebook} onValueChange={setNewTaskNotebook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Notebook" />
                  </SelectTrigger>
                  <SelectContent>
                    {notebooks.map((nb) => (
                      <SelectItem key={nb.id} value={nb.id}>
                        {nb.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            <Calendar className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
