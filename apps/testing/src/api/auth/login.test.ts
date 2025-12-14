import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';

/**
 * Example API test for authentication endpoints
 * This demonstrates how to test API routes with MSW
 */

describe('Auth API - Login', () => {
    // Enable API mocking before all tests
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    // Reset handlers after each test
    afterEach(() => server.resetHandlers());

    // Disable API mocking after all tests
    afterAll(() => server.close());

    it('should successfully login with valid credentials', async () => {
        const API_URL = process.env.API_URL || 'http://localhost:3004';
        const response = await fetch(`${API_URL}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data).toHaveValidAPIResponse();
        expect(data.status).toBe(true);
        expect(data.data).toHaveProperty('token');
        expect(data.data).toHaveProperty('user');
        expect(data.data.user.email).toBe('test@example.com');
    });

    it('should return user data with token', async () => {
        const API_URL = process.env.API_URL || 'http://localhost:3004';
        const response = await fetch(`${API_URL}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'user@example.com',
                password: 'secure-password'
            })
        });

        const data = await response.json();

        expect(data.data.token).toBeTruthy();
        expect(data.data.user.id).toBeTruthy();
        expect(data.data.user.email).toBe('user@example.com');
    });

    it('should validate email format', async () => {
        // This would typically test actual validation
        const invalidEmail = 'not-an-email';
        expect(invalidEmail).not.toBeValidEmail();

        const validEmail = 'test@example.com';
        expect(validEmail).toBeValidEmail();
    });
});
