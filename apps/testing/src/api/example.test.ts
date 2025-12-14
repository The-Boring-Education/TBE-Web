import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

/**
 * Simple API test example
 * Add your API endpoint tests here
 */

describe('Example API Test', () => {
    const API_URL = process.env.API_URL || 'http://localhost:3004';

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('should fetch data from API', async () => {
        const response = await fetch(`${API_URL}/api/v1/user/123`);
        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.status).toBe(true);
        expect(data.data.id).toBe('123');
    });
});

