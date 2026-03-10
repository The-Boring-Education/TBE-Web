import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  theme?: "light" | "dark";
}

interface CodeProps {
  className?: string;
  children?: ReactNode;
}

export function MarkdownRenderer({
  content,
  className = "",
  theme = "light",
}: MarkdownRendererProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "prose prose-sm max-w-none",
        isDark ? "prose-invert" : "",
        className,
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className;

            return !isInline && language ? (
              <pre
                className={[
                  "p-4 rounded-lg text-sm overflow-x-auto mb-4 last:mb-0",
                  isDark
                    ? "bg-gray-950 text-gray-100 border border-gray-800"
                    : "bg-gray-900 text-gray-100",
                ].join(" ")}
              >
                <code className={`language-${language}`}>
                  {String(children).replace(/\n$/, "")}
                </code>
              </pre>
            ) : (
              <code
                className={[
                  "px-1 py-0.5 rounded text-sm font-mono",
                  isDark
                    ? "bg-gray-900 text-red-300 border border-gray-800"
                    : "bg-gray-100 text-red-600",
                ].join(" ")}
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p
              className={[
                "mb-4 last:mb-0 leading-relaxed",
                isDark ? "text-gray-100" : "text-gray-900",
              ].join(" ")}
            >
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong
              className={[
                "font-semibold",
                isDark ? "text-gray-100" : "text-gray-900",
              ].join(" ")}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em
              className={[
                "italic",
                isDark ? "text-gray-300" : "text-gray-700",
              ].join(" ")}
            >
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 last:mb-0 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 last:mb-0 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={isDark ? "text-gray-100" : "text-gray-900"}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={[
                "border-l-4 pl-4 italic mb-4 last:mb-0",
                isDark
                  ? "border-gray-700 text-gray-300"
                  : "border-gray-300 text-gray-700",
              ].join(" ")}
            >
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1
              className={[
                "text-xl font-bold mb-3 last:mb-0",
                isDark ? "text-gray-100" : "text-gray-900",
              ].join(" ")}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={[
                "text-lg font-bold mb-2 last:mb-0",
                isDark ? "text-gray-100" : "text-gray-900",
              ].join(" ")}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={[
                "text-base font-bold mb-2 last:mb-0",
                isDark ? "text-gray-100" : "text-gray-900",
              ].join(" ")}
            >
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
