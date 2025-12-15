// Core data models for Smart Study Hub

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

export interface Notebook {
  id: string
  title: string
  subject: string
  progress: number
  lastUpdated: string
  examDate?: string
}

export interface Document {
  documentId: string
  name: string
  fileType: "pdf" | "ppt" | "docx" | "txt" | "url" // Added url type
  pages: number
  status: "processing" | "indexed"
  content?: string
  url?: string // Added url field for web links
}

export interface Source {
  documentId: string
  documentName: string
  page: number
  snippetId?: string
  snippetText?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  followUps?: string[]
  timestamp: Date
}

export interface QuizQuestion {
  questionId: string
  type: "mcq" | "tf" | "short"
  questionText: string
  options?: { id: string; text: string }[]
  correctOptionId?: string
  explanation?: string
  source?: { documentId: string; page: number }
}

export interface Quiz {
  quizId: string
  notebookId: string
  topic?: string
  difficulty: "easy" | "medium" | "hard"
  questions: QuizQuestion[]
  createdAt: Date
}

export interface QuizAnswer {
  questionId: string
  selectedOptionId?: string
  textAnswer?: string
  flagged?: boolean
}

export interface QuizResult {
  score: number
  perTopic: { topic: string; correct: number; total: number }[]
  wrongQuestions: string[]
}

export interface StudyTask {
  id: string
  title: string
  notebookId: string
  type: "review" | "quiz" | "read"
  dueDate: string
  completed: boolean
  priority?: "low" | "medium" | "high"
}

export interface CustomPlan {
  id: string
  title: string
  description?: string
  tasks: StudyTask[]
  createdAt: string
  targetDate?: string
}

export interface UserStats {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  weeklyActivity: { day: string; hours: number }[]
  streakDays: string[]
  skillLevels: { skill: string; level: number }[]
  monthlyGoals: { goal: string; current: number; target: number; editable?: boolean }[]
  completedNotebooks: string[]
  customDeadlines: Deadline[]
  unlockedAchievements: string[]
  totalQuizzesCompleted: number
  totalQuizScore: number
  totalQuizQuestions: number
}

export interface StudyMetrics {
  overallCoverage: number
  averageQuizAccuracy: number
  timeSpentMinutes: number
  quizzesTaken?: number
}

export interface Deadline {
  id: string
  title: string
  subject: string
  dueDate: string
  priority: "low" | "medium" | "high"
  completed: boolean
}
