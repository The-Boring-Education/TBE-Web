import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useMediaQuery from '@tbe/hooks/useMediaQuery';

describe('useMediaQuery Hook', () => {
    let matchMediaMock: any;

    beforeEach(() => {
        matchMediaMock = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: matchMediaMock,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should return false when media query does not match', () => {
            matchMediaMock.mockReturnValue({
                matches: false,
                media: '(max-width: 768px)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            });

            const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
            expect(result.current).toBe(false);
        });

        it('should return true when media query matches', () => {
            matchMediaMock.mockReturnValue({
                matches: true,
                media: '(max-width: 768px)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            });

            const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
            expect(result.current).toBe(true);
        });
    });

    describe('Query Changes', () => {
        it('should update when query changes', () => {
            matchMediaMock.mockReturnValue({
                matches: false,
                media: '(max-width: 768px)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            });

            const { result, rerender } = renderHook(
                ({ query }) => useMediaQuery(query),
                { initialProps: { query: '(max-width: 768px)' } }
            );

            expect(result.current).toBe(false);

            // Change query
            matchMediaMock.mockReturnValue({
                matches: true,
                media: '(min-width: 1024px)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            });

            rerender({ query: '(min-width: 1024px)' });
            expect(result.current).toBe(true);
        });
    });

    describe('Event Listeners', () => {
        it('should add event listener on mount', () => {
            const addEventListenerSpy = vi.fn();
            matchMediaMock.mockReturnValue({
                matches: false,
                media: '(max-width: 768px)',
                addEventListener: addEventListenerSpy,
                removeEventListener: vi.fn(),
            });

            renderHook(() => useMediaQuery('(max-width: 768px)'));
            expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
        });

        it('should remove event listener on unmount', () => {
            const removeEventListenerSpy = vi.fn();
            matchMediaMock.mockReturnValue({
                matches: false,
                media: '(max-width: 768px)',
                addEventListener: vi.fn(),
                removeEventListener: removeEventListenerSpy,
            });

            const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
            unmount();
            expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
        });
    });
});
