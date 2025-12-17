import { envConfig } from '@tbe/constants'
import { sendAPIResponse, sendRequest } from '@tbe/utils'
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock axios to avoid real network requests
vi.mock('axios', () => ({
    default: {
        create: () => ({
            request: vi.fn().mockResolvedValue({
                data: { success: true, data: 'value', message: 'Success' },
                status: 200
            })
        })
    }
}));

// Mock API URL for testing
const TEST_API_URL = envConfig.API_URL;

describe('API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('sendRequest', () => {
        it('should send request and return a promise', async () => {
            // Arrange
            const url = '/users';
            const method = 'GET';
            const headers = { 'Content-Type': 'application/json' };
            const baseURL = TEST_API_URL;
            
            // Act
            const result = sendRequest({ url, method, headers, baseURL });
            
            // Assert
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should handle request parameters', () => {
            // Arrange
            const url = '/users';
            const method = 'POST';
            const headers = { 'Content-Type': 'application/json' };
            const body = { key: 'value' };
            const baseURL = TEST_API_URL;
            
            // Act & Assert - should not throw
            expect(() => sendRequest({ url, method, headers, body, baseURL })).not.toThrow();
        });
    });
});