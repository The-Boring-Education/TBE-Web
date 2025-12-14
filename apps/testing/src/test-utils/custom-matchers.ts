import { expect } from 'vitest';

/**
 * Custom matchers for TBE-specific assertions
 */

interface CustomMatchers<R = unknown> {
    toBeValidEmail(): R;
    toBeValidMongoId(): R;
    toHaveValidAPIResponse(): R;
}

declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
    /**
     * Check if string is a valid email
     */
    toBeValidEmail(received: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pass = emailRegex.test(received);

        return {
            pass,
            message: () =>
                pass
                    ? `Expected ${received} not to be a valid email`
                    : `Expected ${received} to be a valid email`
        };
    },

    /**
     * Check if string is a valid MongoDB ObjectId
     */
    toBeValidMongoId(received: string) {
        const mongoIdRegex = /^[a-f\d]{24}$/i;
        const pass = mongoIdRegex.test(received);

        return {
            pass,
            message: () =>
                pass
                    ? `Expected ${received} not to be a valid MongoDB ObjectId`
                    : `Expected ${received} to be a valid MongoDB ObjectId`
        };
    },

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
                    : `Expected object to have valid API response structure with 'status' (boolean) and 'data' or 'message' fields`
        };
    }
});
