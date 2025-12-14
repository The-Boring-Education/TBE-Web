import { render } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render with providers (add your providers here)
 */
export function renderWithProviders(ui: ReactElement) {
    return render(ui);
}

/**
 * Create mock session data
 */
export function createMockSession(overrides?: any) {
    return {
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            ...overrides?.user
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ...overrides
    };
}

/**
 * Create mock API response
 */
export function createMockAPIResponse<T>(data: T, status = true) {
    return {
        status,
        data,
        message: status ? 'Success' : 'Error'
    };
}
