import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Example component test for Button from @tbe/components
 * This demonstrates how to test UI components
 */
describe('Button Component', () => {
    // Mock Button component for testing purposes
    const Button = ({ onClick, children, disabled = false }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );

    it('should render button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should handle click events', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Click me</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeDisabled();
    });

    it('should not trigger onClick when disabled', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(
            <Button onClick={handleClick} disabled>
                Click me
            </Button>
        );

        const button = screen.getByRole('button', { name: /click me/i });
        await user.click(button);

        expect(handleClick).not.toHaveBeenCalled();
    });
});
