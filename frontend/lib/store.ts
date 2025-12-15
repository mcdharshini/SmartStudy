// Global state store using Zustand-like pattern with React Context

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  User,
  Notebook,
  Document,
  ChatMessage,
  Quiz,
  QuizAnswer,
  StudyTask,
  CustomPlan,
  UserStats,
  Deadline,
} from "./types"
import { mockUser, type mockStudyMetrics } from "./mock-data"

interface AppState {
  // Auth
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Notebooks
  notebooks: Notebook[]
  currentNotebook: Notebook | null

  // Documents
  documents: Record<string, Document[]>
  selectedDocumentId: string | null
  highlightedPage: number | null
  highlightedSnippet: string | null

  // Chat
  chatHistory: Record<string, ChatMessage[]>
  isAiLoading: boolean

  // Quiz
  quizzes: Quiz[]
  currentQuiz: Quiz | null
  quizAnswers: QuizAnswer[]

  // Study Plan
  studyTasks: StudyTask[]
  studyMetrics: typeof mockStudyMetrics

  customPlans: CustomPlan[]
  userStats: UserStats

  studySessionStart: number | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void

  setCurrentNotebook: (notebook: Notebook | null) => void
  createNotebook: (title: string, subject: string, examDate?: string) => Notebook
  deleteNotebook: (notebookId: string) => void
  completeNotebook: (notebookId: string) => void

  addDocument: (notebookId: string, doc: Document) => void
  updateDocument: (notebookId: string, docId: string, updates: Partial<Document>) => void
  deleteDocument: (notebookId: string, docId: string) => void
  setSelectedDocument: (docId: string | null) => void
  setHighlight: (page: number | null, snippet: string | null) => void

  addChatMessage: (notebookId: string, message: ChatMessage) => void
  setAiLoading: (loading: boolean) => void

  createQuiz: (quiz: Quiz) => void
  setCurrentQuiz: (quiz: Quiz | null) => void
  setQuizAnswer: (answer: QuizAnswer) => void
  clearQuizAnswers: () => void
  submitQuiz: (correctAnswers: number, totalQuestions: number) => void

  toggleTaskComplete: (taskId: string) => void
  addTask: (task: StudyTask) => void
  updateTask: (taskId: string, updates: Partial<StudyTask>) => void
  deleteTask: (taskId: string) => void

  createCustomPlan: (plan: Omit<CustomPlan, "id" | "createdAt">) => CustomPlan
  updateCustomPlan: (planId: string, updates: Partial<CustomPlan>) => void
  deleteCustomPlan: (planId: string) => void

  updateStreak: () => void
  updateSkillLevel: (skill: string, level: number) => void
  updateMonthlyGoal: (goalIndex: number, current: number, target?: number) => void
  addMonthlyGoal: (goal: string, target: number) => void
  deleteMonthlyGoal: (goalIndex: number) => void
  logStudyTime: (minutes: number) => void

  addDeadline: (deadline: Omit<Deadline, "id">) => void
  updateDeadline: (deadlineId: string, updates: Partial<Deadline>) => void
  deleteDeadline: (deadlineId: string) => void
  completeDeadline: (deadlineId: string) => void

  startStudySession: () => void
  endStudySession: () => void

  checkAndUnlockAchievements: () => void
}

const initialUserStats: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  weeklyActivity: [
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ],
  streakDays: [],
  skillLevels: [],
  monthlyGoals: [
    { goal: "Complete 20 quizzes", current: 0, target: 20, editable: true },
    { goal: "Study 40 hours", current: 0, target: 40, editable: true },
    { goal: "Review all notebooks", current: 0, target: 1, editable: true },
  ],
  completedNotebooks: [],
  customDeadlines: [],
  unlockedAchievements: [],
  totalQuizzesCompleted: 0,
  totalQuizScore: 0,
  totalQuizQuestions: 0,
}

const emptyStudyMetrics = {
  overallCoverage: 0,
  averageQuizAccuracy: 0,
  timeSpentMinutes: 0,
  quizzesTaken: 0,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      notebooks: [],
      currentNotebook: null,

      documents: {},
      selectedDocumentId: null,
      highlightedPage: null,
      highlightedSnippet: null,

      chatHistory: {},
      isAiLoading: false,

      quizzes: [],
      currentQuiz: null,
      quizAnswers: [],

      studyTasks: [],
      studyMetrics: emptyStudyMetrics,

      customPlans: [],
      userStats: initialUserStats,
      studySessionStart: null,

      // Auth actions
      login: async (email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (email && password) {
          const today = new Date().toISOString().split("T")[0]

          set({
            user: { ...mockUser, email },
            token: "mock-jwt-token",
            isAuthenticated: true,
          })
          get().startStudySession()
          get().updateStreak()
          return true
        }
        return false
      },

      logout: () => {
        get().endStudySession()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          currentNotebook: null,
        })
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }))
      },

      // Notebook actions
      setCurrentNotebook: (notebook) => set({ currentNotebook: notebook }),

      createNotebook: (title, subject, examDate) => {
        const newNotebook: Notebook = {
          id: `nb${Date.now()}`,
          title,
          subject,
          progress: 0,
          lastUpdated: new Date().toISOString(),
          examDate,
        }
        const newTask: StudyTask = {
          id: `task${Date.now()}`,
          title: `Study: ${title}`,
          notebookId: newNotebook.id,
          type: "read",
          dueDate: examDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          priority: "medium",
        }

        set((state) => {
          const existingSkillIndex = state.userStats.skillLevels.findIndex((s) => s.skill === subject)
          const updatedSkillLevels = [...state.userStats.skillLevels]

          if (existingSkillIndex === -1 && subject) {
            updatedSkillLevels.push({ skill: subject, level: 5 })
          }

          const newNotebooksCount = state.notebooks.length + 1

          return {
            notebooks: [...state.notebooks, newNotebook],
            documents: { ...state.documents, [newNotebook.id]: [] },
            chatHistory: { ...state.chatHistory, [newNotebook.id]: [] },
            studyTasks: [...state.studyTasks, newTask],
            userStats: {
              ...state.userStats,
              skillLevels: updatedSkillLevels,
              monthlyGoals: state.userStats.monthlyGoals.map((g, i) =>
                i === 2 ? { ...g, target: newNotebooksCount } : g,
              ),
            },
          }
        })
        get().updateStreak()
        return newNotebook
      },

      deleteNotebook: (notebookId) => {
        set((state) => {
          const { [notebookId]: removedDocs, ...remainingDocs } = state.documents
          const { [notebookId]: removedChat, ...remainingChat } = state.chatHistory
          return {
            notebooks: state.notebooks.filter((nb) => nb.id !== notebookId),
            documents: remainingDocs,
            chatHistory: remainingChat,
            studyTasks: state.studyTasks.filter((t) => t.notebookId !== notebookId),
            currentNotebook: state.currentNotebook?.id === notebookId ? null : state.currentNotebook,
          }
        })
      },

      completeNotebook: (notebookId) => {
        const notebook = get().notebooks.find((nb) => nb.id === notebookId)

        set((state) => {
          const isAlreadyCompleted = state.userStats.completedNotebooks.includes(notebookId)
          if (isAlreadyCompleted) return state

          const updatedSkillLevels = [...state.userStats.skillLevels]
          if (notebook?.subject) {
            const skillIndex = updatedSkillLevels.findIndex((s) => s.skill === notebook.subject)
            if (skillIndex !== -1) {
              updatedSkillLevels[skillIndex] = {
                ...updatedSkillLevels[skillIndex],
                level: Math.min(100, updatedSkillLevels[skillIndex].level + 20),
              }
            }
          }

          const completedCount = state.userStats.completedNotebooks.length + 1
          const totalNotebooks = state.notebooks.length
          const newCoverage = totalNotebooks > 0 ? completedCount / totalNotebooks : 0

          return {
            notebooks: state.notebooks.map((nb) => (nb.id === notebookId ? { ...nb, progress: 1 } : nb)),
            studyTasks: state.studyTasks.map((t) => (t.notebookId === notebookId ? { ...t, completed: true } : t)),
            userStats: {
              ...state.userStats,
              completedNotebooks: [...state.userStats.completedNotebooks, notebookId],
              skillLevels: updatedSkillLevels,
              monthlyGoals: state.userStats.monthlyGoals.map((g, i) =>
                i === 2 ? { ...g, current: g.current + 1 } : g,
              ),
            },
            studyMetrics: {
              ...state.studyMetrics,
              overallCoverage: newCoverage,
            },
          }
        })
        get().updateStreak()
        get().checkAndUnlockAchievements()
      },

      // Document actions
      addDocument: (notebookId, doc) => {
        set((state) => ({
          documents: {
            ...state.documents,
            [notebookId]: [...(state.documents[notebookId] || []), doc],
          },
        }))
        get().updateStreak()
      },

      updateDocument: (notebookId, docId, updates) => {
        set((state) => ({
          documents: {
            ...state.documents,
            [notebookId]: (state.documents[notebookId] || []).map((doc) =>
              doc.documentId === docId ? { ...doc, ...updates } : doc,
            ),
          },
        }))
      },

      deleteDocument: (notebookId, docId) => {
        set((state) => ({
          documents: {
            ...state.documents,
            [notebookId]: (state.documents[notebookId] || []).filter((doc) => doc.documentId !== docId),
          },
        }))
      },

      setSelectedDocument: (docId) => set({ selectedDocumentId: docId }),

      setHighlight: (page, snippet) =>
        set({
          highlightedPage: page,
          highlightedSnippet: snippet,
        }),

      // Chat actions
      addChatMessage: (notebookId, message) => {
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [notebookId]: [...(state.chatHistory[notebookId] || []), message],
          },
        }))
        get().updateStreak()
      },

      setAiLoading: (loading) => set({ isAiLoading: loading }),

      // Quiz actions
      createQuiz: (quiz) => {
        set((state) => ({
          quizzes: [...state.quizzes, quiz],
        }))
        get().updateStreak()
      },

      setCurrentQuiz: (quiz) => set({ currentQuiz: quiz, quizAnswers: [] }),

      setQuizAnswer: (answer) => {
        set((state) => {
          const existing = state.quizAnswers.findIndex((a) => a.questionId === answer.questionId)
          if (existing >= 0) {
            const updated = [...state.quizAnswers]
            updated[existing] = answer
            return { quizAnswers: updated }
          }
          return { quizAnswers: [...state.quizAnswers, answer] }
        })
      },

      clearQuizAnswers: () => set({ quizAnswers: [] }),

      submitQuiz: (correctAnswers: number, totalQuestions: number) => {
        const { currentQuiz, notebooks } = get()
        const notebook = notebooks.find((nb) => nb.id === currentQuiz?.notebookId)

        set((state) => {
          const newTotalQuizzes = state.userStats.totalQuizzesCompleted + 1
          const newTotalScore = state.userStats.totalQuizScore + correctAnswers
          const newTotalQuestions = state.userStats.totalQuizQuestions + totalQuestions
          const newAccuracy = newTotalQuestions > 0 ? newTotalScore / newTotalQuestions : 0

          const updatedSkillLevels = [...state.userStats.skillLevels]
          if (notebook?.subject) {
            const skillIndex = updatedSkillLevels.findIndex((s) => s.skill === notebook.subject)
            const performanceBoost = Math.round((correctAnswers / totalQuestions) * 10)
            if (skillIndex !== -1) {
              updatedSkillLevels[skillIndex] = {
                ...updatedSkillLevels[skillIndex],
                level: Math.min(100, updatedSkillLevels[skillIndex].level + performanceBoost),
              }
            }
          }

          return {
            userStats: {
              ...state.userStats,
              totalQuizzesCompleted: newTotalQuizzes,
              totalQuizScore: newTotalScore,
              totalQuizQuestions: newTotalQuestions,
              skillLevels: updatedSkillLevels,
              monthlyGoals: state.userStats.monthlyGoals.map((g, i) =>
                i === 0 ? { ...g, current: g.current + 1 } : g,
              ),
            },
            studyMetrics: {
              ...state.studyMetrics,
              quizzesTaken: (state.studyMetrics.quizzesTaken || 0) + 1,
              averageQuizAccuracy: newAccuracy,
            },
          }
        })
        get().updateStreak()
        get().checkAndUnlockAchievements()
      },

      // Study plan actions
      toggleTaskComplete: (taskId) => {
        set((state) => ({
          studyTasks: state.studyTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task,
          ),
        }))
        get().updateStreak()
        get().checkAndUnlockAchievements()
      },

      addTask: (task) => {
        set((state) => ({
          studyTasks: [...state.studyTasks, { ...task, priority: task.priority || "medium" }],
        }))
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          studyTasks: state.studyTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        }))
      },

      deleteTask: (taskId) => {
        set((state) => ({
          studyTasks: state.studyTasks.filter((task) => task.id !== taskId),
        }))
      },

      createCustomPlan: (planData) => {
        const newPlan: CustomPlan = {
          id: `plan${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...planData,
        }
        set((state) => ({
          customPlans: [...state.customPlans, newPlan],
          studyTasks: [...state.studyTasks, ...planData.tasks],
        }))
        get().updateStreak()
        return newPlan
      },

      updateCustomPlan: (planId, updates) => {
        set((state) => ({
          customPlans: state.customPlans.map((plan) => (plan.id === planId ? { ...plan, ...updates } : plan)),
        }))
      },

      deleteCustomPlan: (planId) => {
        set((state) => {
          const plan = state.customPlans.find((p) => p.id === planId)
          const taskIds = plan?.tasks.map((t) => t.id) || []
          return {
            customPlans: state.customPlans.filter((p) => p.id !== planId),
            studyTasks: state.studyTasks.filter((t) => !taskIds.includes(t.id)),
          }
        })
      },

      updateStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split("T")[0]
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

          let newStreak = state.userStats.currentStreak
          let streakDays = [...(state.userStats.streakDays || [])]

          if (state.userStats.lastActiveDate === today) {
            // Already active today, no change
            if (!streakDays.includes(today)) {
              streakDays.push(today)
            }
            return state
          } else if (state.userStats.lastActiveDate === yesterday) {
            // Consecutive day - increase streak
            newStreak = state.userStats.currentStreak + 1
          } else if (state.userStats.lastActiveDate !== today) {
            // Streak broken or first activity
            newStreak = 1
          }

          // Add today to streak days
          if (!streakDays.includes(today)) {
            streakDays.push(today)
          }

          // Keep only last 30 days of streak data
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          streakDays = streakDays.filter((d) => d >= thirtyDaysAgo)

          return {
            userStats: {
              ...state.userStats,
              currentStreak: newStreak,
              longestStreak: Math.max(state.userStats.longestStreak, newStreak),
              lastActiveDate: today,
              streakDays,
            },
          }
        })
        get().checkAndUnlockAchievements()
      },

      updateSkillLevel: (skill, level) => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            skillLevels: state.userStats.skillLevels.map((s) =>
              s.skill === skill ? { ...s, level: Math.min(100, level) } : s,
            ),
          },
        }))
      },

      updateMonthlyGoal: (goalIndex, current, target) => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            monthlyGoals: state.userStats.monthlyGoals.map((g, i) =>
              i === goalIndex ? { ...g, current, ...(target !== undefined ? { target } : {}) } : g,
            ),
          },
        }))
      },

      addMonthlyGoal: (goal, target) => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            monthlyGoals: [...state.userStats.monthlyGoals, { goal, current: 0, target, editable: true }],
          },
        }))
      },

      deleteMonthlyGoal: (goalIndex) => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            monthlyGoals: state.userStats.monthlyGoals.filter((_, i) => i !== goalIndex),
          },
        }))
      },

      logStudyTime: (minutes) => {
        set((state) => {
          const today = new Date()
          const dayIndex = (today.getDay() + 6) % 7
          const hours = minutes / 60

          return {
            studyMetrics: {
              ...state.studyMetrics,
              timeSpentMinutes: state.studyMetrics.timeSpentMinutes + minutes,
            },
            userStats: {
              ...state.userStats,
              weeklyActivity: state.userStats.weeklyActivity.map((d, i) =>
                i === dayIndex ? { ...d, hours: d.hours + hours } : d,
              ),
              monthlyGoals: state.userStats.monthlyGoals.map((g, i) =>
                i === 1 ? { ...g, current: g.current + hours } : g,
              ),
            },
          }
        })
        get().updateStreak()
      },

      addDeadline: (deadline) => {
        const newDeadline: Deadline = {
          id: `deadline${Date.now()}`,
          ...deadline,
        }
        set((state) => ({
          userStats: {
            ...state.userStats,
            customDeadlines: [...state.userStats.customDeadlines, newDeadline],
          },
        }))
      },

      updateDeadline: (deadlineId, updates) => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            customDeadlines: state.userStats.customDeadlines.map((d) =>
              d.id === deadlineId ? { ...d, ...updates } : d,
            ),
          },
        }))
      },

      deleteDeadline: (deadlineId) => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            customDeadlines: state.userStats.customDeadlines.filter((d) => d.id !== deadlineId),
          },
        }))
      },

      completeDeadline: (deadlineId) => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            customDeadlines: state.userStats.customDeadlines.map((d) =>
              d.id === deadlineId ? { ...d, completed: true } : d,
            ),
          },
        }))
        get().updateStreak()
        get().checkAndUnlockAchievements()
      },

      startStudySession: () => {
        set({ studySessionStart: Date.now() })
      },

      endStudySession: () => {
        const { studySessionStart, logStudyTime } = get()
        if (studySessionStart) {
          const minutes = Math.round((Date.now() - studySessionStart) / 60000)
          if (minutes > 0) {
            logStudyTime(minutes)
          }
        }
        set({ studySessionStart: null })
      },

      checkAndUnlockAchievements: () => {
        const state = get()
        const { userStats, studyMetrics, notebooks, documents, studyTasks } = state
        const unlocked = [...(userStats.unlockedAchievements || [])]
        const totalDocs = Object.values(documents).reduce((sum, docs) => sum + (docs?.length || 0), 0)
        const completedTasks = studyTasks.filter((t) => t.completed).length

        const achievementChecks = [
          { id: "daily-learner", condition: userStats.currentStreak >= 1 },
          { id: "first-quiz", condition: (studyMetrics?.quizzesTaken || 0) >= 1 },
          { id: "bookworm", condition: totalDocs >= 10 },
          { id: "week-warrior", condition: userStats.currentStreak >= 7 },
          { id: "quiz-master", condition: (studyMetrics?.quizzesTaken || 0) >= 5 },
          { id: "scholar", condition: (userStats.completedNotebooks?.length || 0) >= 3 },
          { id: "speed-learner", condition: (studyMetrics?.timeSpentMinutes || 0) >= 3000 },
          { id: "quiz-perfectionist", condition: (studyMetrics?.averageQuizAccuracy || 0) >= 0.9 },
          { id: "task-master", condition: completedTasks >= 10 },
        ]

        achievementChecks.forEach(({ id, condition }) => {
          if (condition && !unlocked.includes(id)) {
            unlocked.push(id)
          }
        })

        if (unlocked.length !== userStats.unlockedAchievements?.length) {
          set((state) => ({
            userStats: {
              ...state.userStats,
              unlockedAchievements: unlocked,
            },
          }))
        }
      },
    }),
    {
      name: "smart-study-hub-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        notebooks: state.notebooks,
        documents: state.documents,
        chatHistory: state.chatHistory,
        quizzes: state.quizzes,
        studyTasks: state.studyTasks,
        studyMetrics: state.studyMetrics,
        customPlans: state.customPlans,
        userStats: state.userStats,
      }),
    },
  ),
)
