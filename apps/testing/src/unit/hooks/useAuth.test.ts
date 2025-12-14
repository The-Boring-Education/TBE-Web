import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { createMockSession } from '@test-utils/test-helpers';

/**
 * Example hook test for useAuth from @tbe/hooks
 * This demonstrates how to test custom React hooks
 */

// Mock implementation of useAuth hook for testing
function useAuth() {
    const { data: session, status } = useSession();

    return {
        user: session?.user,
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        session
    };
}

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return authenticated user when session exists', () => {
        const mockSession = createMockSession();

        vi.mocked(useSession).mockReturnValue({
            data: mockSession,
            status: 'authenticated',
            update: vi.fn()
        });

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.user).toEqual(mockSession.user);
        expect(result.current.session).toEqual(mockSession);
    });

    it('should return unauthenticated state when no session', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn()
        });

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.user).toBeUndefined();
        expect(result.current.session).toBeNull();
    });

    it('should return loading state during authentication', () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'loading',
            update: vi.fn()
        });

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.user).toBeUndefined();
    });

    it('should update when session changes', async () => {
        const mockSession = createMockSession();

        const { result, rerender } = renderHook(() => useAuth());

        // Initially unauthenticated
        vi.mocked(useSession).mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: vi.fn()
        });
        rerender();

        expect(result.current.isAuthenticated).toBe(false);

        // Then authenticated
        vi.mocked(useSession).mockReturnValue({
            data: mockSession,
            status: 'authenticated',
            update: vi.fn()
        });
        rerender();

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });
    });
});
