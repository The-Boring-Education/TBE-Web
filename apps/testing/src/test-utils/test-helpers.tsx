import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    // Add providers as needed (QueryClient, SessionProvider, etc.)
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
    };

    return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create mock session data
 */
export function createMockSession(overrides?: any) {
    return {
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            image: null,
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

/**
 * Suppress console errors in tests
 */
export function suppressConsoleError() {
    const originalError = console.error;
    beforeEach(() => {
        console.error = vi.fn();
    });
    afterEach(() => {
        console.error = originalError;
    });
}

/**
 * Mock fetch for API calls
 */
export function mockFetch(response: any, status = 200) {
    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response))
        } as Response)
    );
}
