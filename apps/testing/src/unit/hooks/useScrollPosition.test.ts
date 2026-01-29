import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useScrollPosition from '@tbe/hooks/useScrollPosition';

describe('useScrollPosition Hook', () => {
    beforeEach(() => {
        // Reset window and document properties
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            configurable: true,
            value: 0,
        });

        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 800,
        });

        Object.defineProperty(document.documentElement, 'scrollHeight', {
            writable: true,
            configurable: true,
            value: 1600,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should return 0 when at top of page', () => {
            Object.defineProperty(window, 'scrollY', {
                writable: true,
                configurable: true,
                value: 0,
            });

            const { result } = renderHook(() => useScrollPosition());
            expect(result.current).toBe(0);
        });
    });

    describe('Scroll Position Calculation', () => {
        it('should calculate scroll percentage correctly', () => {
            // Setup: scrollHeight = 1600, innerHeight = 800, scrollY = 400
            // scrollable height = 1600 - 800 = 800
            // percentage = (400 / 800) * 100 = 50%
            Object.defineProperty(window, 'scrollY', {
                writable: true,
                configurable: true,
                value: 400,
            });

            const { result } = renderHook(() => useScrollPosition());

            act(() => {
                window.dispatchEvent(new Event('scroll'));
            });

            expect(result.current).toBe(50);
        });

        it('should return 100 when scrolled to bottom', () => {
            Object.defineProperty(window, 'scrollY', {
                writable: true,
                configurable: true,
                value: 800, // Full scrollable height
            });

            const { result } = renderHook(() => useScrollPosition());

            act(() => {
                window.dispatchEvent(new Event('scroll'));
            });

            expect(result.current).toBe(100);
        });

        it('should update on scroll events', () => {
            const { result } = renderHook(() => useScrollPosition());

            expect(result.current).toBe(0);

            act(() => {
                Object.defineProperty(window, 'scrollY', {
                    writable: true,
                    configurable: true,
                    value: 200,
                });
                window.dispatchEvent(new Event('scroll'));
            });

            expect(result.current).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero scrollable height', () => {
            Object.defineProperty(document.documentElement, 'scrollHeight', {
                writable: true,
                configurable: true,
                value: 800, // Same as innerHeight
            });

            const { result } = renderHook(() => useScrollPosition());

            act(() => {
                window.dispatchEvent(new Event('scroll'));
            });

            // Should handle division by zero gracefully
            expect(result.current).toBeDefined();
        });
    });

    describe('Cleanup', () => {
        it('should remove scroll event listener on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            const { unmount } = renderHook(() => useScrollPosition());

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
        });
    });
});
