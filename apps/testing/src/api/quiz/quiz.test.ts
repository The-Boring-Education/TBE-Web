import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { createMockQuiz } from '@test-utils/mock-factories';

/**
 * Example API test for quiz endpoints
 * This demonstrates how to test complex API operations
 */

describe('Quiz API', () => {
    const API_URL = process.env.API_URL || 'http://localhost:3004';

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    describe('GET /api/v1/quiz/:id', () => {
        it('should get quiz by id with questions', async () => {
            const quizId = 'quiz-123';
            const response = await fetch(`${API_URL}/api/v1/quiz/${quizId}`);

            expect(response.ok).toBe(true);

            const data = await response.json();
            expect(data).toHaveValidAPIResponse();
            expect(data.status).toBe(true);
            expect(data.data.id).toBe(quizId);
            expect(data.data.questions).toBeInstanceOf(Array);
            expect(data.data.questions.length).toBeGreaterThan(0);
        });

        it('should return quiz with valid structure', async () => {
            const response = await fetch(`${API_URL}/api/v1/quiz/quiz-123`);
            const data = await response.json();

            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('title');
            expect(data.data).toHaveProperty('description');
            expect(data.data).toHaveProperty('questions');

            // Validate question structure
            const question = data.data.questions[0];
            expect(question).toHaveProperty('id');
            expect(question).toHaveProperty('question');
            expect(question).toHaveProperty('options');
            expect(question).toHaveProperty('correctAnswer');
        });
    });

    describe('POST /api/v1/quiz/submit', () => {
        it('should submit quiz answers and get score', async () => {
            const submission = {
                quizId: 'quiz-123',
                userId: 'user-123',
                answers: {
                    q1: 2,
                    q2: 1,
                    q3: 3
                }
            };

            const response = await fetch(`${API_URL}/api/v1/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });

            expect(response.ok).toBe(true);

            const data = await response.json();
            expect(data).toHaveValidAPIResponse();
            expect(data.status).toBe(true);
            expect(data.data).toHaveProperty('score');
            expect(data.data).toHaveProperty('totalQuestions');
            expect(data.data).toHaveProperty('correctAnswers');
            expect(data.data).toHaveProperty('attemptId');
        });

        it('should return valid score calculation', async () => {
            const submission = {
                quizId: 'quiz-123',
                answers: {}
            };

            const response = await fetch(`${API_URL}/api/v1/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });

            const data = await response.json();
            expect(data.data.score).toBeGreaterThanOrEqual(0);
            expect(data.data.score).toBeLessThanOrEqual(100);
            expect(data.data.correctAnswers).toBeLessThanOrEqual(
                data.data.totalQuestions
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            const response = await fetch(`${API_URL}/api/v1/error`);

            expect(response.ok).toBe(false);
            expect(response.status).toBe(500);

            const data = await response.json();
            expect(data.status).toBe(false);
            expect(data.message).toBeTruthy();
        });
    });
});
