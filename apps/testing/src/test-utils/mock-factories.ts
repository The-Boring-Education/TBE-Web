/**
 * Factory functions to create mock data for tests
 */

export interface MockUser {
    id: string;
    email: string;
    name: string;
    username?: string;
    image?: string | null;
    role?: 'user' | 'admin';
    createdAt?: Date;
}

export interface MockQuiz {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questions: MockQuestion[];
    timeLimit?: number;
    category: string;
}

export interface MockQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface MockQuizAttempt {
    id: string;
    userId: string;
    quizId: string;
    score: number;
    answers: Record<string, number>;
    completedAt: Date;
    timeTaken: number;
}

/**
 * Create a mock user
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
    return {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        image: null,
        role: 'user',
        createdAt: new Date(),
        ...overrides
    };
}

/**
 * Create a mock admin user
 */
export function createMockAdmin(overrides?: Partial<MockUser>): MockUser {
    return createMockUser({
        role: 'admin',
        email: 'admin@example.com',
        name: 'Admin User',
        username: 'adminuser',
        ...overrides
    });
}

/**
 * Create a mock question
 */
export function createMockQuestion(overrides?: Partial<MockQuestion>): MockQuestion {
    return {
        id: `question-${Math.random().toString(36).substr(2, 9)}`,
        question: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
        explanation: 'Basic arithmetic: 2 + 2 = 4',
        difficulty: 'easy',
        ...overrides
    };
}

/**
 * Create a mock quiz
 */
export function createMockQuiz(overrides?: Partial<MockQuiz>): MockQuiz {
    return {
        id: `quiz-${Math.random().toString(36).substr(2, 9)}`,
        title: 'Test Quiz',
        description: 'A test quiz for unit testing',
        difficulty: 'medium',
        category: 'general',
        questions: [
            createMockQuestion(),
            createMockQuestion({ difficulty: 'medium' }),
            createMockQuestion({ difficulty: 'hard' })
        ],
        timeLimit: 30,
        ...overrides
    };
}

/**
 * Create a mock quiz attempt
 */
export function createMockQuizAttempt(
    overrides?: Partial<MockQuizAttempt>
): MockQuizAttempt {
    return {
        id: `attempt-${Math.random().toString(36).substr(2, 9)}`,
        userId: 'user-123',
        quizId: 'quiz-123',
        score: 75,
        answers: { 'q1': 0, 'q2': 1, 'q3': 2 },
        completedAt: new Date(),
        timeTaken: 300,
        ...overrides
    };
}

/**
 * Create multiple mock users
 */
export function createMockUsers(count: number): MockUser[] {
    return Array.from({ length: count }, (_, i) =>
        createMockUser({
            id: `user-${i}`,
            email: `user${i}@example.com`,
            name: `User ${i}`
        })
    );
}

/**
 * Create multiple mock quizzes
 */
export function createMockQuizzes(count: number): MockQuiz[] {
    return Array.from({ length: count }, (_, i) =>
        createMockQuiz({
            id: `quiz-${i}`,
            title: `Quiz ${i}`,
            difficulty: ['easy', 'medium', 'hard'][i % 3] as any
        })
    );
}
