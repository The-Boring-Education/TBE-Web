import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@tbe/components/ui';

describe('Button Component', () => {
    describe('Rendering', () => {
        it('should render with default props', () => {
            // Arrange & Act
            render(<Button>Click me</Button>);
            
            // Assert
            const button = screen.getByRole('button', { name: /click me/i });
            expect(button).toBeInTheDocument();
        });

        it('should render with text content', () => {
            // Arrange & Act
            render(<Button>Submit</Button>);
            
            // Assert
            const button = screen.getByRole('button', { name: /submit/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('Submit');
        });

        it('should render as a button element by default', () => {
            // Arrange & Act
            render(<Button>Test</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button.tagName).toBe('BUTTON');
        });
    });

    describe('Variants', () => {
        it('should apply default variant classes', () => {
            // Arrange & Act
            render(<Button>Default</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-primary');
            expect(button).toHaveClass('text-primary-foreground');
        });

        it('should apply destructive variant classes', () => {
            // Arrange & Act
            render(<Button variant="destructive">Delete</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-destructive');
            expect(button).toHaveClass('text-destructive-foreground');
        });

        it('should apply outline variant classes', () => {
            // Arrange & Act
            render(<Button variant="outline">Outline</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('border');
            expect(button).toHaveClass('border-input');
        });

        it('should apply secondary variant classes', () => {
            // Arrange & Act
            render(<Button variant="secondary">Secondary</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-secondary');
        });

        it('should apply ghost variant classes', () => {
            // Arrange & Act
            render(<Button variant="ghost">Ghost</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('hover:bg-accent');
        });

        it('should apply link variant classes', () => {
            // Arrange & Act
            render(<Button variant="link">Link</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('text-primary');
            expect(button).toHaveClass('underline-offset-4');
        });
    });

    describe('Sizes', () => {
        it('should apply default size classes', () => {
            // Arrange & Act
            render(<Button>Default Size</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-9');
            expect(button).toHaveClass('px-3');
        });

        it('should apply xs size classes', () => {
            // Arrange & Act
            render(<Button size="xs">Extra Small</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-7');
            expect(button).toHaveClass('px-2');
        });

        it('should apply sm size classes', () => {
            // Arrange & Act
            render(<Button size="sm">Small</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-8');
            expect(button).toHaveClass('px-2.5');
        });

        it('should apply lg size classes', () => {
            // Arrange & Act
            render(<Button size="lg">Large</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-10');
            expect(button).toHaveClass('px-6');
        });

        it('should apply icon size classes', () => {
            // Arrange & Act
            render(<Button size="icon">🔍</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-9');
            expect(button).toHaveClass('w-9');
        });
    });

    describe('Interactions', () => {
        it('should handle click events', async () => {
            // Arrange
            const handleClick = vi.fn();
            const user = userEvent.setup();
            
            // Act
            render(<Button onClick={handleClick}>Click</Button>);
            await user.click(screen.getByRole('button'));
            
            // Assert
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not call onClick when disabled', async () => {
            // Arrange
            const handleClick = vi.fn();
            const user = userEvent.setup();
            
            // Act
            render(
                <Button onClick={handleClick} disabled>
                    Disabled
                </Button>
            );
            await user.click(screen.getByRole('button'));
            
            // Assert
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('should handle multiple clicks', async () => {
            // Arrange
            const handleClick = vi.fn();
            const user = userEvent.setup();
            
            // Act
            render(<Button onClick={handleClick}>Click</Button>);
            const button = screen.getByRole('button');
            await user.click(button);
            await user.click(button);
            await user.click(button);
            
            // Assert
            expect(handleClick).toHaveBeenCalledTimes(3);
        });
    });

    describe('Disabled State', () => {
        it('should be disabled when disabled prop is true', () => {
            // Arrange & Act
            render(<Button disabled>Disabled</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should apply disabled classes', () => {
            // Arrange & Act
            render(<Button disabled>Disabled</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('disabled:pointer-events-none');
            expect(button).toHaveClass('disabled:opacity-50');
        });

        it('should not be disabled by default', () => {
            // Arrange & Act
            render(<Button>Enabled</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).not.toBeDisabled();
        });
    });

    describe('Custom className', () => {
        it('should merge custom className with default classes', () => {
            // Arrange & Act
            render(<Button className="custom-class">Custom</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
            // Should still have default classes
            expect(button).toHaveClass('inline-flex');
        });

        it('should handle multiple custom classes', () => {
            // Arrange & Act
            render(
                <Button className="class1 class2 class3">
                    Multiple Classes
                </Button>
            );
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('class1');
            expect(button).toHaveClass('class2');
            expect(button).toHaveClass('class3');
        });
    });

    describe('Ref Forwarding', () => {
        it('should forward ref to button element', () => {
            // Arrange
            const ref = vi.fn();
            
            // Act
            render(<Button ref={ref}>Ref Test</Button>);
            
            // Assert
            expect(ref).toHaveBeenCalled();
            const buttonElement = ref.mock.calls[0][0];
            expect(buttonElement).toBeInstanceOf(HTMLButtonElement);
        });

        it('should allow accessing button element via ref', () => {
            // Arrange
            const ref = vi.fn();
            
            // Act
            render(<Button ref={ref}>Ref Access</Button>);
            
            // Assert
            expect(ref).toHaveBeenCalled();
            const buttonElement = ref.mock.calls[0][0];
            expect(buttonElement).toBeInstanceOf(HTMLButtonElement);
            expect(buttonElement?.textContent).toBe('Ref Access');
        });
    });

    describe('asChild Prop', () => {
        it('should render as child component when asChild is true', () => {
            // Arrange & Act
            render(
                <Button asChild>
                    <a href="/test">Link Button</a>
                </Button>
            );
            
            // Assert
            const link = screen.getByRole('link', { name: /link button/i });
            expect(link).toBeInTheDocument();
            expect(link.tagName).toBe('A');
            expect(link).toHaveAttribute('href', '/test');
        });

        it('should render as button when asChild is false', () => {
            // Arrange & Act
            render(
                <Button asChild={false}>
                    <span>Not Child</span>
                </Button>
            );
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            expect(button.tagName).toBe('BUTTON');
        });

        it('should default to false for asChild', () => {
            // Arrange & Act
            render(<Button>Default</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button.tagName).toBe('BUTTON');
        });
    });

    describe('HTML Attributes', () => {
        it('should accept and apply type attribute', () => {
            // Arrange & Act
            render(<Button type="submit">Submit</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should accept and apply aria-label', () => {
            // Arrange & Act
            render(<Button aria-label="Close dialog">×</Button>);
            
            // Assert
            const button = screen.getByRole('button', { name: /close dialog/i });
            expect(button).toBeInTheDocument();
        });

        it('should accept and apply data attributes', () => {
            // Arrange & Act
            render(
                <Button data-testid="custom-button" data-action="save">
                    Save
                </Button>
            );
            
            // Assert
            const button = screen.getByTestId('custom-button');
            expect(button).toHaveAttribute('data-action', 'save');
        });

        it('should accept and apply id attribute', () => {
            // Arrange & Act
            render(<Button id="my-button">My Button</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('id', 'my-button');
        });
    });

    describe('Accessibility', () => {
        it('should be accessible via role="button"', () => {
            // Arrange & Act
            render(<Button>Accessible</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should have focus-visible styles', () => {
            // Arrange & Act
            render(<Button>Focusable</Button>);
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('focus-visible:outline-none');
            expect(button).toHaveClass('focus-visible:ring-2');
        });

        it('should be keyboard accessible', async () => {
            // Arrange
            const handleClick = vi.fn();
            const user = userEvent.setup();
            
            // Act
            render(<Button onClick={handleClick}>Keyboard</Button>);
            const button = screen.getByRole('button');
            button.focus();
            await user.keyboard('{Enter}');
            
            // Assert
            expect(handleClick).toHaveBeenCalled();
        });
    });

    describe('Combined Props', () => {
        it('should handle variant, size, and className together', () => {
            // Arrange & Act
            render(
                <Button
                    variant="destructive"
                    size="lg"
                    className="custom-class"
                >
                    Combined
                </Button>
            );
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-destructive');
            expect(button).toHaveClass('h-10');
            expect(button).toHaveClass('custom-class');
        });

        it('should handle disabled with variant and size', () => {
            // Arrange & Act
            render(
                <Button variant="outline" size="sm" disabled>
                    Disabled Combined
                </Button>
            );
            
            // Assert
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
            expect(button).toHaveClass('border');
            expect(button).toHaveClass('h-8');
        });
    });
});

