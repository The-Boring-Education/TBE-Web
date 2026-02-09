import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckboxButton } from '@tbe/components';

describe('CheckboxButton Component', () => {
    describe('Rendering', () => {
        it('should render checkbox button with label', () => {
            render(
                <CheckboxButton
                    label="Test Checkbox"
                    value="test"
                    isSelected={false}
                    onClick={vi.fn()}
                />
            );
            expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
        });

        it('should render hidden checkbox input', () => {
            const { container } = render(
                <CheckboxButton
                    label="Checkbox"
                    value="test"
                    isSelected={false}
                    onClick={vi.fn()}
                />
            );
            const input = container.querySelector('input[type="checkbox"]');
            expect(input).toBeInTheDocument();
            expect(input).toHaveClass('hidden');
        });
    });

    describe('Selection State', () => {
        it('should be checked when isSelected is true', () => {
            const { container } = render(
                <CheckboxButton
                    label="Selected"
                    value="test"
                    isSelected={true}
                    onClick={vi.fn()}
                />
            );
            const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
            expect(input?.checked).toBe(true);
        });

        it('should not be checked when isSelected is false', () => {
            const { container } = render(
                <CheckboxButton
                    label="Not Selected"
                    value="test"
                    isSelected={false}
                    onClick={vi.fn()}
                />
            );
            const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
            expect(input?.checked).toBe(false);
        });

        it('should apply selected styling when isSelected is true', () => {
            const { container } = render(
                <CheckboxButton
                    label="Selected"
                    value="test"
                    isSelected={true}
                    onClick={vi.fn()}
                />
            );
            const label = container.querySelector('label');
            expect(label).toHaveClass('bg-primary');
        });

        it('should apply unselected styling when isSelected is false', () => {
            const { container } = render(
                <CheckboxButton
                    label="Not Selected"
                    value="test"
                    isSelected={false}
                    onClick={vi.fn()}
                />
            );
            const label = container.querySelector('label');
            expect(label).toHaveClass('bg-accent');
        });
    });

    describe('Interaction', () => {
        it('should call onClick when checkbox is changed', () => {
            const handleClick = vi.fn();
            const { container } = render(
                <CheckboxButton
                    label="Checkbox"
                    value="test"
                    isSelected={false}
                    onClick={handleClick}
                />
            );
            // Click the label, which should trigger the checkbox change
            const label = container.querySelector('label');
            if (label) {
                fireEvent.click(label);
                // The click on label should trigger the checkbox change
                expect(handleClick).toHaveBeenCalled();
            }
        });
    });

    describe('Props', () => {
        it('should use value for input id and value', () => {
            const { container } = render(
                <CheckboxButton
                    label="Checkbox"
                    value="unique-value"
                    isSelected={false}
                    onClick={vi.fn()}
                />
            );
            const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
            expect(input?.id).toBe('checkbox-unique-value');
            expect(input?.value).toBe('unique-value');
        });

        it('should associate label with input', () => {
            const { container } = render(
                <CheckboxButton
                    label="Checkbox"
                    value="test"
                    isSelected={false}
                    onClick={vi.fn()}
                />
            );
            const label = container.querySelector('label');
            const input = container.querySelector('input[type="checkbox"]');
            expect(label?.getAttribute('for')).toBe('checkbox-test');
            expect(input?.id).toBe('checkbox-test');
        });
    });
});
