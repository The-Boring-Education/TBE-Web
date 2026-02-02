import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// Import Toast directly from common to avoid conflicts
import Toast from '@tbe/components/common/Toast';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: any) => <div>{children}</div>,
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} {...props}>
                {children}
            </div>
        ),
    },
}));

// Mock @heroicons/react
vi.mock('@heroicons/react/20/solid', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        XMarkIcon: ({ className }: any) => <svg className={className} data-testid="close-icon" />,
    };
});

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render toast with message', () => {
            render(<Toast message="Test message" />);
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('should render close button', () => {
            render(<Toast message="Test" />);
            expect(screen.getByTestId('close-icon')).toBeInTheDocument();
        });
    });

    describe('Toast Types', () => {
        it('should render success type toast', () => {
            const { container } = render(<Toast message="Success" type="success" />);
            const toast = container.querySelector('.bg-green-600');
            expect(toast).not.toBeNull();
        });

        it('should render error type toast', () => {
            const { container } = render(<Toast message="Error" type="error" />);
            const toast = container.querySelector('.bg-red-600');
            expect(toast).not.toBeNull();
        });

        it('should render info type toast', () => {
            const { container } = render(<Toast message="Info" type="info" />);
            const toast = container.querySelector('.bg-blue-600');
            expect(toast).not.toBeNull();
        });

        it('should render warning type toast', () => {
            const { container } = render(<Toast message="Warning" type="warning" />);
            const toast = container.querySelector('.bg-yellow-500');
            expect(toast).not.toBeNull();
        });
    });

    describe('Position', () => {
        it('should apply bottom-right position by default', () => {
            const { container } = render(<Toast message="Test" />);
            const toast = container.querySelector('.bottom-8.right-4');
            expect(toast).not.toBeNull();
        });

        it('should apply bottom-left position', () => {
            const { container } = render(<Toast message="Test" position="bottom-left" />);
            const toast = container.querySelector('.bottom-8.left-4');
            expect(toast).not.toBeNull();
        });

        it('should apply top-right position', () => {
            const { container } = render(<Toast message="Test" position="top-right" />);
            const toast = container.querySelector('.top-4.right-4');
            expect(toast).not.toBeNull();
        });

        it('should apply top-left position', () => {
            const { container } = render(<Toast message="Test" position="top-left" />);
            const toast = container.querySelector('.top-4.left-4');
            expect(toast).not.toBeNull();
        });
    });

    describe('Auto-close', () => {
        it('should call onClose after duration', () => {
            const handleClose = vi.fn();
            render(<Toast message="Test" duration={1000} onClose={handleClose} />);

            // Fast-forward time - the useEffect should trigger
            vi.advanceTimersByTime(1000);

            // With fake timers, the callback should be called immediately
            expect(handleClose).toHaveBeenCalled();
        });

        it('should use default duration when not specified', () => {
            const handleClose = vi.fn();
            render(<Toast message="Test" onClose={handleClose} />);

            // Fast-forward to default duration (3000ms)
            vi.advanceTimersByTime(3000);

            // With fake timers, the callback should be called immediately
            expect(handleClose).toHaveBeenCalled();
        });
    });

    describe('Manual Close', () => {
        it('should call onClose when close button is clicked', () => {
            const handleClose = vi.fn();
            render(<Toast message="Test" onClose={handleClose} />);

            const closeButton = screen.getByTestId('close-icon').closest('button');
            if (closeButton) {
                fireEvent.click(closeButton);
                expect(handleClose).toHaveBeenCalled();
            }
        });
    });
});
