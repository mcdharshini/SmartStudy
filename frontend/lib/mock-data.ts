// Mock data for Smart Study Hub demo mode

import type { Notebook, Document, ChatMessage, Quiz, StudyTask, StudyMetrics } from "./types"

export const mockUser = {
  id: "user1",
  name: "Alex Chen",
  email: "alex@university.edu",
}

export const mockNotebooks: Notebook[] = [
  {
    id: "nb1",
    title: "Machine Learning - Unit 2",
    subject: "ML",
    progress: 0.4,
    lastUpdated: "2025-01-05T10:30:00Z",
    examDate: "2025-02-15",
  },
  {
    id: "nb2",
    title: "Data Structures & Algorithms",
    subject: "CS",
    progress: 0.75,
    lastUpdated: "2025-01-04T15:45:00Z",
  },
  {
    id: "nb3",
    title: "Linear Algebra Fundamentals",
    subject: "Math",
    progress: 0.25,
    lastUpdated: "2025-01-03T09:00:00Z",
    examDate: "2025-02-20",
  },
]

export const mockDocuments: Record<string, Document[]> = {
  nb1: [
    {
      documentId: "doc1",
      name: "ML_Unit2_Lecture3.pdf",
      fileType: "pdf",
      pages: 25,
      status: "indexed",
      content:
        "Machine Learning fundamentals including supervised learning, unsupervised learning, and neural networks...",
    },
    {
      documentId: "doc2",
      name: "Neural_Networks_Slides.ppt",
      fileType: "ppt",
      pages: 42,
      status: "indexed",
      content: "Deep learning architectures, backpropagation, activation functions...",
    },
  ],
  nb2: [
    {
      documentId: "doc3",
      name: "Trees_and_Graphs.pdf",
      fileType: "pdf",
      pages: 30,
      status: "indexed",
      content: "Binary trees, AVL trees, graph traversal algorithms...",
    },
  ],
  nb3: [
    {
      documentId: "doc4",
      name: "Matrix_Operations.docx",
      fileType: "docx",
      pages: 15,
      status: "processing",
    },
  ],
}

export const mockChatHistory: Record<string, ChatMessage[]> = {
  nb1: [
    {
      id: "msg1",
      role: "user",
      content: "What is overfitting in machine learning?",
      timestamp: new Date("2025-01-05T10:00:00Z"),
    },
    {
      id: "msg2",
      role: "assistant",
      content:
        "Overfitting is when a model learns noise in training data and fails to generalize. Example: A polynomial of very high degree fits training points exactly but performs poorly on test data. This happens when the model is too complex relative to the amount and noisiness of the training data.",
      sources: [
        {
          documentId: "doc1",
          documentName: "ML_Unit2_Lecture3.pdf",
          page: 12,
          snippetId: "snip1",
          snippetText:
            "Overfitting occurs when a model learns the detail and noise in the training data to the extent that it negatively impacts the performance of the model on new data.",
        },
      ],
      followUps: ["How to detect overfitting?", "What is regularization?", "Explain bias-variance tradeoff"],
      timestamp: new Date("2025-01-05T10:00:05Z"),
    },
  ],
}

export const mockQuizzes: Quiz[] = [
  {
    quizId: "quiz1",
    notebookId: "nb1",
    topic: "Overfitting & Regularization",
    difficulty: "medium",
    questions: [
      {
        questionId: "q1",
        type: "mcq",
        questionText: "Which of the following is a sign of overfitting?",
        options: [
          { id: "a", text: "High training accuracy, low test accuracy" },
          { id: "b", text: "Low training accuracy, high test accuracy" },
          { id: "c", text: "Both training and test accuracy are low" },
          { id: "d", text: "Both training and test accuracy are equal" },
        ],
        correctOptionId: "a",
        explanation: "Overfitting occurs when a model performs well on training data but poorly on unseen test data.",
        source: { documentId: "doc1", page: 12 },
      },
      {
        questionId: "q2",
        type: "tf",
        questionText: "Regularization helps prevent overfitting by adding a penalty term to the loss function.",
        options: [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ],
        correctOptionId: "true",
        explanation: "Regularization adds constraints to the model to prevent it from becoming too complex.",
      },
      {
        questionId: "q3",
        type: "mcq",
        questionText: "What is L2 regularization also known as?",
        options: [
          { id: "a", text: "Lasso" },
          { id: "b", text: "Ridge" },
          { id: "c", text: "Elastic Net" },
          { id: "d", text: "Dropout" },
        ],
        correctOptionId: "b",
        explanation:
          "L2 regularization adds the squared magnitude of coefficients as a penalty and is called Ridge regression.",
        source: { documentId: "doc1", page: 15 },
      },
    ],
    createdAt: new Date("2025-01-05T11:00:00Z"),
  },
]

export const mockStudyTasks: StudyTask[] = [
  {
    id: "task1",
    title: "Review Overfitting concepts",
    notebookId: "nb1",
    type: "review",
    dueDate: "2025-01-06",
    completed: false,
  },
  {
    id: "task2",
    title: "Take Neural Networks Quiz",
    notebookId: "nb1",
    type: "quiz",
    dueDate: "2025-01-07",
    completed: false,
  },
  {
    id: "task3",
    title: "Read Trees chapter",
    notebookId: "nb2",
    type: "read",
    dueDate: "2025-01-06",
    completed: true,
  },
]

export const mockStudyMetrics: StudyMetrics = {
  overallCoverage: 0.45,
  averageQuizAccuracy: 0.72,
  timeSpentMinutes: 320,
}

// Sample AI responses for different query types
export const mockAIResponses: Record<
  string,
  { answer: string; sources: Array<{ documentId: string; documentName: string; page: number; snippetText: string }> }
> = {
  default: {
    answer:
      "Based on your course materials, I can help explain this concept. Let me analyze the relevant sections from your documents.",
    sources: [],
  },
  summarize: {
    answer:
      "Here's a summary of the key concepts from this document:\n\n1. **Core Concepts**: The document covers fundamental principles and their applications.\n2. **Key Formulas**: Important mathematical relationships are presented.\n3. **Examples**: Practical examples demonstrate real-world applications.\n4. **Practice Problems**: The document includes exercises for self-assessment.",
    sources: [
      {
        documentId: "doc1",
        documentName: "ML_Unit2_Lecture3.pdf",
        page: 1,
        snippetText: "This lecture covers the fundamentals of machine learning...",
      },
    ],
  },
  explain: {
    answer:
      "Let me explain this in simpler terms:\n\nImagine you're teaching a robot to recognize cats. If you show it too many pictures of YOUR cat, it might think all cats look exactly like yours. That's overfitting - the robot learned too specifically.\n\nA good learner should recognize ALL cats, not just the ones it trained on. We want our models to generalize well to new examples they haven't seen before.",
    sources: [
      {
        documentId: "doc1",
        documentName: "ML_Unit2_Lecture3.pdf",
        page: 12,
        snippetText: "Overfitting occurs when...",
      },
    ],
  },
}
