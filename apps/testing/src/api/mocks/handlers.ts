import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for mocking API calls
 * Add more handlers as needed for your tests
 */

const API_URL = process.env.API_URL || 'http://localhost:3004';

export const handlers = [
    // Example: Mock user endpoint
    http.get(`${API_URL}/api/v1/user/:id`, ({ params }) => {
        const { id } = params;
        return HttpResponse.json({
            status: true,
            data: {
                id,
                email: 'test@example.com',
                name: 'Test User'
            }
        });
    })
];
