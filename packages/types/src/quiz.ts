export interface BaseQuiz {
    _id: string
    title: string
    description?: string
    questions: Question[]
    duration?: number
    difficulty: "easy" | "medium" | "hard"
    category: string
    tags: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Question {
    _id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
    difficulty: "easy" | "medium" | "hard"
    category: string
    tags: string[]
}

export interface QuizAttempt {
    _id: string
    userId: string
    quizId: string
    answers: Answer[]
    score: number
    startTime: Date
    endTime?: Date
    completed: boolean
}

export interface Answer {
    questionId: string
    selectedAnswer: number
    isCorrect: boolean
    timeSpent: number
}
