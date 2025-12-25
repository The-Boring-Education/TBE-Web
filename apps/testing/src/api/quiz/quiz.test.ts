import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createMockRequest, createMockResponse, executeHandler } from '../utils/api-test-helpers';

// Mock database functions
vi.mock('@/lib/database', () => ({
    getQuizCategoriesFromDB: vi.fn(),
    getQuizCategoriesWithCountsFromDB: vi.fn(),
    addAQuizToDB: vi.fn(),
    appendQuestionsToQuizInDB: vi.fn(),
}));

// Mock middleware
vi.mock('@/middleware/api', () => ({
    connectDB: vi.fn().mockResolvedValue(undefined),
}));

// Mock CORS
vi.mock('@/lib/utils', async () => {
    const actual = await vi.importActual('@/lib/utils');
    return {
        ...actual,
        cors: vi.fn().mockImplementation(async (req: any, res: any) => {
            // Mock CORS - just pass through
            return Promise.resolve();
        }),
    };
});

// Import handler after mocks
import handler from '../../../../api/src/pages/api/v1/quiz/index';
import {
    getQuizCategoriesFromDB,
    getQuizCategoriesWithCountsFromDB,
    addAQuizToDB,
    appendQuestionsToQuizInDB,
} from '@/lib/database';

describe('Quiz API - /api/v1/quiz', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/quiz - Get Quiz Categories', () => {
        it('should return quiz categories successfully', async () => {
            const mockCategories = [
                { _id: '1', categoryName: 'JavaScript', categoryDescription: 'JS Quiz', categoryIcon: 'js-icon', isActive: true },
                { _id: '2', categoryName: 'React', categoryDescription: 'React Quiz', categoryIcon: 'react-icon', isActive: true },
            ];

            vi.mocked(getQuizCategoriesFromDB).mockResolvedValue({
                data: mockCategories,
                error: null,
            });

            const req = createMockRequest('GET');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(200);
            expect(result.data.success).toBe(true);
            expect(result.data.data).toEqual(mockCategories);
            expect(getQuizCategoriesFromDB).toHaveBeenCalledWith(false);
        });

        it('should return quiz categories with counts when withCounts=true', async () => {
            const mockCategoriesWithCounts = [
                { _id: '1', categoryName: 'JavaScript', questionCount: 50 },
                { _id: '2', categoryName: 'React', questionCount: 30 },
            ];

            vi.mocked(getQuizCategoriesWithCountsFromDB).mockResolvedValue({
                data: mockCategoriesWithCounts,
                error: null,
            });

            const req = createMockRequest('GET', undefined, { withCounts: 'true' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(200);
            expect(result.data.success).toBe(true);
            expect(result.data.data).toEqual(mockCategoriesWithCounts);
            expect(getQuizCategoriesWithCountsFromDB).toHaveBeenCalledWith(false);
        });

        it('should include inactive quizzes when includeInactive=true', async () => {
            const mockCategories = [{ _id: '1', categoryName: 'JavaScript', isActive: false }];

            vi.mocked(getQuizCategoriesFromDB).mockResolvedValue({
                data: mockCategories,
                error: null,
            });

            const req = createMockRequest('GET', undefined, { includeInactive: 'true' });
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(200);
            expect(getQuizCategoriesFromDB).toHaveBeenCalledWith(true);
        });

        it('should handle database errors gracefully', async () => {
            vi.mocked(getQuizCategoriesFromDB).mockResolvedValue({
                data: null,
                error: 'Database connection failed',
            });

            const req = createMockRequest('GET');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(400);
            expect(result.data.error).toBe('Database connection failed');
        });
    });

    describe('POST /api/v1/quiz - Create Quiz', () => {
        it('should create a new quiz successfully', async () => {
            const mockQuizData = {
                categoryName: 'TypeScript',
                categoryDescription: 'TypeScript Fundamentals Quiz',
                categoryIcon: 'ts-icon',
                questions: [
                    {
                        question: 'What is TypeScript?',
                        options: ['A JavaScript superset', 'A new language', 'A framework'],
                        correctAnswer: 0,
                        explanation: 'TypeScript is a superset of JavaScript',
                        detailedExplanation: 'TypeScript extends JavaScript by adding types...',
                        difficulty: 'medium' as const,
                    },
                ],
                isActive: true,
            };

            const mockCreatedQuiz = {
                _id: 'quiz123',
                ...mockQuizData,
            };

            vi.mocked(addAQuizToDB).mockResolvedValue({
                data: mockCreatedQuiz,
                error: null,
                details: null,
            });

            const req = createMockRequest('POST', mockQuizData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(201);
            expect(result.data.success).toBe(true);
            expect(result.data.data).toEqual(mockCreatedQuiz);
            expect(addAQuizToDB).toHaveBeenCalledWith(expect.objectContaining({
                categoryName: mockQuizData.categoryName,
                categoryDescription: mockQuizData.categoryDescription,
            }));
        });

        it('should append questions to existing quiz when quizId is provided', async () => {
            const mockAppendData = {
                quizId: 'existing-quiz-id',
                questions: [
                    {
                        question: 'New Question?',
                        options: ['Option 1', 'Option 2'],
                        correctAnswer: 0,
                        explanation: 'Explanation',
                        detailedExplanation: 'Detailed explanation',
                        difficulty: 'easy' as const,
                    },
                ],
            };

            const mockUpdatedQuiz = {
                _id: 'existing-quiz-id',
                questions: [...mockAppendData.questions],
            };

            vi.mocked(appendQuestionsToQuizInDB).mockResolvedValue({
                data: mockUpdatedQuiz,
                error: null,
            });

            const req = createMockRequest('POST', mockAppendData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(200);
            expect(result.data.success).toBe(true);
            expect(result.data.message).toContain('Successfully appended');
            expect(appendQuestionsToQuizInDB).toHaveBeenCalledWith(
                mockAppendData.quizId,
                mockAppendData.questions
            );
        });

        it('should reject quiz creation with missing required fields', async () => {
            const invalidQuizData = {
                categoryName: 'Test Quiz',
                // Missing categoryDescription, categoryIcon, questions
            };

            const req = createMockRequest('POST', invalidQuizData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(400);
            expect(result.data.error).toContain('Missing required fields');
        });

        it('should reject quiz creation with empty categoryDescription', async () => {
            const invalidQuizData = {
                categoryName: 'Test Quiz',
                categoryDescription: '   ', // Empty string
                categoryIcon: 'icon',
                questions: [{ question: 'Q?', options: ['A'], correctAnswer: 0, explanation: 'E', detailedExplanation: 'DE', difficulty: 'easy' }],
            };

            const req = createMockRequest('POST', invalidQuizData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(400);
            expect(result.data.error).toContain('categoryDescription must be a non-empty string');
        });

        it('should reject quiz creation with invalid questions array', async () => {
            const invalidQuizData = {
                categoryName: 'Test Quiz',
                categoryDescription: 'Test Description',
                categoryIcon: 'icon',
                questions: [], // Empty array
            };

            const req = createMockRequest('POST', invalidQuizData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(400);
            expect(result.data.error).toContain('Questions must be a non-empty array');
        });

        it('should validate question structure and reject invalid questions', async () => {
            const invalidQuizData = {
                categoryName: 'Test Quiz',
                categoryDescription: 'Test Description',
                categoryIcon: 'icon',
                questions: [
                    {
                        // Missing question text
                        options: ['A', 'B'],
                        correctAnswer: 0,
                        explanation: 'E',
                        detailedExplanation: 'DE',
                        difficulty: 'easy',
                    },
                ],
            };

            const req = createMockRequest('POST', invalidQuizData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(400);
            expect(result.data.error).toContain('Question[0] missing/invalid');
        });

        it('should reject questions with out-of-bounds correctAnswer', async () => {
            const invalidQuizData = {
                categoryName: 'Test Quiz',
                categoryDescription: 'Test Description',
                categoryIcon: 'icon',
                questions: [
                    {
                        question: 'Test Question?',
                        options: ['A', 'B'],
                        correctAnswer: 5, // Out of bounds
                        explanation: 'E',
                        detailedExplanation: 'DE',
                        difficulty: 'easy',
                    },
                ],
            };

            const req = createMockRequest('POST', invalidQuizData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(400);
            expect(result.data.error).toContain('correctAnswer out of bounds');
        });

        it('should handle database errors during quiz creation', async () => {
            const mockQuizData = {
                categoryName: 'Test Quiz',
                categoryDescription: 'Test Description',
                categoryIcon: 'icon',
                questions: [
                    {
                        question: 'Test Question?',
                        options: ['A', 'B'],
                        correctAnswer: 0,
                        explanation: 'E',
                        detailedExplanation: 'DE',
                        difficulty: 'easy',
                    },
                ],
            };

            vi.mocked(addAQuizToDB).mockResolvedValue({
                data: null,
                error: 'Duplicate quiz category',
                details: 'Quiz with this category already exists',
            });

            const req = createMockRequest('POST', mockQuizData);
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(400);
            expect(result.data.error).toBe('Duplicate quiz category');
        });
    });

    describe('Method Not Allowed', () => {
        it('should return 405 for unsupported HTTP methods', async () => {
            const req = createMockRequest('PUT');
            const res = createMockResponse();

            const result = await executeHandler(handler, req, res);

            expect(result.statusCode).toBe(405);
            expect(result.data.error).toBe('Method not allowed');
        });
    });
});

