"use client"

import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"
import { NotebookCard } from "@/components/notebook-card"
import { CreateNotebookDialog } from "@/components/create-notebook-dialog"
import { QuickActionsSidebar } from "@/components/quick-actions-sidebar"
import { InfographicView } from "@/components/infographic-view"
import { useAppStore } from "@/lib/store"
import { BookOpen } from "lucide-react"

export default function DashboardPage() {
  const { notebooks, studyMetrics } = useAppStore()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="container mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Study Dashboard</h1>
                  <p className="text-muted-foreground text-sm mt-1">Your learning progress at a glance</p>
                </div>
                <CreateNotebookDialog />
              </div>

              {/* Notebooks Grid */}
              {notebooks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {notebooks.map((notebook) => (
                    <NotebookCard key={notebook.id} notebook={notebook} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border bg-card/50">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No notebooks yet</h3>
                  <p className="text-muted-foreground text-sm text-center mb-4 max-w-sm">
                    Create your first notebook to start uploading course materials and asking questions.
                  </p>
                  <CreateNotebookDialog />
                </div>
              )}

              {/* Infographic View */}
              <InfographicView />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <QuickActionsSidebar />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
