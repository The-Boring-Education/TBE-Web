import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// Import the Alert component directly from the common folder to avoid conflicts
import Alert from '@tbe/components/common/Alert';

describe('Alert Component', () => {
    describe('Rendering', () => {
        it('should render alert with message', () => {
            render(<Alert message="Test alert message" type="INFO" />);
            // Message is rendered inside a div with text-sm class
            expect(screen.getByText('Test alert message')).toBeInTheDocument();
        });

        it('should render with INFO type', () => {
            const { container } = render(<Alert message="Info message" type="INFO" />);
            // Check for the background color class in the rendered output
            const alertDiv = container.querySelector('.bg-blue-100');
            expect(alertDiv).not.toBeNull();
        });
    });

    describe('Alert Types', () => {
        it('should render SUCCESS type alert', () => {
            const { container } = render(<Alert message="Success message" type="SUCCESS" />);
            const alertDiv = container.querySelector('.bg-green-100');
            expect(alertDiv).not.toBeNull();
            expect(screen.getByText('Success message')).toBeInTheDocument();
        });

        it('should render ERROR type alert', () => {
            const { container } = render(<Alert message="Error message" type="ERROR" />);
            const alertDiv = container.querySelector('.bg-red-100');
            expect(alertDiv).not.toBeNull();
            expect(screen.getByText('Error message')).toBeInTheDocument();
        });

        it('should render INFO type alert', () => {
            const { container } = render(<Alert message="Info message" type="INFO" />);
            const alertDiv = container.querySelector('.bg-blue-100');
            expect(alertDiv).not.toBeNull();
            expect(screen.getByText('Info message')).toBeInTheDocument();
        });
    });

    describe('Custom ClassName', () => {
        it('should apply custom className', () => {
            const { container } = render(
                <Alert message="Custom alert" type="INFO" className="custom-class" />
            );
            // The custom class should be on the outer div
            const alertDiv = container.querySelector('.custom-class');
            expect(alertDiv).not.toBeNull();
        });
    });

    describe('Icon Rendering', () => {
        it('should render icon for SUCCESS type', () => {
            const { container } = render(<Alert message="Success" type="SUCCESS" />);
            // Icon is an SVG element
            const svg = container.querySelector('svg');
            expect(svg).not.toBeNull();
        });

        it('should render icon for ERROR type', () => {
            const { container } = render(<Alert message="Error" type="ERROR" />);
            const svg = container.querySelector('svg');
            expect(svg).not.toBeNull();
        });

        it('should render icon for INFO type', () => {
            const { container } = render(<Alert message="Info" type="INFO" />);
            const svg = container.querySelector('svg');
            expect(svg).not.toBeNull();
        });
    });
});
