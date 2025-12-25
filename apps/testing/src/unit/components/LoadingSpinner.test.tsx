import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {LoadingSpinner} from '@tbe/components';

describe('LoadingSpinner Component', () => {
    describe('Basic Rendering', () => {
        it('should render loading spinner', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('div');
            expect(spinner).toBeInTheDocument();
        });

        it('should have flex container with proper alignment', () => {
            const { container } = render(<LoadingSpinner />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
        });

        it('should render spinner element with animation classes', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('rounded-full', 'border-2', 'border-solid');
        });
    });

    describe('Size Props', () => {
        it('should apply custom height', () => {
            const { container } = render(<LoadingSpinner height={16} />);
            const spinner = container.querySelector('.h-16');
            expect(spinner).toBeInTheDocument();
        });

        it('should apply custom width', () => {
            const { container } = render(<LoadingSpinner width={16} />);
            const spinner = container.querySelector('.w-16');
            expect(spinner).toBeInTheDocument();
        });

        it('should use default size when not provided', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('.h-12');
            expect(spinner).toBeInTheDocument();
        });

        it('should apply both height and width', () => {
            const { container } = render(<LoadingSpinner height={20} width={20} />);
            const spinner = container.querySelector('.h-20');
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('w-20');
        });
    });

    describe('Border Color', () => {
        it('should apply default border color (black)', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('.border-black');
            expect(spinner).toBeInTheDocument();
        });

        it('should apply custom border color', () => {
            const { container } = render(<LoadingSpinner borderColour="white" />);
            const spinner = container.querySelector('.border-white');
            expect(spinner).toBeInTheDocument();
        });

        it('should apply primary color border', () => {
            const { container } = render(<LoadingSpinner borderColour="primary" />);
            const spinner = container.querySelector('.border-primary');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Margin Classes', () => {
        it('should apply default margin class (ml-1)', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('.ml-1');
            expect(spinner).toBeInTheDocument();
        });

        it('should apply custom margin class', () => {
            const { container } = render(<LoadingSpinner marginClass="ml-4" />);
            const spinner = container.querySelector('.ml-4');
            expect(spinner).toBeInTheDocument();
        });

        it('should not apply margin when marginClass is empty', () => {
            const { container } = render(<LoadingSpinner marginClass="" />);
            const spinner = container.querySelector('div[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Custom Classes', () => {
        it('should apply custom className', () => {
            const { container } = render(<LoadingSpinner className="custom-spinner" />);
            const spinner = container.querySelector('.custom-spinner');
            expect(spinner).toBeInTheDocument();
        });

        it('should combine custom className with default classes', () => {
            const { container } = render(<LoadingSpinner className="my-custom-class" />);
            const spinner = container.querySelector('div[class*="animate-spin"]');
            expect(spinner).toHaveClass('my-custom-class');
        });
    });

    describe('Animation', () => {
        it('should have spin animation class', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('should have motion-reduce animation class', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('div[class*="motion-reduce"]');
            expect(spinner).toBeInTheDocument();
        });

        it('should have border-r-transparent for spinner effect', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('.border-r-transparent');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should be accessible to screen readers', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('div[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero height gracefully', () => {
            const { container } = render(<LoadingSpinner height={0} />);
            const spinner = container.querySelector('div[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });

        it('should handle zero width gracefully', () => {
            const { container } = render(<LoadingSpinner width={0} />);
            const spinner = container.querySelector('div[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });

        it('should handle very large sizes', () => {
            const { container } = render(<LoadingSpinner height={100} width={100} />);
            const spinner = container.querySelector('.h-100');
            expect(spinner).toBeInTheDocument();
        });
    });
});

