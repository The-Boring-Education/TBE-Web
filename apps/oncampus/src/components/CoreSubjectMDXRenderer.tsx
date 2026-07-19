import MarkdownIt from "markdown-it";
import { useMemo, useState } from "react";

const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
  go: "Go",
  typescript: "TypeScript",
  sql: "SQL",
};

interface TabbedCodeBlockProps {
  defaultLanguage: string;
  languages: Record<string, { code: string }>;
}

const TabbedCodeBlock = ({
  defaultLanguage,
  languages,
}: TabbedCodeBlockProps) => {
  const availableLanguages = Object.keys(languages);
  const [activeLanguage, setActiveLanguage] = useState(
    availableLanguages.includes(defaultLanguage)
      ? defaultLanguage
      : availableLanguages[0] || "python",
  );
  const [copied, setCopied] = useState(false);

  const currentCode = languages[activeLanguage]?.code || "// No code available";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const codeLines = currentCode.split("\n");

  return (
    <div className="bg-[#141414] border border-gray-800/80 rounded-lg overflow-hidden my-6 -mx-2 sm:mx-0 max-sm:rounded-[6px]">
      {/* Language tabs */}
      <div className="flex border-b border-gray-800/50 bg-[#111] overflow-x-auto">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => {
              setActiveLanguage(lang);
              setCopied(false);
            }}
            className={`px-3.5 py-2 text-xs font-mono transition-all duration-200 whitespace-nowrap border-b-2 cursor-pointer ${
              activeLanguage === lang
                ? "text-red-400 border-red-500 bg-red-950/10"
                : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#1a1a1a]"
            }`}
          >
            {LANGUAGE_LABELS[lang] ||
              lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
      </div>

      {/* Code block with line numbers and copy */}
      <div className="relative group">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono rounded border transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 cursor-pointer"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <div className="flex bg-[#0d0d0d] overflow-x-auto">
          {/* Line numbers */}
          <div className="py-3 pl-3 pr-2 select-none border-r border-gray-800/30 shrink-0 hidden sm:block">
            {codeLines.map((_, i) => (
              <div
                key={i}
                className="font-mono text-[11px] text-gray-600 leading-relaxed text-right min-w-[20px]"
              >
                {i + 1}
              </div>
            ))}
          </div>
          {/* Code */}
          <div className="py-3 px-3 flex-1 min-w-0">
            <pre className="font-mono text-[11px] sm:text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap break-words sm:whitespace-pre sm:break-normal bg-transparent p-0 m-0 border-0 shadow-none">
              {currentCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlainTextBlockProps {
  content: string;
}

const PlainTextBlock = ({ content }: PlainTextBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="relative group bg-[#0A0A0A] border border-gray-800/40 rounded-lg my-6 overflow-hidden -mx-2 sm:mx-0 max-sm:rounded-[6px]">
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 px-2 py-1 text-[10px] font-mono rounded border transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 cursor-pointer"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
      <div className="overflow-x-auto p-4 scrollbar-thin-grey">
        <pre className="font-mono text-[11px] sm:text-[12.5px] text-gray-300 leading-relaxed whitespace-pre-wrap break-words sm:whitespace-pre sm:break-normal bg-transparent p-0 m-0 border-0 shadow-none">
          {content}
        </pre>
      </div>
    </div>
  );
};

interface CoreSubjectMDXRendererProps {
  mdxSource: string;
}

export const CoreSubjectMDXRenderer = ({
  mdxSource,
}: CoreSubjectMDXRendererProps) => {
  const md = useMemo(() => {
    const instance = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
    });

    // Custom heading renderer to assign classes matching packages/components
    instance.renderer.rules.heading_open = (tokens: any[], idx: number) => {
      const token = tokens[idx];
      const { tag } = token;
      const level = parseInt(tag.charAt(1)) || 1;

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
      return `<${tag}${idAttr} class="text-contentDark font-bold mb-2 ${sizeClass}">`;
    };

    instance.renderer.rules.heading_close = (tokens: any[], idx: number) => {
      const token = tokens[idx];
      return `</${token.tag}>`;
    };

    instance.renderer.rules.strong_open = () =>
      `<strong class="font-bold text-contentDark">`;
    instance.renderer.rules.strong_close = () => `</strong>`;
    instance.renderer.rules.em_open = () =>
      `<em class="italic text-contentDark">`;
    instance.renderer.rules.em_close = () => `</em>`;

    instance.renderer.rules.ordered_list_open = () =>
      `<ol class="md-list list-decimal pl-5 mb-3 text-contentDark">`;
    instance.renderer.rules.bullet_list_open = () =>
      `<ul class="md-list list-disc pl-5 mb-3 text-contentDark">`;
    instance.renderer.rules.paragraph_open = () =>
      `<p class="mb-2 text-contentDark">`;

    instance.renderer.rules.link_open = (tokens: any, idx: any) => {
      const token = tokens[idx];
      const href = token.attrGet("href") || "";
      if (!href) {
        return `<a class="text-primary underline strong-text">`;
      }
      if (href.includes("youtube.com") || href.includes("youtu.be")) {
        if (href.includes("list=")) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary underline strong-text">`;
        }
        let videoId: string | undefined;
        if (href.includes("v=")) {
          videoId = href.split("v=")[1]?.split("&")[0];
        } else if (href.includes("youtu.be/")) {
          videoId = href.split("youtu.be/")[1]?.split(/[?&#]/)[0];
        }
        if (videoId) {
          const embedHref = `https://www.youtube.com/embed/${videoId}`;
          return `<div class="relative w-full max-w-full overflow-hidden rounded aspect-video my-4"><iframe class="absolute inset-0 w-full h-full rounded" src="${embedHref}" title="YouTube video" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
        }
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary underline strong-text">`;
    };

    // Explicit image renderer
    instance.renderer.rules.image = (
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

    return instance;
  }, []);

  const parseMarkdownToSegments = (src: string) => {
    const lines = src.split("\n");
    const segments: Array<
      | { type: "html"; content: string }
      | {
          type: "code";
          defaultLanguage: string;
          languages: Record<string, { code: string }>;
        }
      | { type: "text-block"; content: string }
    > = [];
    let currentMarkdownLines: string[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        if (currentMarkdownLines.length > 0) {
          segments.push({
            type: "html",
            content: currentMarkdownLines.join("\n"),
          });
          currentMarkdownLines = [];
        }

        const initialLang = line.trim().slice(3).trim().toLowerCase() || "text";

        if (["text", "txt", "plaintext"].includes(initialLang)) {
          const codeLines: string[] = [];
          i++; // skip ```
          while (i < lines.length) {
            const codeLine = lines[i];
            if (codeLine.trim() === "```") {
              i++;
              break;
            }
            codeLines.push(codeLine);
            i++;
          }
          segments.push({
            type: "text-block",
            content: codeLines.join("\n"),
          });
          continue;
        }

        const groupLanguages: Record<string, { code: string }> = {};
        let firstLang = "";

        while (i < lines.length) {
          const currentLine = lines[i];
          if (!currentLine.trim().startsWith("```")) {
            if (currentLine.trim() === "") {
              i++;
              continue;
            }
            break;
          }

          const lang =
            currentLine.trim().slice(3).trim().toLowerCase() || "text";
          if (!firstLang) {
            firstLang = lang;
          }

          const codeLines: string[] = [];
          i++;
          while (i < lines.length) {
            const codeLine = lines[i];
            if (codeLine.trim() === "```") {
              i++;
              break;
            }
            codeLines.push(codeLine);
            i++;
          }

          groupLanguages[lang] = { code: codeLines.join("\n") };

          let nextIdx = i;
          while (nextIdx < lines.length && lines[nextIdx].trim() === "") {
            nextIdx++;
          }
          if (
            nextIdx < lines.length &&
            lines[nextIdx].trim().startsWith("```")
          ) {
            i = nextIdx;
          } else {
            break;
          }
        }

        segments.push({
          type: "code",
          defaultLanguage: firstLang,
          languages: groupLanguages,
        });
      } else {
        currentMarkdownLines.push(line);
        i++;
      }
    }

    if (currentMarkdownLines.length > 0) {
      segments.push({ type: "html", content: currentMarkdownLines.join("\n") });
    }

    return segments;
  };

  const segments = useMemo(() => {
    return parseMarkdownToSegments(mdxSource);
  }, [mdxSource]);

  const renderHTMLSegment = (src: string) => {
    // Basic Latex delimiter normalizer fallback
    let out = src;
    out = out.replace(/\\\[/g, "$$");
    out = out.replace(/\\\]/g, "$$");
    out = out.replace(/\\\(/g, "$");
    out = out.replace(/\\\)/g, "$");

    let html = md.render(out);

    if (html.includes("**")) {
      html = html.replace(/\*\*([^*\n<]+?)\*\*/g, (match, text) => {
        if (match.includes("<") || match.includes(">")) {
          return match;
        }
        return `<strong class="font-bold text-contentDark">${text.trim()}</strong>`;
      });
    }
    return html;
  };

  return (
    <div className="w-full flex flex-col justify-between">
      <div className="space-y-6 text-contentDark">
        {segments.map((seg, idx) => {
          if (seg.type === "html") {
            const html = renderHTMLSegment(seg.content);
            return (
              <div
                key={idx}
                dangerouslySetInnerHTML={{ __html: html }}
                className="break-words text-contentDark [&_*]:text-contentDark [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-xs [&_h1]:mt-4 [&_h2]:mt-3 [&_h3]:mt-2 [&_h4]:mt-2 [&_h5]:mt-2 [&_h6]:mt-2 [&_strong]:font-bold [&_strong]:text-contentDark [&_em]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_table]:block [&_table]:overflow-x-auto [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:border-b [&_th]:border-gray-800 [&_th]:text-gray-200 [&_th]:font-bold [&_th]:text-sm [&_td]:px-4 [&_td]:py-2 [&_td]:border-b [&_td]:border-gray-900 [&_td]:text-gray-400 [&_td]:text-sm"
              />
            );
          } else if (seg.type === "text-block") {
            return <PlainTextBlock key={idx} content={seg.content} />;
          } else {
            return (
              <TabbedCodeBlock
                key={idx}
                defaultLanguage={seg.defaultLanguage}
                languages={seg.languages}
              />
            );
          }
        })}
      </div>
    </div>
  );
};
