"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AppHeader } from "@/components/app-header"
import { InfographicView } from "@/components/infographic-view"

export default function InfographicsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Study Infographics</h1>
            <p className="text-muted-foreground">Visual overview of your learning progress and statistics</p>
          </div>
          <InfographicView />
        </main>
      </div>
    </AuthGuard>
  )
}
