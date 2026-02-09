import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Link } from '@tbe/components'

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href, className, target, scroll, onClick }: any) => (
        <a href={href} className={className} target={target} onClick={onClick} data-scroll={scroll}>
            {children}
        </a>
    ),
}))

describe('Link Component', () => {
    describe('Rendering', () => {
        it('should render link with href', () => {
            render(<Link href="/test">Test Link</Link>)
            const link = screen.getByText('Test Link')
            expect(link).toBeInTheDocument()
            expect(link.closest('a')).toHaveAttribute('href', '/test')
        })

        it('should render children content', () => {
            render(<Link href="/page">Link Text</Link>)
            expect(screen.getByText('Link Text')).toBeInTheDocument()
        })
    })

    describe('Props', () => {
        it('should apply custom className', () => {
            render(<Link href="/test" className="custom-class">Link</Link>)
            const link = screen.getByText('Link').closest('a')
            expect(link).toHaveClass('custom-class')
        })

        it('should handle target prop', () => {
            render(<Link href="/test" target="_blank">Link</Link>)
            const link = screen.getByText('Link').closest('a')
            expect(link).toHaveAttribute('target', '_blank')
        })

        it('should handle scroll prop', () => {
            // Next.js Link scroll prop doesn't render as attribute, it controls behavior
            // We just verify the component renders without error
            const { container } = render(<Link href="/test" scroll={false}>Link</Link>)
            const link = container.querySelector('a')
            expect(link).toBeInTheDocument()
        })

        it('should handle onClick', () => {
            const handleClick = vi.fn()
            render(<Link href="/test" onClick={handleClick}>Link</Link>)
            const link = screen.getByText('Link').closest('a')
            link?.click()
            expect(handleClick).toHaveBeenCalled()
        })
    })

    describe('Edge Cases', () => {
        it('should render span when href is empty', () => {
            render(<Link href="">Empty Link</Link>)
            const span = screen.getByText('Empty Link')
            expect(span.tagName).toBe('SPAN')
        })

        it('should render span when href is undefined', () => {
            render(<Link href={undefined as any}>No Href</Link>)
            const span = screen.getByText('No Href')
            expect(span.tagName).toBe('SPAN')
        })

        it('should render span when href is whitespace', () => {
            render(<Link href="   ">Whitespace</Link>)
            const span = screen.getByText('Whitespace')
            expect(span.tagName).toBe('SPAN')
        })
    })

    describe('Active State', () => {
        it('should apply disabled class when active is false', () => {
            render(<Link href="/test" active={false}>Disabled Link</Link>)
            const link = screen.getByText('Disabled Link').closest('a')
            expect(link).toHaveClass('disabled')
        })

        it('should not apply disabled class when active is true', () => {
            render(<Link href="/test" active={true}>Active Link</Link>)
            const link = screen.getByText('Active Link').closest('a')
            expect(link).not.toHaveClass('disabled')
        })
    })
})
