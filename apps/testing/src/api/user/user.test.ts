import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { createMockUser } from '@test-utils/mock-factories';

/**
 * Example API test for user CRUD operations
 * This demonstrates how to test REST API endpoints
 */

describe('User API', () => {
    const API_URL = process.env.API_URL || 'http://localhost:3004';

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    describe('GET /api/v1/user/:id', () => {
        it('should get user by id', async () => {
            const userId = 'user-123';
            const response = await fetch(`${API_URL}/api/v1/user/${userId}`);

            expect(response.ok).toBe(true);

            const data = await response.json();
            expect(data).toHaveValidAPIResponse();
            expect(data.status).toBe(true);
            expect(data.data.id).toBe(userId);
            expect(data.data.email).toBeValidEmail();
        });

        it('should return user with all required fields', async () => {
            const response = await fetch(`${API_URL}/api/v1/user/user-123`);
            const data = await response.json();

            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('email');
            expect(data.data).toHaveProperty('name');
            expect(data.data).toHaveProperty('username');
        });
    });

    describe('POST /api/v1/user', () => {
        it('should create new user', async () => {
            const newUser = createMockUser({
                email: 'newuser@example.com',
                name: 'New User',
                username: 'newuser'
            });

            const response = await fetch(`${API_URL}/api/v1/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            expect(response.ok).toBe(true);

            const data = await response.json();
            expect(data).toHaveValidAPIResponse();
            expect(data.status).toBe(true);
            expect(data.data.id).toBeTruthy();
            expect(data.data.email).toBe(newUser.email);
            expect(data.data.name).toBe(newUser.name);
        });

        it('should return created user with generated id', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                username: 'testuser'
            };

            const response = await fetch(`${API_URL}/api/v1/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            expect(data.data.id).toBe('new-user-id');
            expect(data.data.email).toBe(userData.email);
        });
    });
});
