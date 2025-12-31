/**
 * Test data fixtures for E2E tests
 */

export const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
};

export const testURLs = {
    platform: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
    api: process.env.API_URL || 'http://localhost:3004'
};
