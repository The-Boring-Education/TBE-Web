import "katex/dist/katex.min.css";

import type { MDXRendererProps } from "@tbe/interface";
import MarkdownIt from "markdown-it";
import { Fragment, useEffect, useRef } from "react";

import { normalizeLatexDelimiters, registerMathPlugin } from "./mathPlugin";
import { sanitizeHref, sanitizeHTML } from "./sanitize";

const MDXRenderer = ({
  mdxSource,
  actions,
  theme = "light",
}: MDXRendererProps) => {
  // Determine text color based on theme
  // Dark theme uses contentDark (light/white text), Light theme uses contentLight (dark text)
  const textColorClass =
    theme === "dark" ? "text-contentDark" : "text-contentLight";
  // Code block styling based on theme
  const codeBgClass = theme === "dark" ? "bg-[#0A0A0A]" : "bg-accent";
  const codeTextClass =
    theme === "dark" ? "text-contentDark" : "text-contentLight";

  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  });

  registerMathPlugin(md);

  const normalizeMarkdown = (src: string): string => {
    if (!src) return "";
    let out = normalizeLatexDelimiters(src);

    // Convert 7+ to 3 (nice visual divider) so they render as headings, BUT NOT INSIDE CODE BLOCKS.
    const inCodeBlockRegexSafe = (
      text: string,
      regex: RegExp,
      replacer: any,
    ) => {
      let isCode = false;
      return text
        .split("\n")
        .map((line) => {
          if (line.trim().startsWith("```")) isCode = !isCode;
          if (isCode) return line;
          // if not code, apply regex to this line
          return line.replace(regex, replacer);
        })
        .join("\n");
    };

    // 1) Fix headings that have #### at both ends (weird formatting)
    // Example: "#### text #### comment" -> "#### text" (heading) + "comment" (text)
    out = inCodeBlockRegexSafe(
      out,
      /^(#{1,6})\s+([^#\n]+?)\s+(#{1,6})\s+([^\n]+)$/,
      (
        match: string,
        h1: string,
        text: string,
        h2: string,
        comment: string,
      ) => {
        // If both are same level, treat first as heading and second part as regular text
        if (h1 === h2) {
          return `${h1} ${text.trim()}\n\n${comment.trim()}`;
        }
        return match;
      },
    );
    // Handle cases with blank lines between duplicate fences
    out = out.replace(/```(\w+)\s*\n\s*\n\s*```(\w+)/g, "```$1");
    out = out.replace(/```(\w+)\s*\n\s*```(\w+)/g, "```$1");
    // Also handle cases where same language appears twice consecutively
    out = out.replace(
      /```(\w+)\s*\n([\s\S]*?)\n```\s*\n\s*```\1\s*\n/g,
      "```$1\n$2\n```\n",
    );

    // 3) Headings: CommonMark supports only 1..6 #'s.
    // Convert 7+ to 3 (nice visual divider) so they render as headings, BUT NOT INSIDE CODE BLOCKS.
    out = inCodeBlockRegexSafe(out, /^(#{7,})\s+/, "### ");

    // 4) Ensure headings with emojis are properly formatted (no space issues)
    out = inCodeBlockRegexSafe(
      out,
      /^(#{1,6})\s+([^\n]+)/,
      (match: string, hashes: string, content: string) => {
        const cleaned = content.trim().replace(/\s+#{1,6}\s*$/, "");
        return `${hashes} ${cleaned}`;
      },
    );

    // 4.5) Ensure bold syntax is properly formatted and recognized
    // Fix cases where ** might not be properly recognized (especially at start of line/paragraph)
    // Ensure **text** patterns are valid markdown (markdown-it should handle this, but ensure spacing is correct)
    // Don't modify valid bold syntax, just ensure it's properly formatted
    out = out.replace(/\*\*([^*\n]+?)\*\*/g, (match, text) => {
      // Preserve bold syntax - ensure text inside is trimmed but keep the ** markers
      // This ensures markdown-it can properly parse it
      return `**${text.trim()}**`;
    });

    // 5) Fix malformed code blocks - remove empty code fences
    out = out.replace(/```\s*\n\s*```/g, "");

    // 5) Ensure fenced code blocks are properly closed and fix duplicates.
    // Split by lines and track open/close state
    const codeBlockLines = out.split("\n");
    let inCodeBlock = false;
    let codeBlockLang = "";
    const fixedLines: string[] = [];

    for (let i = 0; i < codeBlockLines.length; i++) {
      const line = codeBlockLines[i];
      if (!line) {
        fixedLines.push("");
        continue;
      }
      const codeFenceMatch = line.match(/^```(\w*)/);

      if (codeFenceMatch) {
        if (inCodeBlock) {
          // We're already in a code block, so this should close it
          // But if it's trying to open a new one (duplicate), skip it
          const newLang = codeFenceMatch[1] || "";
          if (newLang && newLang === codeBlockLang) {
            // This is a duplicate opening fence, skip it
            continue;
          }
          // Close the current code block
          fixedLines.push("```");
          inCodeBlock = false;
          codeBlockLang = "";
        } else {
          // Open a new code block
          codeBlockLang = codeFenceMatch[1] || "";
          fixedLines.push(line);
          inCodeBlock = true;
        }
      } else {
        fixedLines.push(line);
      }
    }

    // If we're still in a code block at the end, close it
    if (inCodeBlock) {
      fixedLines.push("```");
    }

    out = fixedLines.join("\n");

    // 6) Final cleanup: remove any remaining duplicate consecutive fences
    out = out.replace(/```(\w+)\s*\n\s*\n\s*```\1\s*\n/g, "```$1\n");
    out = out.replace(/```(\w+)\s*\n\s*```\1\s*\n/g, "```$1\n");

    // 7) Ensure proper spacing around code blocks
    out = out.replace(/([^\n])\n```/g, "$1\n\n```");
    out = out.replace(/```\n([^\n])/g, "```\n\n$1");

    // 8) Detect and wrap unfenced code blocks
    // Only process if we're not already in a code block
    // Look for Python code patterns that appear after headings or blank lines
    const unfencedCodeLines = out.split("\n");
    const wrappedLines: string[] = [];
    let i = 0;
    let inFencedBlock = false;

    while (i < unfencedCodeLines.length) {
      const line = unfencedCodeLines[i];
      if (line === undefined || line === null) {
        wrappedLines.push("");
        i++;
        continue;
      }

      // Track if we're in a fenced code block
      if (line.trim().startsWith("```")) {
        inFencedBlock = !inFencedBlock;
        wrappedLines.push(line);
        i++;
        continue;
      }

      // Skip processing if we're already in a fenced block
      if (inFencedBlock) {
        wrappedLines.push(line);
        i++;
        continue;
      }

      // Check if this line looks like the start of unfenced Python code
      // Must be after a heading or blank line, and look like Python code
      const prevLine = i > 0 ? unfencedCodeLines[i - 1] : "";
      const isAfterHeading = prevLine
        ? /^#{1,6}\s+/.test(prevLine.trim())
        : false;
      const isAfterBlank = prevLine ? prevLine.trim() === "" : true;

      // Python code patterns: variable assignment, function calls, imports, etc.
      const pythonPattern =
        /^\s*(my_\w+\s*=|def\s+\w+|class\s+\w+|import\s+|from\s+|try:|except\s+|if\s+|for\s+|while\s+|print\(|return\s|^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[\[\(]|^\s*[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_])/i;
      const isPythonLike = pythonPattern.test(line.trim());

      if (isPythonLike && (isAfterHeading || isAfterBlank)) {
        // Found potential unfenced code block - collect consecutive code lines
        const codeLines: string[] = [];
        let j = i;

        while (j < unfencedCodeLines.length) {
          const currentLine = unfencedCodeLines[j];

          // Stop if we hit a fenced block
          if (currentLine?.trim().startsWith("```")) {
            break;
          }

          // Stop if we hit a heading
          if (currentLine && /^#{1,6}\s+/.test(currentLine.trim())) {
            break;
          }

          if (
            currentLine === undefined ||
            currentLine === null ||
            currentLine.trim() === ""
          ) {
            // Empty line - check if next line continues the code pattern
            if (j + 1 < unfencedCodeLines.length) {
              const nextLine = unfencedCodeLines[j + 1];
              if (
                nextLine &&
                (pythonPattern.test(nextLine.trim()) ||
                  nextLine.trim().startsWith("#") ||
                  /^\s{4,}/.test(nextLine))
              ) {
                codeLines.push(currentLine || "");
                j++;
                continue;
              }
            }
            // Single empty line might be part of code block (for readability)
            if (
              codeLines.length > 0 &&
              j + 1 < unfencedCodeLines.length &&
              currentLine
            ) {
              codeLines.push(currentLine);
              j++;
              continue;
            }
            break;
          }

          // Check if line looks like Python code
          const looksLikeCode =
            pythonPattern.test(currentLine.trim()) ||
            currentLine.includes(" = ") ||
            currentLine.includes("()") ||
            currentLine.includes("[]") ||
            currentLine.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_]/) ||
            currentLine.trim().startsWith("#") ||
            /^\s{4,}/.test(currentLine);

          if (looksLikeCode) {
            codeLines.push(currentLine);
            j++;
          } else {
            // Doesn't look like code anymore
            break;
          }
        }

        // Only wrap if we found substantial code (multiple lines or long single line)
        if (
          codeLines.length > 0 &&
          (codeLines.filter((l) => l.trim() && !l.trim().startsWith("#"))
            .length > 1 ||
            codeLines.join("").length > 30)
        ) {
          wrappedLines.push("```python");
          wrappedLines.push(...codeLines);
          wrappedLines.push("```");
          i = j;
          continue;
        }
      }

      wrappedLines.push(line);
      i++;
    }

    out = wrappedLines.join("\n");

    return out;
  };

  // Extend renderer rules to handle aside tag
  md.renderer.rules.html_block = (tokens: any[], idx: any) => {
    let content = tokens[idx].content;
    if (content.includes("<aside>")) {
      content = content.replace(
        /<aside>/g,
        '<aside class="md-aside flex gap-1 bg-accent rounded p-2 mb-2">',
      );
    }
    return content;
  };

  // Add class names to specific tags
  md.renderer.rules.heading_open = (tokens: any[], idx: number) => {
    const token = tokens[idx];
    const { tag } = token;
    const level = parseInt(tag.charAt(1)) || 1;
    const headingSizes = {
      1: "text-2xl",
      2: "text-xl",
      3: "text-lg",
      4: "text-base",
      5: "text-sm",
      6: "text-xs",
    };
    const sizeClass =
      headingSizes[level as keyof typeof headingSizes] || "text-base";
    const headingClass =
      theme === "dark"
        ? `text-contentDark font-bold mb-2 ${sizeClass}`
        : `text-contentLight font-bold mb-2 ${sizeClass}`;
    return `<${tag} class="${headingClass}">`;
  };

  md.renderer.rules.heading_close = (tokens: any[], idx: number) => {
    const token = tokens[idx];
    return `</${token.tag}>`;
  };

  // Bold text rendering - markdown-it supports both **text** and __text__
  md.renderer.rules.strong_open = () =>
    `<strong class="font-bold ${textColorClass}">`;
  md.renderer.rules.strong_close = () => `</strong>`;

  md.renderer.rules.em_open = () => `<em class="italic ${textColorClass}">`;
  md.renderer.rules.em_close = () => `</em>`;

  // Lists: keep ordered/unordered distinct.
  md.renderer.rules.ordered_list_open = () =>
    `<ol class="md-list list-decimal pl-5 mb-3">`;
  md.renderer.rules.bullet_list_open = () =>
    `<ul class="md-list list-disc pl-5 mb-3">`;

  md.renderer.rules.paragraph_open = () => `<p class="mb-2 ${textColorClass}">`;

  md.renderer.rules.link_open = (tokens: any, idx: any) => {
    const token = tokens[idx];
    const href = sanitizeHref(token.attrGet("href"));
    if (href.includes("youtube.com") || href.includes("youtu.be")) {
      if (href.includes("list=")) {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary underline strong-text">`;
      } else {
        let embedHref = href;
        if (href.includes("watch")) {
          const videoId = href.split("v=")[1].split("&")[0];
          embedHref = `https://www.youtube.com/embed/${videoId}`;
        }
        return `<iframe width="100%" height="550" class="rounded" src="${embedHref}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      }
    }

    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary underline strong-text">`;
  };

  md.renderer.rules.link_block = (tokens: any, idx: any) => {
    const token = tokens[idx];
    const href = sanitizeHref(token.attrGet("href"));

    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${md.utils.escapeHtml(href)}</a>`;
  };

  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    if (!token) return "";

    const lang = token.info?.trim() || "";
    const code = token.content || "";
    const hoverBgClass =
      theme === "dark" ? "hover:bg-[#1A1A1A]" : "hover:bg-greyLight";

    return (
      `<div class="relative mb-4 -mx-2 sm:mx-0">` +
      `<pre class="${codeBgClass} ${codeTextClass} overflow-x-auto ${hoverBgClass} transition border px-4 py-6 rounded max-sm:rounded-[6px] whitespace-pre-wrap break-words sm:whitespace-pre sm:break-normal text-[11px] sm:text-[13px]">` +
      `<code class="language-${lang}">${md.utils.escapeHtml(code)}</code>` +
      `</pre>` +
      `</div>`
    );
  };

  const normalizedSource = normalizeMarkdown(mdxSource);
  let mdxHTML = md.render(normalizedSource);

  // Post-process to ensure bold text is properly rendered
  // If markdown-it didn't parse **text** as bold (which can happen in some edge cases),
  // this fallback ensures it's converted to <strong> tags
  // Only process if markdown-it output still contains ** (meaning it wasn't parsed)
  if (mdxHTML.includes("**")) {
    // Replace **text** with <strong> tags, but avoid replacing inside code blocks
    // We need to be careful not to break already-rendered HTML
    mdxHTML = mdxHTML.replace(/\*\*([^*\n<]+?)\*\*/g, (match, text) => {
      // Skip if this is inside a tag (already processed)
      if (match.includes("<") || match.includes(">")) {
        return match;
      }
      return `<strong class="font-bold ${textColorClass}">${text.trim()}</strong>`;
    });
  }

  const processedHTML = sanitizeHTML(mdxHTML);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const codeBlocks = containerRef.current.querySelectorAll("pre code");
    codeBlocks.forEach((codeElem) => {
      const parentPre = codeElem.parentElement;
      if (!parentPre) return;
      const wrapperDiv = parentPre.parentElement;
      if (!wrapperDiv) return;
      if (wrapperDiv.querySelector(".copy-button")) return;
      const btn = document.createElement("button");
      btn.innerText = "Copy";
      btn.type = "button";
      btn.className =
        theme === "dark"
          ? "copy-button absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-sm rounded border border-gray-700 hover:bg-gray-700 hover:scale-105 transition-all z-10 max-sm:top-1 max-sm:right-1 max-sm:px-1 max-sm:py-0.5 max-sm:text-xs"
          : "copy-button absolute top-2 right-2 px-2 py-1 bg-white text-gray-800 text-sm rounded border border-gray-300 hover:bg-gray-100 hover:scale-105 transition-all z-10 max-sm:top-1 max-sm:right-1 max-sm:px-1 max-sm:py-0.5 max-sm:text-xs";
      btn.onclick = () => {
        const textToCopy = codeElem.textContent || "";
        navigator.clipboard.writeText(textToCopy).then(() => {
          btn.innerText = "Copied!";
          setTimeout(() => {
            btn.innerText = "Copy";
          }, 1500);
        });
      };
      wrapperDiv.appendChild(btn);
    });
  }, [mdxHTML, theme]);

  const actionContainer = actions && (
    <div className="flex justify-start gap-2">
      {actions.map((action, index) => (
        <Fragment key={index}>{action}</Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col justify-between">
      <div
        dangerouslySetInnerHTML={{ __html: processedHTML }}
        ref={containerRef}
        className={`break-words ${textColorClass} [&_*]:${textColorClass} [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-xs [&_h1]:mt-4 [&_h2]:mt-3 [&_h3]:mt-2 [&_h4]:mt-2 [&_h5]:mt-2 [&_h6]:mt-2 [&_strong]:font-bold [&_strong]:${textColorClass} [&_em]:italic`}
      />
      {actionContainer}
    </div>
  );
};

export default MDXRenderer;
