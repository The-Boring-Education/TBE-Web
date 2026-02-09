import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill } from '@tbe/components';

// Mock Text component
vi.mock('@tbe/components', async () => {
    const actual = await vi.importActual('@tbe/components');
    return {
        ...actual,
        Text: ({ children, className, level, textCenter }: any) => (
            <p className={className} data-level={level} data-center={textCenter}>
                {children}
            </p>
        ),
    };
});

describe('Pill Component', () => {
    describe('Rendering', () => {
        it('should render pill with text', () => {
            render(<Pill text="Test Pill" variant="PRIMARY" />);
            expect(screen.getByText('Test Pill')).toBeInTheDocument();
        });
    });

    describe('Variants', () => {
        it('should render PRIMARY variant', () => {
            const { container } = render(<Pill text="Primary" variant="PRIMARY" />);
            const pill = container.querySelector('.bg-primary\\/10');
            expect(pill).toBeInTheDocument();
            expect(screen.getByText('Primary')).toBeInTheDocument();
        });

        it('should render SECONDARY variant', () => {
            const { container } = render(<Pill text="Secondary" variant="SECONDARY" />);
            const pill = container.querySelector('.bg-secondary\\/10');
            expect(pill).toBeInTheDocument();
            expect(screen.getByText('Secondary')).toBeInTheDocument();
        });

        it('should render GHOST variant', () => {
            const { container } = render(<Pill text="Ghost" variant="GHOST" />);
            const pill = container.querySelector('.bg-white');
            expect(pill).toBeInTheDocument();
            expect(screen.getByText('Ghost')).toBeInTheDocument();
        });
    });

    describe('Props', () => {
        it('should apply custom containerClasses', () => {
            const { container } = render(
                <Pill text="Custom" variant="PRIMARY" containerClasses="custom-class" />
            );
            const pill = container.querySelector('.custom-class');
            expect(pill).toBeInTheDocument();
        });

        it('should apply widthFull when true', () => {
            const { container } = render(
                <Pill text="Full Width" variant="PRIMARY" widthFull={true} />
            );
            const pill = container.querySelector('.w-full');
            expect(pill).toBeInTheDocument();
        });

        it('should not apply widthFull when false', () => {
            const { container } = render(
                <Pill text="Not Full" variant="PRIMARY" widthFull={false} />
            );
            const pill = container.querySelector('.w-full');
            expect(pill).not.toBeInTheDocument();
        });
    });
});
