"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Sparkles,
  FileText,
  Brain,
  MessageSquare,
  Loader2,
  ExternalLink,
  BookmarkPlus,
  HelpCircle,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import type { ChatMessage, Source } from "@/lib/types"
import { toast } from "sonner"
import { QuizBuilderDialog } from "./quiz-builder-dialog"

interface ChatPanelProps {
  notebookId: string
}

const quickActions = [
  { icon: FileText, label: "Summarize", prompt: "Summarize the current document" },
  { icon: Sparkles, label: "Explain simply", prompt: "Explain this like I'm 15" },
  { icon: MessageSquare, label: "Compare", prompt: "Compare with another document" },
  { icon: Search, label: "Deep Research", prompt: "Do a deep research analysis on this topic" },
]

const aiResponseTemplates = [
  {
    keywords: ["summarize", "summary"],
    responses: [
      "Here's a comprehensive summary of the key points:\n\n1. **Core Concepts**: The material covers fundamental principles that form the foundation of the subject.\n\n2. **Key Takeaways**: The most important ideas include understanding the relationships between different concepts and their practical applications.\n\n3. **Supporting Details**: Various examples and case studies illustrate how these principles work in real-world scenarios.\n\nNow let me ask you: **What part of this summary would you like to explore deeper?** Understanding your interest will help me tailor the learning experience.",
      "Let me break down the main ideas for you:\n\n**Main Theme**: The document explores critical concepts that are essential for understanding the broader topic.\n\n**Key Points**:\n- Foundation principles are established early\n- Progressive complexity builds understanding\n- Practical applications demonstrate real-world relevance\n\n**Let me check your understanding**: Can you think of a real-world example where these concepts apply? This will help reinforce your learning.",
    ],
  },
  {
    keywords: ["explain", "simple", "understand"],
    responses: [
      "Let me explain this in simpler terms:\n\nImagine you're learning to ride a bike. First, you need to understand balance (the core concept), then practice pedaling (applying the concept), and finally combine both smoothly (mastery).\n\nSimilarly, this topic works by:\n1. Building foundational knowledge\n2. Practicing with examples\n3. Connecting everything together\n\n**Quick check**: Based on this analogy, which step do you think you're currently at in understanding this topic?",
      "Think of it this way:\n\nPicture a recipe - you have ingredients (basic concepts), cooking steps (processes), and the final dish (the complete understanding).\n\n**The basics**: Just like knowing your ingredients\n**The process**: Following the steps in order\n**The result**: A complete, working understanding\n\n**Your turn**: Can you identify the 'ingredients' (basic concepts) you already know about this topic?",
    ],
  },
  {
    keywords: ["deep research", "research", "analysis", "analyze"],
    responses: [
      "**Deep Research Analysis**\n\nI've conducted an in-depth analysis of your materials. Here's what I found:\n\n**1. Core Themes**\nThe primary subject matter revolves around foundational concepts that build upon each other systematically.\n\n**2. Key Insights**\n- Pattern recognition is crucial for understanding\n- Connections between topics reveal deeper meaning\n- Practical applications reinforce theoretical knowledge\n\n**3. Research Findings**\n- Studies show active recall improves retention by 50%\n- Spaced repetition is more effective than cramming\n- Teaching concepts to others solidifies understanding\n\n**4. Recommendations**\n- Focus on understanding relationships between concepts\n- Practice with varied examples\n- Review material at increasing intervals\n\n**Would you like me to dive deeper into any specific aspect?**",
      "**Comprehensive Research Report**\n\n**Executive Summary**\nBased on analysis of your study materials, I've identified key patterns and insights.\n\n**Methodology**\nCross-referenced content with academic databases and best practices.\n\n**Findings**\n\n*Conceptual Framework*\n- The material presents a hierarchical structure\n- Each concept builds upon previous foundations\n- Critical thinking is emphasized throughout\n\n*Learning Patterns*\n- Visual learners benefit from diagrams\n- Active engagement increases retention\n- Regular testing improves performance\n\n*Actionable Insights*\n1. Create mind maps for complex topics\n2. Practice problem-solving daily\n3. Review before sleep for better memory consolidation\n\n**What area would you like me to research further?**",
    ],
  },
  {
    keywords: ["compare", "difference", "versus", "vs"],
    responses: [
      "Great question! Here's a comparison:\n\n| Aspect | Approach A | Approach B |\n|--------|-----------|------------|\n| Speed | Faster | More thorough |\n| Complexity | Simpler | More nuanced |\n| Use case | Quick tasks | Deep analysis |\n\n**When to use each**:\n- Use A when time is limited\n- Use B when accuracy is critical\n\n**Think about this**: In your studies, which approach would work better for exam preparation vs. research projects?",
    ],
  },
  {
    keywords: ["example", "show", "demonstrate"],
    responses: [
      "Here's a practical example:\n\n**Scenario**: Imagine you're working on a project...\n\n**Step 1**: Identify the problem\n→ \"I need to organize my data efficiently\"\n\n**Step 2**: Apply the concept\n→ Use the techniques we discussed\n\n**Step 3**: Evaluate results\n→ Check if the solution meets your needs\n\n**Result**: A well-organized, efficient system!\n\n**Your exercise**: Try to come up with a similar example from your own experience. What problem would you solve using this approach?",
      "Let me show you with a concrete case:\n\n**The Setup**:\nYou have a task that seems complex at first glance.\n\n**Applying What We Learned**:\n1. Break it into smaller parts\n2. Handle each part systematically\n3. Combine the results\n\n**The Outcome**:\nA manageable, successful solution!\n\n**Practice question**: What's one complex task you're currently facing that could benefit from this breakdown approach?",
    ],
  },
  {
    keywords: ["why", "reason", "purpose"],
    responses: [
      "That's an excellent question! Here's why:\n\n**The Main Reason**:\nThis approach was designed to solve a specific challenge that earlier methods couldn't address effectively.\n\n**Benefits**:\n1. Improved efficiency\n2. Better accuracy\n3. Greater flexibility\n\n**Historical Context**:\nIt evolved from earlier techniques that had limitations in certain areas.\n\n**Reflection question**: Now that you understand the 'why', how does this change your perspective on applying this concept?",
      "Let me explain the reasoning:\n\n**Purpose**: The primary goal is to address challenges in understanding complex information.\n\n**Why It Matters**:\n- Makes learning more accessible\n- Provides structured approaches\n- Enables better retention\n\n**The Bigger Picture**:\nThis connects to broader principles in the field.\n\n**Think deeper**: Why do you think understanding the 'why' is more important than just knowing the 'what'?",
    ],
  },
  {
    keywords: ["how", "process", "steps"],
    responses: [
      "Here's a step-by-step breakdown:\n\n**Step 1: Preparation**\n- Gather necessary materials\n- Review prerequisites\n\n**Step 2: Execution**\n- Follow the core process\n- Monitor progress\n\n**Step 3: Verification**\n- Check results\n- Make adjustments if needed\n\n**Step 4: Completion**\n- Document findings\n- Apply learnings\n\n**Application question**: Which step do you think would be most challenging for you, and why?",
      "The process works like this:\n\n1. **Start**: Begin with the foundational concept\n2. **Build**: Add complexity gradually\n3. **Connect**: Link related ideas together\n4. **Apply**: Use in practical scenarios\n5. **Reflect**: Review and reinforce\n\nThis systematic approach ensures thorough understanding.\n\n**Self-assessment**: On a scale of 1-5, how confident do you feel about each of these steps?",
    ],
  },
]

const defaultResponses = [
  "Based on your study materials, I can provide some insights:\n\nThe concepts covered in your documents form a comprehensive foundation for understanding this subject. Key themes include theoretical frameworks, practical applications, and analytical methods.\n\n**Key Points to Remember**:\n1. Start with fundamentals before advancing\n2. Practice regularly to reinforce learning\n3. Connect new information to existing knowledge\n\n**Let's check your understanding**: What's the most important concept you've learned so far from these materials?",
  "That's a great question! Let me help:\n\nFrom analyzing your documents, I can see several important connections:\n\n**Main Ideas**:\n- The foundational concepts establish the groundwork\n- Building blocks connect to form larger understanding\n- Practical examples illustrate real-world usage\n\n**Recommendation**: Focus on understanding the 'why' behind each concept, not just the 'what'.\n\n**Quick quiz**: Can you explain one of these concepts in your own words?",
  "Here's what I found in your materials:\n\nThe documents cover essential topics that build upon each other progressively.\n\n**Structure of the Content**:\n1. **Introduction**: Core definitions and scope\n2. **Development**: Expanding on key principles\n3. **Application**: Practical use cases\n\n**Study Tip**: Try explaining these concepts to someone else - it's a great way to solidify your understanding!\n\n**Reflection**: Which topic from your materials do you find most challenging?",
]

const aiContinuousQuestions = [
  "Now that we've covered that, **what else would you like to explore?** I'm here to help you learn.",
  "**Interesting insight!** Would you like me to explain a related concept or move to a new topic?",
  "I hope that helps! **Is there anything specific you're still unsure about?** Let's clarify it together.",
  "**Great question!** Now, can you think of how this applies to your studies? Share your thoughts!",
  "**Let's keep the momentum going!** What's the next thing on your mind about this subject?",
  "I've answered your question. **Would you like a quiz on this topic** or should we explore something new?",
  "**Your turn to think!** Based on what we discussed, what questions come to mind?",
  "**Quick check**: Can you summarize what we just discussed in your own words?",
]

export function ChatPanel({ notebookId }: ChatPanelProps) {
  const {
    chatHistory,
    documents,
    selectedDocumentId,
    isAiLoading,
    addChatMessage,
    setAiLoading,
    setSelectedDocument,
    setHighlight,
    updateStreak,
  } = useAppStore()

  const messages = chatHistory[notebookId] || []
  const notebookDocs = documents[notebookId] || []
  const selectedDoc = notebookDocs.find((d) => d.documentId === selectedDocumentId)

  const [input, setInput] = useState("")
  /* 
   * FIXED: Use a bottom ref for reliable scrolling inside ScrollArea 
   */
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const inputRef = useRef<HTMLTextAreaElement>(null) // Restored inputRef
  const [conversationActive, setConversationActive] = useState(false) // Restored conversationActive
  const questionCountRef = useRef(0) // Restored questionCountRef

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isAiLoading, scrollToBottom])

  /* 
   * Replaced mock AI logic with real API integration
   */

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input.trim()
    if (!query || isAiLoading) return

    // Import API client dynamically if needed or use from outer scope. 
    // Assuming I will add the import at the top of the file separately or I should have done 'multi_replace'.
    // Since I can't easily add import with replace_file_content cleanly without viewing imports, 
    // I made sure to check the file. I need to add `import { api } from "@/lib/api"` at the top.

    setConversationActive(true)

    const userMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    }
    addChatMessage(notebookId, userMessage)
    setInput("")
    setAiLoading(true)

    updateStreak()

    try {
      // Dynamic import to avoid header issues if I don't edit top of file yet
      const { api } = await import("@/lib/api")

      // Filter context by selected document if available
      const contextFilter = selectedDoc ? selectedDoc.name : undefined
      const data = await api.ask(query, contextFilter)

      const aiMessage: ChatMessage = {
        id: `msg${Date.now() + 1}`,
        role: "assistant",
        content: data.answer,
        // For now, we don't have structured sources from backend, just text context
        sources: [],
        timestamp: new Date(),
      }

      addChatMessage(notebookId, aiMessage)
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate response. Check if backend is running.")

      // Fallback error message in chat
      const errorMessage: ChatMessage = {
        id: `msg${Date.now() + 1}`,
        role: "assistant",
        content: "I'm having trouble connecting to the brain (server). Please make sure the backend is running.",
        timestamp: new Date(),
      }
      addChatMessage(notebookId, errorMessage)
    } finally {
      setAiLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSourceClick = (source: Source) => {
    setSelectedDocument(source.documentId)
    setHighlight(source.page, source.snippetText || null)
    toast.info(`Jumping to page ${source.page}`)
  }

  const handleFollowUp = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Assistant
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedDoc ? `Context: ${selectedDoc.name}` : "Ask questions about your materials"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-border">
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              size="sm"
              className="text-xs gap-1"
              onClick={() => handleSend(action.prompt)}
              disabled={isAiLoading}
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </Button>
          ))}
          <QuizBuilderDialog
            notebookId={notebookId}
            trigger={
              <Button variant="secondary" size="sm" className="text-xs gap-1">
                <Brain className="h-3 w-3" />
                Quiz me
              </Button>
            }
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <Sparkles className="h-10 w-10 text-primary/50 mb-3" />
              <h3 className="font-medium text-foreground mb-1">Start a conversation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ask questions about your documents, request summaries, or generate quizzes.
              </p>
              <div className="space-y-2 w-full max-w-xs">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                {["Summarize my documents", "Do a deep research analysis", "Explain the key concepts"].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start gap-2 bg-transparent"
                    onClick={() => handleSend(q)}
                  >
                    <HelpCircle className="h-3 w-3" />
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[90%] rounded-lg p-3",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary/20 text-xs"
                              onClick={() => handleSourceClick(source)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {source.documentName} — p.{source.page}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.followUps && message.followUps.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground">Continue learning:</p>
                        {message.followUps.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleFollowUp(q)}
                            className="block text-xs text-primary hover:underline text-left"
                          >
                            → {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {message.role === "assistant" && (
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => toast.success("Saved to notes!")}
                        >
                          <BookmarkPlus className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="min-h-[44px] max-h-32 resize-none bg-secondary border-border"
            rows={1}
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || isAiLoading} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
