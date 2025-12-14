import { expect } from 'vitest';

/**
 * Custom matchers for TBE-specific assertions
 * Add more custom matchers as needed
 */

interface CustomMatchers<R = unknown> {
    toHaveValidAPIResponse(): R;
}

declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
    /**
     * Check if object has valid API response structure
     */
    toHaveValidAPIResponse(received: any) {
        const hasStatus = 'status' in received && typeof received.status === 'boolean';
        const hasData = 'data' in received || 'message' in received;
        const pass = hasStatus && hasData;

        return {
            pass,
            message: () =>
                pass
                    ? `Expected object not to have valid API response structure`
                    : `Expected object to have valid API response structure with 'status' and 'data'/'message' fields`
        };
    }
});
