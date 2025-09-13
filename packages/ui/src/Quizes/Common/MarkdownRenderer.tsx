import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"
import { ReactNode } from "react"

interface MarkdownRendererProps {
    content: string
    className?: string
}

interface CodeProps {
    className?: string
    children?: ReactNode
}

export function MarkdownRenderer({
    content,
    className = ""
}: MarkdownRendererProps) {
    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: ({ className, children, ...props }: CodeProps) => {
                        const match = /language-(\w+)/.exec(className || "")
                        const language = match ? match[1] : ""
                        const isInline = !className

                        return !isInline && language ? (
                            <SyntaxHighlighter
                                style={oneDark}
                                language={language}
                                PreTag='div'
                                className='rounded-lg text-sm'>
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        ) : (
                            <code
                                className='bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600'
                                {...props}>
                                {children}
                            </code>
                        )
                    },
                    p: ({ children }) => (
                        <p className='mb-4 leading-relaxed text-gray-900'>
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className='font-semibold text-gray-900'>
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className='italic text-gray-700'>{children}</em>
                    ),
                    ul: ({ children }) => (
                        <ul className='list-disc list-inside mb-4 space-y-1'>
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className='list-decimal list-inside mb-4 space-y-1'>
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className='text-gray-900'>{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className='border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4'>
                            {children}
                        </blockquote>
                    ),
                    h1: ({ children }) => (
                        <h1 className='text-xl font-bold mb-3 text-gray-900'>
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className='text-lg font-bold mb-2 text-gray-900'>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className='text-base font-bold mb-2 text-gray-900'>
                            {children}
                        </h3>
                    )
                }}>
                {content}
            </ReactMarkdown>
        </div>
    )
}