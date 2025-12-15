"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, FileText, X, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

interface DocumentViewerProps {
  notebookId: string
}

export function DocumentViewer({ notebookId }: DocumentViewerProps) {
  const { documents, selectedDocumentId, highlightedPage, highlightedSnippet, setHighlight } = useAppStore()
  const notebookDocs = documents[notebookId] || []
  const selectedDoc = notebookDocs.find((d) => d.documentId === selectedDocumentId)

  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [viewMode, setViewMode] = useState<"original" | "text">("original")
  const contentRef = useRef<HTMLDivElement>(null)

  /* 
   * FIXED: Use a robust fallback for URL to handle legacy documents.
   * Also fixed useEffect dependencies to prevent loop/reset issues.
   */
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  let effectiveUrl = selectedDoc?.url
  if (!effectiveUrl && selectedDoc && selectedDoc.fileType !== "url") {
    // Fallback for documents that were uploaded before the 'url' field was added
    effectiveUrl = `${API_URL}/static/uploads/${encodeURIComponent(selectedDoc.name)}`
  }

  useEffect(() => {
    if (highlightedPage && selectedDoc) {
      setCurrentPage(Math.min(highlightedPage, selectedDoc.pages))
      // If jumping to a highlight, switch to text view to show the snippet
      if (highlightedSnippet) {
        setViewMode("text")
      }
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
    }
  }, [highlightedPage, highlightedSnippet, selectedDoc?.documentId, selectedDoc?.pages])

  // Reset view mode when document changes
  useEffect(() => {
    if (effectiveUrl) {
      setViewMode("original")
    } else {
      setViewMode("text")
    }
  }, [selectedDoc?.documentId, effectiveUrl])

  const totalPages = selectedDoc?.pages || 1

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25))
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25))

  const clearHighlight = () => setHighlight(null, null)

  const generatePageContent = (pageNum: number) => {
    // 1. If we have real extracted text from the backend, show it.
    if (selectedDoc?.content) {
      const charsPerPage = 1500;
      const start = (pageNum - 1) * charsPerPage;
      const end = start + charsPerPage;
      const pageText = selectedDoc.content.slice(start, end);
      return pageText || "End of document.";
    }

    // 2. Demo Fallback
    const loremParagraphs = [
      "## Core Fundamentals\n\nMachine learning is a subset of artificial intelligence...",
      "## Supervised Learning\n\nSupervised learning uses labeled datasets...",
      "## Overfitting & Regularization\n\nRegularization is a technique used to reduce overfitting...",
      "## Neural Network Architecture\n\nNeural networks are computing systems inspired by biological neural networks...",
      "## Deep Learning Applications\n\nDeep learning is part of a broader family of machine learning methods...",
      "## Data Preprocessing\n\nBefore training a model, data must be cleaned and normalized..."
    ]
    return loremParagraphs[(pageNum - 1) % loremParagraphs.length]
  }

  if (!selectedDoc) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-muted-foreground">
        <FileText className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No document selected</p>
        <p className="text-sm mt-1">Select a document from the panel to view its contents</p>
      </div>
    )
  }

  // Helper to detect YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    return null
  }

  const youtubeEmbedUrl = effectiveUrl ? getYouTubeEmbedUrl(effectiveUrl) : null
  const isYouTube = !!youtubeEmbedUrl;

  return (
    <div className="h-full w-full min-w-0 flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-border bg-card">
        {/* Left: View Mode Toggles */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-md">
          <Button
            variant={viewMode === "original" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setViewMode("original")}
            disabled={!effectiveUrl}
          >
            {isYouTube ? <ExternalLink className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Original
          </Button>
          <Button
            variant={viewMode === "text" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setViewMode("text")}
          >
            <FileText className="h-3.5 w-3.5" />
            Text
          </Button>
        </div>

        {/* Center: Doc Name */}
        <div className="flex-1 truncate text-sm font-medium text-foreground text-center px-2">
          {selectedDoc.name}
        </div>

        {/* Right: Controls (only for text mode usually, but some zoom works for both) */}
        {viewMode === "text" && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">

        {/* ORIGINAL VIEW MODE */}
        {viewMode === "original" && (
          isYouTube ? (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <iframe
                src={youtubeEmbedUrl!}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedDoc.name}
              />
            </div>
          ) : (
            effectiveUrl ? (
              <OriginalDocumentViewer url={effectiveUrl} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>No preview available for this document.</p>
                <Button variant="link" onClick={() => setViewMode("text")}>Switch to Text View</Button>
              </div>
            )
          )
        )}

        {/* TEXT VIEW MODE */}
        {viewMode === "text" && (
          <div className="h-full overflow-auto p-4 bg-secondary/10">
            {highlightedSnippet && (
              <div className="mb-4 mx-auto max-w-3xl flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <span className="text-sm text-yellow-600 dark:text-yellow-400 flex-1">
                  Found in text: "{highlightedSnippet}"
                </span>
                <Button variant="ghost" size="sm" onClick={clearHighlight} className="h-6 text-xs hover:bg-yellow-500/20">
                  Clear
                </Button>
              </div>
            )}

            <div
              ref={contentRef}
              className="max-w-3xl mx-auto bg-card border border-border rounded-lg shadow-sm min-h-[800px] p-8 md:p-12 mb-8 transition-transform origin-top"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <div className="text-xs text-muted-foreground mb-6 uppercase tracking-wider font-semibold">
                Page {currentPage} of {totalPages}
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                  {generatePageContent(currentPage)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OriginalDocumentViewer({ url }: { url: string }) {
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setChecking(true)
    setError(false)
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setChecking(false))
  }, [url])

  if (checking) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-secondary/10 text-muted-foreground p-8 text-center">
        <FileText className="h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-foreground mb-2">Document Not Found</h3>
        <p className="max-w-md mb-6">
          The original file could not be found on the server. This can happen if the file was uploaded before the file storage feature was enabled.
        </p>
        <p className="text-sm">Please try re-uploading the document.</p>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      className="w-full h-full border-0 bg-white"
      title="Original Document"
    />
  )
}
