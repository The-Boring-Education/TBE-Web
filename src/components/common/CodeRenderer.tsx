'use client'

import { useEffect, useRef } from 'react'
import MarkdownIt from 'markdown-it'

interface CodeRendererProps {
  content: string
  className?: string
}

export function CodeRenderer({ content, className = "" }: CodeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Normalize content: if there are many inline backtick segments but no fenced block,
    // convert them into a single fenced code block so it renders as a proper block.
    const normalizeMarkdown = (src: string): string => {
      // If it already has fenced code blocks, normalize inline fences to proper multiline
      if (src.includes("```")) {
        const fixed = src
          // Ensure newline right after language token (but only if there's a valid language)
          .replace(/```(javascript|js|typescript|ts|python|py|java|cpp|c|html|css|json|xml|sql|bash|sh)\s+/gi, '```$1\n')
          // If no language specified, add javascript as default
          .replace(/```\s*([^`\n]+)/g, (match, content) => {
            // If the content looks like code (not a language), add javascript language
            if (content.includes('import') || content.includes('function') || content.includes('const') || content.includes('class')) {
              return '```javascript\n' + content
            }
            return '```' + content + '\n'
          })
          // Ensure newline before closing fence if inline
          .replace(/\s+```/g, '\n```')
          // Handle language-less inline fences
          .replace(/```\s+/g, '```javascript\n')
        return fixed
      }

      // No automatic code detection - rely on explicit markdown formatting from database
      // Database should provide content with proper markdown formatting (backticks for inline code)

      // No automatic code detection - rely on explicit markdown formatting from database

      // Count inline backticks
      const backtickCount = (src.match(/`/g) || []).length

      // Heuristic: lots of inline code pieces + overall long text => it's actually one code snippet
      if (backtickCount >= 10 && src.length > 120) {
        // Remove individual backticks and possible repeated spaces
        let code = src.replace(/`/g, "")

        // If content starts with a loose language token, strip it
        code = code.replace(/^\s*(javascript|js|typescript|ts|python|py|java|cpp|c|html|css|json|xml|sql|bash|sh)\s+/i, "")

        // Restore common statement separators into new lines for readability (best-effort)
        code = code
          .replace(/;\s*/g, ";\n")
          .replace(/\{\s*/g, "{\n")
          .replace(/\}\s*/g, "\n}")

        return `\n\n\`\`\`javascript\n${code.trim()}\n\`\`\``
      }

      return src
    }

    const normalized = normalizeMarkdown(content)

    // Initialize markdown-it
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })

    // Custom code block renderer (fence rule)
    md.renderer.rules.fence = (tokens, idx) => {
      const token = tokens[idx]
      const lang = token.info.trim() || 'javascript'
      let code = token.content
      
      // Process newline characters from API (handle both \n and \\n)
      code = code.replace(/\\n/g, '\n').replace(/\n\s*\n/g, '\n')

      // No syntax highlighting - just escape HTML
      const escapedCode = md.utils.escapeHtml(code)

      return (
        `<div class="relative mb-4 group">` +
        `<pre class="bg-gray-100 overflow-x-auto hover:bg-gray-200 transition border px-4 py-6 rounded-lg whitespace-pre-wrap">` +
        `<code class="text-sm font-mono text-gray-800">${escapedCode}</code>` +
        `</pre>` +
        `<button class="copy-button absolute top-2 right-2 px-2 py-1 bg-white text-gray-800 text-xs rounded border border-gray-300 hover:bg-gray-100 hover:scale-105 transition-all z-10 opacity-0 group-hover:opacity-100">Copy</button>` +
        `</div>`
      )
    }

    // Custom inline code renderer
    md.renderer.rules.code_inline = (tokens, idx) => {
      const token = tokens[idx]
      const code = token.content
      return `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border">${md.utils.escapeHtml(code)}</code>`
    }

    // Render the content
    const html = md.render(normalized)
    containerRef.current.innerHTML = html

    // Add copy functionality to all code blocks
    const copyButtons = containerRef.current.querySelectorAll('.copy-button')
    copyButtons.forEach((btn) => {
      const button = btn as HTMLButtonElement
      const codeBlock = button.parentElement?.querySelector('code')
      
      if (codeBlock) {
        button.addEventListener('click', () => {
          const textToCopy = codeBlock.textContent || ''
          navigator.clipboard.writeText(textToCopy).then(() => {
            button.innerText = 'Copied!'
            button.classList.add('bg-green-100', 'text-green-800')
            setTimeout(() => {
              button.innerText = 'Copy'
              button.classList.remove('bg-green-100', 'text-green-800')
            }, 1500)
          }).catch(() => {
            button.innerText = 'Failed'
            setTimeout(() => button.innerText = 'Copy', 1500)
          })
        })
      }
    })

    // Add group hover effect to code blocks
    const codeBlocks = containerRef.current.querySelectorAll('pre')
    codeBlocks.forEach((block) => {
      block.classList.add('group')
    })

  }, [content])

  return (
    <div 
      ref={containerRef} 
      className={`prose prose-sm max-w-none ${className}`}
    />
  )
}
