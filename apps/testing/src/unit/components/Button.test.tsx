import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {Button} from '@tbe/components';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} {...props}>
                {children}
            </div>
        ),
        button: ({ children, className, onClick, disabled, ...props }: any) => (
            <button
                className={className}
                onClick={onClick}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        ),
    },
}));

// Mock LoadingSpinner
vi.mock('@tbe/components/common/LoadingSpinner', () => ({
    default: ({ borderColour, height, width }: any) => (
        <div data-testid="loading-spinner" data-colour={borderColour} data-height={height} data-width={width}>
            Loading...
        </div>
    ),
}));

describe('Button Component', () => {
    describe('Basic Rendering', () => {
        it('should render button with text', () => {
            render(<Button text="Click Me" variant="PRIMARY" />);
            expect(screen.getByText('Click Me')).toBeInTheDocument();
        });

        it('should render button with children', () => {
            render(
                <Button variant="PRIMARY">
                    <span>Child Content</span>
                </Button>
            );
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });

        it('should prioritize children over text prop', () => {
            render(
                <Button text="Text Prop" variant="PRIMARY">
                    Child Content
                </Button>
            );
            expect(screen.getByText('Child Content')).toBeInTheDocument();
            expect(screen.queryByText('Text Prop')).not.toBeInTheDocument();
        });
    });

    describe('Variants', () => {
        it('should apply PRIMARY variant styles', () => {
            const { container } = render(<Button text="Primary" variant="PRIMARY" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-primary');
        });

        it('should apply SECONDARY variant styles', () => {
            const { container } = render(<Button text="Secondary" variant="SECONDARY" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-secondary');
        });

        it('should apply OUTLINE variant styles', () => {
            const { container } = render(<Button text="Outline" variant="OUTLINE" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-transparent');
            expect(button).toHaveClass('border-primary');
        });

        it('should apply GHOST variant styles', () => {
            const { container } = render(<Button text="Ghost" variant="GHOST" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-accent');
        });

        it('should apply SUCCESS variant styles', () => {
            const { container } = render(<Button text="Success" variant="SUCCESS" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-success');
        });

        it('should apply NEUTRAL variant styles', () => {
            const { container } = render(<Button text="Neutral" variant="NEUTRAL" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-primary');
        });
    });

    describe('Sizes', () => {
        it('should apply SMALL size styles', () => {
            const { container } = render(<Button text="Small" variant="PRIMARY" size="SMALL" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('text-xs');
            expect(button).toHaveClass('px-2');
            expect(button).toHaveClass('py-1');
        });

        it('should apply MEDIUM size styles (default)', () => {
            const { container } = render(<Button text="Medium" variant="PRIMARY" size="MEDIUM" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('text-sm');
            expect(button).toHaveClass('px-3');
            expect(button).toHaveClass('py-2');
        });

        it('should apply LARGE size styles', () => {
            const { container } = render(<Button text="Large" variant="PRIMARY" size="LARGE" />);
            const button = container.querySelector('button');
            expect(button).toHaveClass('text-base');
            expect(button).toHaveClass('px-4');
            expect(button).toHaveClass('py-3');
        });
    });

    describe('Active/Disabled State', () => {
        it('should be enabled when active is true', () => {
            const { container } = render(<Button text="Active" variant="PRIMARY" active={true} />);
            const button = container.querySelector('button');
            expect(button).not.toBeDisabled();
        });

        it('should be disabled when active is false', () => {
            const { container } = render(<Button text="Inactive" variant="PRIMARY" active={false} />);
            const button = container.querySelector('button');
            expect(button).toBeDisabled();
            expect(button).toHaveClass('bg-greyLight');
        });

        it('should be disabled when isLoading is true', () => {
            const { container } = render(<Button text="Loading" variant="PRIMARY" isLoading={true} />);
            const button = container.querySelector('button');
            expect(button).toBeDisabled();
        });

        it('should show loading spinner when isLoading is true', () => {
            render(<Button text="Loading" variant="PRIMARY" isLoading={true} />);
            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });
    });

    describe('Click Handling', () => {
        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<Button text="Click Me" variant="PRIMARY" onClick={handleClick} />);
            
            const button = screen.getByText('Click Me');
            fireEvent.click(button);
            
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not call onClick when disabled', () => {
            const handleClick = vi.fn();
            render(<Button text="Disabled" variant="PRIMARY" active={false} onClick={handleClick} />);
            
            const button = screen.getByText('Disabled');
            fireEvent.click(button);
            
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('should not call onClick when loading', () => {
            const handleClick = vi.fn();
            render(<Button text="Loading" variant="PRIMARY" isLoading={true} onClick={handleClick} />);
            
            const button = screen.getByText('Loading');
            fireEvent.click(button);
            
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Icon Support', () => {
        it('should render icon when provided', () => {
            const icon = <span data-testid="icon">🚀</span>;
            render(<Button text="With Icon" variant="PRIMARY" icon={icon} />);
            
            expect(screen.getByTestId('icon')).toBeInTheDocument();
        });
    });

    describe('Full Width', () => {
        it('should apply full width class when isFullWidth is true', () => {
            const { container } = render(
                <Button text="Full Width" variant="PRIMARY" isFullWidth={true} />
            );
            const wrapper = container.querySelector('div');
            expect(wrapper).toHaveClass('w-full');
        });

        it('should not apply full width class when isFullWidth is false', () => {
            const { container } = render(
                <Button text="Normal Width" variant="PRIMARY" isFullWidth={false} />
            );
            const wrapper = container.querySelector('div');
            expect(wrapper).not.toHaveClass('w-full');
        });
    });

    describe('Animation Types', () => {
        it('should apply DEFAULT animation type', () => {
            const { container } = render(
                <Button text="Default" variant="PRIMARY" animationType="DEFAULT" />
            );
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        });

        it('should apply BOUNCE animation type', () => {
            const { container } = render(
                <Button text="Bounce" variant="PRIMARY" animationType="BOUNCE" />
            );
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        });

        it('should apply GLOW animation type', () => {
            const { container } = render(
                <Button text="Glow" variant="PRIMARY" animationType="GLOW" />
            );
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Custom Classes', () => {
        it('should apply custom className', () => {
            const { container } = render(
                <Button text="Custom" variant="PRIMARY" className="custom-class" />
            );
            const button = container.querySelector('button');
            expect(button).toHaveClass('custom-class');
        });

        it('should apply animationClasses', () => {
            const { container } = render(
                <Button
                    text="Animated"
                    variant="PRIMARY"
                    animationClasses="animate-pulse"
                />
            );
            const wrapper = container.querySelector('div');
            expect(wrapper).toHaveClass('animate-pulse');
        });
    });

    describe('Accessibility', () => {
        it('should support aria-label', () => {
            render(
                <Button
                    text="Accessible"
                    variant="PRIMARY"
                    aria-label="Submit form"
                />
            );
            const button = screen.getByLabelText('Submit form');
            expect(button).toBeInTheDocument();
        });

        it('should support disabled attribute', () => {
            const { container } = render(
                <Button text="Disabled" variant="PRIMARY" disabled={true} />
            );
            const button = container.querySelector('button');
            expect(button).toBeDisabled();
        });
    });
});
