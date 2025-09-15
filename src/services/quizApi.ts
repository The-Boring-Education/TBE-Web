import { config } from "@/config"

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
  detailedExplanation: string
}

export interface QuizSession {
  sessionId: string
  categoryName: string
  difficulty: string
  questionCount: number
  currentQuestionIndex: number
  currentQuestion: QuizQuestion | null
  progress: {
    answered: number
    total: number
    percentage: number
  }
}

export interface QuizResult {
  isCorrect: boolean
  explanation: string
  detailedExplanation?: string
  nextQuestion?: QuizQuestion
  isCompleted?: boolean
  progress: {
    answered: number
    total: number
    percentage: number
  }
}

export const quizApi = {
  // Get quiz categories
  getCategories: async () => {
    const response = await fetch(`${config.API_BASE_URL}/quiz`)
    if (!response.ok) throw new Error('Failed to fetch quiz categories')
    return response.json()
  },

  // Get quiz questions for a category
  getQuestions: async (quizId: string) => {
    const response = await fetch(`${config.API_BASE_URL}/quiz/${quizId}`)
    if (!response.ok) throw new Error('Failed to fetch quiz questions')
    return response.json()
  },

  // Start a quiz session
  startSession: async (payload: {
    userId: string
    quizId: string
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
    questionCount?: number
  }) => {
    const response = await fetch(`${config.API_BASE_URL}/quiz/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Failed to start quiz session')
    return response.json()
  },

  // Submit an answer
  submitAnswer: async (sessionId: string, payload: {
    questionIndex: number
    answer: number
    timeSpent: number
  }) => {
    const response = await fetch(`${config.API_BASE_URL}/quiz/session/${sessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Failed to submit answer')
    return response.json()
  },

  // Complete a quiz session
  completeSession: async (sessionId: string) => {
    const response = await fetch(`${config.API_BASE_URL}/quiz/session/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) throw new Error('Failed to complete quiz session')
    return response.json()
  },

  // Get user analytics
  getUserAnalytics: async (userId: string, categoryName?: string) => {
    const params = new URLSearchParams()
    if (categoryName) params.append('categoryName', categoryName)
    
    const response = await fetch(`${config.API_BASE_URL}/quiz/analytics/${userId}?${params}`)
    if (!response.ok) throw new Error('Failed to fetch user analytics')
    return response.json()
  },

  // Get leaderboard
  getLeaderboard: async (categoryName?: string, limit: number = 50) => {
    const params = new URLSearchParams()
    if (categoryName) params.append('categoryName', categoryName)
    params.append('limit', limit.toString())
    
    const response = await fetch(`${config.API_BASE_URL}/quiz/leaderboard?${params}`)
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    return response.json()
  },

  // Get user quiz sessions/history
  getUserSessions: async (userId: string, status?: string) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    
    const response = await fetch(`${config.API_BASE_URL}/quiz/sessions/${userId}?${params}`)
    if (!response.ok) throw new Error('Failed to fetch user sessions')
    return response.json()
  }
}