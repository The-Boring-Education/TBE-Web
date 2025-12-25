import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@tbe/components/ui/card';

describe('Card Components', () => {
    describe('Card - Base Component', () => {
        it('should render Card component', () => {
            const { container } = render(<Card>Card Content</Card>);
            const card = container.querySelector('div');
            expect(card).toBeInTheDocument();
            expect(card).toHaveTextContent('Card Content');
        });

        it('should apply default card classes', () => {
            const { container } = render(<Card>Content</Card>);
            const card = container.querySelector('div');
            expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
        });

        it('should apply custom className', () => {
            const { container } = render(<Card className="custom-card">Content</Card>);
            const card = container.querySelector('div');
            expect(card).toHaveClass('custom-card');
        });

        it('should forward ref', () => {
            const ref = { current: null };
            render(<Card ref={ref}>Content</Card>);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it('should pass through HTML attributes', () => {
            const { container } = render(
                <Card data-testid="card" aria-label="Test Card">
                    Content
                </Card>
            );
            const card = container.querySelector('[data-testid="card"]');
            expect(card).toBeInTheDocument();
            expect(card).toHaveAttribute('aria-label', 'Test Card');
        });
    });

    describe('CardHeader', () => {
        it('should render CardHeader', () => {
            render(
                <Card>
                    <CardHeader>Header Content</CardHeader>
                </Card>
            );
            expect(screen.getByText('Header Content')).toBeInTheDocument();
        });

        it('should apply default header classes', () => {
            const { container } = render(
                <Card>
                    <CardHeader>Header</CardHeader>
                </Card>
            );
            const header = container.querySelector('div');
            expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
        });

        it('should apply custom className to header', () => {
            const { container } = render(
                <Card>
                    <CardHeader className="custom-header">Header</CardHeader>
                </Card>
            );
            const header = container.querySelector('div');
            expect(header).toHaveClass('custom-header');
        });
    });

    describe('CardTitle', () => {
        it('should render CardTitle', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                    </CardHeader>
                </Card>
            );
            expect(screen.getByText('Card Title')).toBeInTheDocument();
        });

        it('should render as h3 element', () => {
            const { container } = render(
                <Card>
                    <CardHeader>
                        <CardTitle>Title</CardTitle>
                    </CardHeader>
                </Card>
            );
            const title = container.querySelector('h3');
            expect(title).toBeInTheDocument();
            expect(title).toHaveTextContent('Title');
        });

        it('should apply default title classes', () => {
            const { container } = render(
                <Card>
                    <CardHeader>
                        <CardTitle>Title</CardTitle>
                    </CardHeader>
                </Card>
            );
            const title = container.querySelector('h3');
            expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
        });

        it('should apply custom className to title', () => {
            const { container } = render(
                <Card>
                    <CardHeader>
                        <CardTitle className="custom-title">Title</CardTitle>
                    </CardHeader>
                </Card>
            );
            const title = container.querySelector('h3');
            expect(title).toHaveClass('custom-title');
        });
    });

    describe('CardDescription', () => {
        it('should render CardDescription', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardDescription>Description text</CardDescription>
                    </CardHeader>
                </Card>
            );
            expect(screen.getByText('Description text')).toBeInTheDocument();
        });

        it('should render as p element', () => {
            const { container } = render(
                <Card>
                    <CardHeader>
                        <CardDescription>Description</CardDescription>
                    </CardHeader>
                </Card>
            );
            const description = container.querySelector('p');
            expect(description).toBeInTheDocument();
        });

        it('should apply default description classes', () => {
            const { container } = render(
                <Card>
                    <CardHeader>
                        <CardDescription>Description</CardDescription>
                    </CardHeader>
                </Card>
            );
            const description = container.querySelector('p');
            expect(description).toHaveClass('text-sm', 'text-muted-foreground');
        });
    });

    describe('CardContent', () => {
        it('should render CardContent', () => {
            render(
                <Card>
                    <CardContent>Main content area</CardContent>
                </Card>
            );
            expect(screen.getByText('Main content area')).toBeInTheDocument();
        });

        it('should apply default content classes', () => {
            const { container } = render(
                <Card>
                    <CardContent>Content</CardContent>
                </Card>
            );
            const content = container.querySelector('div');
            expect(content).toHaveClass('p-6', 'pt-0');
        });

        it('should apply custom className to content', () => {
            const { container } = render(
                <Card>
                    <CardContent className="custom-content">Content</CardContent>
                </Card>
            );
            const content = container.querySelector('div');
            expect(content).toHaveClass('custom-content');
        });
    });

    describe('CardFooter', () => {
        it('should render CardFooter', () => {
            render(
                <Card>
                    <CardFooter>Footer content</CardFooter>
                </Card>
            );
            expect(screen.getByText('Footer content')).toBeInTheDocument();
        });

        it('should apply default footer classes', () => {
            const { container } = render(
                <Card>
                    <CardFooter>Footer</CardFooter>
                </Card>
            );
            const footer = container.querySelector('div');
            expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
        });

        it('should apply custom className to footer', () => {
            const { container } = render(
                <Card>
                    <CardFooter className="custom-footer">Footer</CardFooter>
                </Card>
            );
            const footer = container.querySelector('div');
            expect(footer).toHaveClass('custom-footer');
        });
    });

    describe('Complete Card Structure', () => {
        it('should render complete card with all sub-components', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardDescription>Card Description</CardDescription>
                    </CardHeader>
                    <CardContent>Card Content</CardContent>
                    <CardFooter>Card Footer</CardFooter>
                </Card>
            );

            expect(screen.getByText('Card Title')).toBeInTheDocument();
            expect(screen.getByText('Card Description')).toBeInTheDocument();
            expect(screen.getByText('Card Content')).toBeInTheDocument();
            expect(screen.getByText('Card Footer')).toBeInTheDocument();
        });

        it('should maintain proper hierarchy', () => {
            const { container } = render(
                <Card>
                    <CardHeader>
                        <CardTitle>Title</CardTitle>
                    </CardHeader>
                    <CardContent>Content</CardContent>
                </Card>
            );

            const card = container.firstChild;
            const header = card?.firstChild;
            const content = card?.children[1];

            expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
            expect(content).toHaveClass('p-6', 'pt-0');
        });
    });

    describe('Accessibility', () => {
        it('should support semantic HTML structure', () => {
            const { container } = render(
                <Card>
                    <CardHeader>
                        <CardTitle>Title</CardTitle>
                    </CardHeader>
                    <CardContent>Content</CardContent>
                </Card>
            );

            const title = container.querySelector('h3');
            expect(title).toBeInTheDocument();
        });

        it('should support aria attributes', () => {
            render(
                <Card aria-label="Product Card">
                    <CardContent>Content</CardContent>
                </Card>
            );

            const card = screen.getByLabelText('Product Card');
            expect(card).toBeInTheDocument();
        });
    });
});

