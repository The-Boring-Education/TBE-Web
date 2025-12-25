import type { NextApiRequest, NextApiResponse } from 'next';
import { createMocks, RequestMethod } from 'node-mocks-http';
import { vi } from 'vitest';

/**
 * Creates a mock Next.js API request
 */
export function createMockRequest(
    method: RequestMethod = 'GET',
    body?: any,
    query?: Record<string, string>,
    headers?: Record<string, string>
): NextApiRequest {
    const { req } = createMocks<NextApiRequest, NextApiResponse>({
        method,
        body,
        query,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });

    return req;
}

/**
 * Creates a mock Next.js API response
 */
export function createMockResponse(): NextApiResponse {
    const { res } = createMocks<NextApiRequest, NextApiResponse>();
    
    // Add helper methods to track response
    const response = res as NextApiResponse & {
        _getStatusCode: () => number;
        _getJSONData: () => any;
        _getHeaders: () => Record<string, string>;
    };

    return response;
}

/**
 * Executes an API handler and returns the response
 */
export async function executeHandler(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
    req: NextApiRequest,
    res: NextApiResponse
): Promise<{
    statusCode: number;
    data: any;
    headers: Record<string, string>;
}> {
    await handler(req, res);

    const statusCode = res.statusCode || 200;
    const data = (res as any)._getJSONData?.() || {};
    const headers = (res as any)._getHeaders?.() || {};

    return { statusCode, data, headers };
}

/**
 * Mock database connection
 */
export function mockDatabaseConnection() {
    return {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
    };
}

/**
 * Mock database query functions
 */
export function createMockDBQuery<T>(data: T | null, error: string | null = null) {
    return vi.fn().mockResolvedValue({ data, error });
}

