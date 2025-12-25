import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {Modal} from '@tbe/components';

// Mock @headlessui/react   
vi.mock('@headlessui/react', () => ({
    Dialog: ({ children, open, onClose }: any) => (
        <div data-testid="dialog" data-open={open} onClick={onClose}>
            {children}
        </div>
    ),
    DialogPanel: ({ children, className }: any) => (
        <div data-testid="dialog-panel" className={className}>
            {children}
        </div>
    ),
    DialogTitle: ({ children, className }: any) => (
        <h2 data-testid="dialog-title" className={className}>
            {children}
        </h2>
    ),
}));

describe('Modal Component', () => {
    describe('Basic Rendering', () => {
        it('should render modal when isOpen is true', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test Modal">
                    <div>Modal Content</div>
                </Modal>
            );

            expect(screen.getByTestId('dialog')).toBeInTheDocument();
            expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
        });

        it('should not render modal content when isOpen is false', () => {
            render(
                <Modal isOpen={false} closeModal={vi.fn()} title="Test Modal">
                    <div>Modal Content</div>
                </Modal>
            );

            const dialog = screen.getByTestId('dialog');
            expect(dialog).toHaveAttribute('data-open', 'false');
        });

        it('should render title', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="My Modal Title">
                    <div>Content</div>
                </Modal>
            );

            expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
            expect(screen.getByText('My Modal Title')).toBeInTheDocument();
        });

        it('should render children content', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>
            );

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
            expect(screen.getByText('Modal Content')).toBeInTheDocument();
        });
    });

    describe('Close Functionality', () => {
        it('should call closeModal when close button is clicked', () => {
            const closeModal = vi.fn();
            render(
                <Modal isOpen={true} closeModal={closeModal} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const closeButton = screen.getByText('✖');
            fireEvent.click(closeButton);

            expect(closeModal).toHaveBeenCalledTimes(1);
        });

        it('should call closeModal when dialog backdrop is clicked', () => {
            const closeModal = vi.fn();
            const { container } = render(
                <Modal isOpen={true} closeModal={closeModal} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const dialog = screen.getByTestId('dialog');
            fireEvent.click(dialog);

            expect(closeModal).toHaveBeenCalledTimes(1);
        });

        it('should not call closeModal when content is clicked', () => {
            const closeModal = vi.fn();
            render(
                <Modal isOpen={true} closeModal={closeModal} title="Test">
                    <div data-testid="modal-content">Content</div>
                </Modal>
            );

            const content = screen.getByTestId('modal-content');
            fireEvent.click(content);

            // closeModal should not be called when clicking content
            // (only when clicking backdrop or close button)
            expect(closeModal).not.toHaveBeenCalled();
        });
    });

    describe('Styling', () => {
        it('should apply correct classes to dialog panel', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const panel = screen.getByTestId('dialog-panel');
            expect(panel).toHaveClass('w-full', 'max-w-lg', 'rounded-lg', 'bg-white', 'shadow-lg', 'p-2');
        });

        it('should apply correct classes to title', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test Title">
                    <div>Content</div>
                </Modal>
            );

            const title = screen.getByTestId('dialog-title');
            expect(title).toHaveClass('text-md', 'font-semibold');
        });

        it('should render backdrop with correct styling', () => {
            const { container } = render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const backdrop = container.querySelector('.bg-black.bg-opacity-30');
            expect(backdrop).toBeInTheDocument();
        });

        it('should apply correct classes to content wrapper', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const contentWrapper = screen.getByText('Content').parentElement;
            expect(contentWrapper).toHaveClass('bg-gray-100', 'border');
        });
    });

    describe('Layout Structure', () => {
        it('should have proper z-index layering', () => {
            const { container } = render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const dialog = container.querySelector('.relative.z-10');
            expect(dialog).toBeInTheDocument();
        });

        it('should center modal content', () => {
            const { container } = render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const centerContainer = container.querySelector('.flex.items-center.justify-center');
            expect(centerContainer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper title for screen readers', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Accessible Modal">
                    <div>Content</div>
                </Modal>
            );

            const title = screen.getByTestId('dialog-title');
            expect(title).toHaveTextContent('Accessible Modal');
        });

        it('should have close button that is accessible', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const closeButton = screen.getByText('✖');
            expect(closeButton).toBeInTheDocument();
            expect(closeButton.tagName).toBe('BUTTON');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty title', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="">
                    <div>Content</div>
                </Modal>
            );

            const title = screen.getByTestId('dialog-title');
            expect(title).toHaveTextContent('');
        });

        it('should handle null children gracefully', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    {null}
                </Modal>
            );

            expect(screen.getByTestId('dialog')).toBeInTheDocument();
        });

        it('should handle multiple children', () => {
            render(
                <Modal isOpen={true} closeModal={vi.fn()} title="Test">
                    <div>Child 1</div>
                    <div>Child 2</div>
                </Modal>
            );

            expect(screen.getByText('Child 1')).toBeInTheDocument();
            expect(screen.getByText('Child 2')).toBeInTheDocument();
        });
    });
});

