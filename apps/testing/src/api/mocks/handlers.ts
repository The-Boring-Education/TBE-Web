import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for mocking external API calls
 * These are used in API tests to mock external services
 */

const API_URL = process.env.API_URL || 'http://localhost:3004';

export const handlers = [
    // Mock user endpoints
    http.get(`${API_URL}/api/v1/user/:id`, ({ params }) => {
        const { id } = params;
        return HttpResponse.json({
            status: true,
            data: {
                id,
                email: 'test@example.com',
                name: 'Test User',
                username: 'testuser'
            }
        });
    }),

    http.post(`${API_URL}/api/v1/user`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
            status: true,
            data: {
                id: 'new-user-id',
                ...body
            }
        });
    }),

    // Mock auth endpoints
    http.post(`${API_URL}/api/auth/signin`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
            status: true,
            data: {
                token: 'mock-jwt-token',
                user: {
                    id: 'user-123',
                    email: body.email
                }
            }
        });
    }),

    // Mock quiz endpoints
    http.get(`${API_URL}/api/v1/quiz/:id`, ({ params }) => {
        const { id } = params;
        return HttpResponse.json({
            status: true,
            data: {
                id,
                title: 'Test Quiz',
                description: 'A test quiz',
                questions: [
                    {
                        id: 'q1',
                        question: 'What is 2+2?',
                        options: ['2', '3', '4', '5'],
                        correctAnswer: 2
                    }
                ]
            }
        });
    }),

    http.post(`${API_URL}/api/v1/quiz/submit`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
            status: true,
            data: {
                score: 80,
                totalQuestions: 10,
                correctAnswers: 8,
                attemptId: 'attempt-123'
            }
        });
    }),

    // Mock error responses
    http.get(`${API_URL}/api/v1/error`, () => {
        return HttpResponse.json(
            {
                status: false,
                message: 'Internal server error'
            },
            { status: 500 }
        );
    })
];
