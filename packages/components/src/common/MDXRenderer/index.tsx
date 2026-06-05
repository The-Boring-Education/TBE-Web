import "katex/dist/katex.min.css";

import type { MDXRendererProps } from "@tbe/interface";
import MarkdownIt from "markdown-it";
import { Fragment, useEffect, useRef } from "react";

import { normalizeLatexDelimiters, registerMathPlugin } from "./mathPlugin";

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

          // If the fence starts a new language, open a new block
          if (newLang) {
            fixedLines.push(line);
            inCodeBlock = true;
            codeBlockLang = newLang;
          }
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

  // Add class names and unique IDs to specific tags for table-of-contents navigation
  md.renderer.rules.heading_open = (tokens: any[], idx: number) => {
    const token = tokens[idx];
    const { tag } = token;
    const level = parseInt(tag.charAt(1)) || 1;

    // Generate id attribute from the heading text for anchor links
    const nextToken = tokens[idx + 1];
    const titleText =
      nextToken && nextToken.type === "inline" ? nextToken.content : "";
    const idAttr = titleText
      ? ` id="${titleText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}"`
      : "";

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
    return `<${tag}${idAttr} class="${headingClass}">`;
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
    const href = token.attrGet("href");
    if (href.includes("youtube.com") || href.includes("youtu.be")) {
      if (href.includes("list=")) {
        return `<a href=${href} target="_blank" class="text-primary underline strong-text">`;
      } else {
        let embedHref = href;
        if (href.includes("watch")) {
          const videoId = href.split("v=")[1].split("&")[0];
          embedHref = `https://www.youtube.com/embed/${videoId}`;
        }
        return `<iframe width="100%" height="550" class="rounded" src="${embedHref}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      }
    }

    return `<a href=${href} target="_blank" class="text-primary underline strong-text">`;
  };

  md.renderer.rules.link_block = (tokens: any, idx: any) => {
    const token = tokens[idx];
    const href = token.attrGet("href");

    return `<a href=${href} target="_blank">${href}</a>`;
  };

  // Explicit image renderer so markdown images are never swallowed
  md.renderer.rules.image = (
    tokens: any,
    idx: any,
    options: any,
    env: any,
    self: any,
  ) => {
    const token = tokens[idx];
    const src = token.attrGet("src") || "";
    const alt = self.renderInlineAsText(token.children, options, env) || "";
    const title = token.attrGet("title") || "";
    return (
      `<figure class="my-6">` +
      `<img` +
      ` src="${src}"` +
      ` alt="${alt}"` +
      (title ? ` title="${title}"` : "") +
      ` loading="lazy"` +
      ` class="max-w-full h-auto rounded-xl border border-gray-800 shadow-lg mx-auto block"` +
      ` />` +
      (alt
        ? `<figcaption class="text-center text-xs text-gray-500 mt-2 italic">${alt}</figcaption>`
        : "") +
      `</figure>`
    );
  };

  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    if (!token) return "";

    const lang = token.info?.trim() || "text";
    const code = token.content || "";

    // Lightweight regex-based syntax highlighter
    const highlightCode = (rawCode: string, language: string): string => {
      let escaped = md.utils.escapeHtml(rawCode);
      const cleanLang = language.toLowerCase();
      if (
        cleanLang === "java" ||
        cleanLang === "javascript" ||
        cleanLang === "js" ||
        cleanLang === "cpp" ||
        cleanLang === "c++" ||
        cleanLang === "c"
      ) {
        escaped = escaped.replace(
          /\b(public|private|protected|class|interface|extends|implements|static|final|void|new|return|import|package|const|let|var|function)\b/g,
          '<span class="text-red-400 font-semibold">$1</span>',
        );
        escaped = escaped.replace(
          /\b(String|int|double|float|char|boolean|System|out|println|console|log|Car|Main|String\[\])\b/g,
          '<span class="text-sky-400 font-medium">$1</span>',
        );
        escaped = escaped.replace(
          /(\/\/.*)/g,
          '<span class="text-gray-500 italic">$1</span>',
        );
        escaped = escaped.replace(
          /(&quot;.*?&quot;|'.*?')/g,
          '<span class="text-emerald-400">$1</span>',
        );
      } else if (cleanLang === "python" || cleanLang === "py") {
        escaped = escaped.replace(
          /\b(def|class|import|from|return|if|else|elif|for|while|in|is|not|and|or|try|except|as|print)\b/g,
          '<span class="text-red-400 font-semibold">$1</span>',
        );
        escaped = escaped.replace(
          /(#.*)/g,
          '<span class="text-gray-500 italic">$1</span>',
        );
        escaped = escaped.replace(
          /(&quot;.*?&quot;|'.*?')/g,
          '<span class="text-emerald-400">$1</span>',
        );
      } else if (cleanLang === "sql") {
        escaped = escaped.replace(
          /\b(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|AVG|COUNT|SUM|MAX|MIN|AS|DESC|ASC)\b/gi,
          '<span class="text-red-400 font-semibold">$1</span>',
        );
        escaped = escaped.replace(
          /(--.*)/g,
          '<span class="text-gray-500 italic">$1</span>',
        );
      }
      return escaped;
    };

    const highlightedHTML = highlightCode(code, lang);

    // Output a bare code block wrapper — useEffect will group & add tab UI
    return (
      `<div class="tbe-code-block" data-lang="${lang}">` +
      `<pre class="overflow-x-auto px-5 py-4 text-[13px] font-mono leading-relaxed text-gray-300 scrollbar-thin-grey whitespace-pre bg-[#0A0A0C]">` +
      `<code>${highlightedHTML}</code>` +
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

  const processedHTML = mdxHTML;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const allBlocks = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        ".tbe-code-block:not([data-processed])",
      ),
    );
    const visited = new Set<Element>();

    const langLabel = (raw: string) => {
      const map: Record<string, string> = {
        cpp: "C++",
        "c++": "C++",
        js: "JavaScript",
        javascript: "JavaScript",
        java: "Java",
        python: "Python",
        py: "Python",
        sql: "SQL",
        ts: "TypeScript",
        typescript: "TypeScript",
        text: "Code",
        c: "C",
        go: "Go",
        rust: "Rust",
      };
      return (
        map[raw.toLowerCase()] ?? raw.charAt(0).toUpperCase() + raw.slice(1)
      );
    };

    allBlocks.forEach((block) => {
      if (visited.has(block)) return;

      // Collect this block + all directly following sibling code blocks
      const group: HTMLElement[] = [block];
      let next = block.nextElementSibling;
      while (next && next.classList.contains("tbe-code-block")) {
        group.push(next as HTMLElement);
        visited.add(next);
        next = next.nextElementSibling;
      }
      visited.add(block);
      group.forEach((b) => b.setAttribute("data-processed", "true"));

      // Build tabbed widget
      const wrapper = document.createElement("div");
      wrapper.className =
        "tbe-code-tabs rounded-xl overflow-hidden border border-gray-800 mb-6";

      // Header bar: language tabs + copy button
      const bar = document.createElement("div");
      bar.className = "flex items-center bg-[#111318] border-b border-gray-800";

      const tabButtons: HTMLButtonElement[] = [];
      group.forEach((b, i) => {
        const raw = b.getAttribute("data-lang") || "text";
        const tab = document.createElement("button");
        tab.type = "button";
        tab.textContent = langLabel(raw);
        tab.className =
          i === 0
            ? "px-4 py-2.5 text-[11px] font-black tracking-widest text-white border-b-2 border-red-500 bg-transparent transition-all cursor-pointer"
            : "px-4 py-2.5 text-[11px] font-black tracking-widest text-gray-500 border-b-2 border-transparent hover:text-gray-300 bg-transparent transition-all cursor-pointer";
        tabButtons.push(tab);
        bar.appendChild(tab);
      });

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";
      copyBtn.className =
        "ml-auto px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer";
      copyBtn.addEventListener("click", () => {
        const activeBlock = wrapper.querySelector<HTMLElement>(
          '.tbe-code-block[data-active="true"]',
        );
        const text = activeBlock?.querySelector("code")?.textContent || "";
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy";
          }, 1500);
        });
      });
      bar.appendChild(copyBtn);

      // Tab switching
      const activateTab = (index: number) => {
        tabButtons.forEach((btn, j) => {
          btn.className =
            j === index
              ? "px-4 py-2.5 text-[11px] font-black tracking-widest text-white border-b-2 border-red-500 bg-transparent transition-all cursor-pointer"
              : "px-4 py-2.5 text-[11px] font-black tracking-widest text-gray-500 border-b-2 border-transparent hover:text-gray-300 bg-transparent transition-all cursor-pointer";
        });
        wrapper
          .querySelectorAll<HTMLElement>(".tbe-code-block")
          .forEach((blk, j) => {
            blk.style.display = j === index ? "block" : "none";
            blk.dataset.active = j === index ? "true" : "false";
          });
      };
      tabButtons.forEach((btn, i) =>
        btn.addEventListener("click", () => activateTab(i)),
      );

      // Mount: insert wrapper, add bar, move blocks in
      block.parentNode!.insertBefore(wrapper, block);
      wrapper.appendChild(bar);
      group.forEach((b, i) => {
        b.style.display = i === 0 ? "block" : "none";
        b.dataset.active = i === 0 ? "true" : "false";
        b.style.margin = "0";
        b.style.borderRadius = "0";
        wrapper.appendChild(b);
      });
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
        className={`break-words ${textColorClass} [&_*]:${textColorClass} [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-xs [&_h1]:mt-4 [&_h2]:mt-3 [&_h3]:mt-2 [&_h4]:mt-2 [&_h5]:mt-2 [&_h6]:mt-2 [&_strong]:font-bold [&_strong]:${textColorClass} [&_em]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_table]:block [&_table]:overflow-x-auto [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:border-b [&_th]:border-gray-800 [&_th]:text-gray-200 [&_th]:font-bold [&_th]:text-sm [&_td]:px-4 [&_td]:py-2 [&_td]:border-b [&_td]:border-gray-900 [&_td]:text-gray-400 [&_td]:text-sm`}
      />
      {actionContainer}
    </div>
  );
};

export default MDXRenderer;
