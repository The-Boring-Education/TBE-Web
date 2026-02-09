import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {LoadingSpinner} from '@tbe/components';

describe('LoadingSpinner Component', () => {
    describe('Rendering', () => {
        it('should render', () => {
            const { container } = render(<LoadingSpinner />);
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should have animation class', () => {
            const { container } = render(<LoadingSpinner />);
            const spinner = container.querySelector('[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });

        it('should be wrapped in a flex container', () => {
            const { container } = render(<LoadingSpinner />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.className).toContain('flex');
        });
    });

    describe('Size Props', () => {
        it('should accept height prop', () => {
            const { container } = render(<LoadingSpinner height={16} />);
            const spinner = container.querySelector('[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });

        it('should accept width prop', () => {
            const { container } = render(<LoadingSpinner width={16} />);
            const spinner = container.querySelector('[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Customization', () => {
        it('should render with borderColour prop', () => {
            const { container } = render(<LoadingSpinner borderColour="primary" />);
            const spinner = container.querySelector('[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });

        it('should render with marginClass prop', () => {
            const { container } = render(<LoadingSpinner marginClass="ml-4" />);
            const spinner = container.querySelector('[class*="animate-spin"]');
            expect(spinner).toBeInTheDocument();
        });
    });
});
