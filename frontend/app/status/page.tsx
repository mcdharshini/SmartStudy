"use client"

import { useEffect, useState } from "react"
import { Check, X, Loader2, RefreshCw, Server, Brain, Youtube, Globe, Database, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StatusPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const checkStatus = async () => {
        setLoading(true)
        setError(null)
        try {
            const { api } = await import("@/lib/api")
            const result = await api.healthCheck()
            setData(result)
        } catch (err) {
            setError("Failed to connect to backend server. Ensure it is running on port 8000.")
            setData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkStatus()
    }, [])

    const StatusItem = ({
        title,
        icon: Icon,
        statusKey,
    }: {
        title: string
        icon: any
        statusKey: string
    }) => {
        const service = data?.services?.[statusKey]
        const isHealthy = service?.status === "healthy"
        const isLoading = loading

        return (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${isHealthy ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
                        <Icon className={`h-5 w-5 ${isHealthy ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                        <h3 className="font-medium">{title}</h3>
                        {!isLoading && service && (
                            <p className="text-sm text-muted-foreground">{service.message}</p>
                        )}
                    </div>
                </div>
                <div>
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : isHealthy ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Operational
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            Error
                        </Badge>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl py-12 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
                    <p className="text-muted-foreground mt-1">Check the health of AI connections and services</p>
                </div>
                <Button onClick={checkStatus} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4">
                <StatusItem title="Groq AI Engine" icon={Brain} statusKey="llm_api" />
                <StatusItem title="Vector Database (Chroma)" icon={Database} statusKey="vector_db" />
                <StatusItem title="Web Scraper" icon={Globe} statusKey="web_scraper" />
                <StatusItem title="YouTube Transcriber" icon={Youtube} statusKey="youtube_scraper" />
                <StatusItem title="Wikipedia Tool" icon={Library} statusKey="wikipedia_scraper" />
            </div>

            <div className="text-center text-sm text-muted-foreground mt-8">
                Backend URL: <code className="bg-muted px-1 py-0.5 rounded">{process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}</code>
            </div>
        </div>
    )
}
