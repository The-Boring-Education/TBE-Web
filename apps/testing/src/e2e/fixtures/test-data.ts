/**
 * Test data fixtures for E2E tests
 */

export const testUsers = {
    validUser: {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
    },
    adminUser: {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        name: 'Admin User',
        role: 'admin'
    },
    newUser: {
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        name: 'New Test User'
    }
};

export const testQuizzes = {
    easyQuiz: {
        id: 'easy-quiz-1',
        title: 'JavaScript Basics',
        difficulty: 'easy',
        timeLimit: 10
    },
    mediumQuiz: {
        id: 'medium-quiz-1',
        title: 'React Fundamentals',
        difficulty: 'medium',
        timeLimit: 20
    },
    hardQuiz: {
        id: 'hard-quiz-1',
        title: 'Advanced TypeScript',
        difficulty: 'hard',
        timeLimit: 30
    }
};

export const testURLs = {
    platform: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    quizes: process.env.QUIZ_APP_URL || 'http://localhost:3002',
    prepYatra: process.env.PREPYATRA_APP_URL || 'http://localhost:3001',
    api: process.env.API_URL || 'http://localhost:3004'
};
