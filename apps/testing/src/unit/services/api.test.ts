import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch, createMockAPIResponse } from '@test-utils/test-helpers';

/**
 * Example service test for API utilities from @tbe/services
 * This demonstrates how to test API service functions
 */

// Mock API service for testing
class APIService {
    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
}

describe('API Service', () => {
    let apiService: APIService;

    beforeEach(() => {
        apiService = new APIService();
        vi.clearAllMocks();
    });

    describe('GET requests', () => {
        it('should fetch data successfully', async () => {
            const mockData = createMockAPIResponse({ items: [1, 2, 3] });
            mockFetch(mockData);

            const result = await apiService.get('/api/items');

            expect(result).toEqual(mockData);
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith('/api/items');
        });

        it('should throw error on failed request', async () => {
            mockFetch({ message: 'Not found' }, 404);

            await expect(apiService.get('/api/items')).rejects.toThrow(
                'HTTP error! status: 404'
            );
        });
    });

    describe('POST requests', () => {
        it('should send data successfully', async () => {
            const postData = { name: 'Test Item' };
            const mockResponse = createMockAPIResponse({ id: '123', ...postData });
            mockFetch(mockResponse);

            const result = await apiService.post('/api/items', postData);

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                '/api/items',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postData)
                })
            );
        });

        it('should handle validation errors', async () => {
            const postData = { name: '' };
            mockFetch(createMockAPIResponse('Validation failed', false), 400);

            await expect(apiService.post('/api/items', postData)).rejects.toThrow(
                'HTTP error! status: 400'
            );
        });
    });
});
