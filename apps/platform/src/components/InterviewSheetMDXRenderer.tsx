import { sanitizeHTML } from '@tbe/components';
import { Check, Copy } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { useMemo, useState } from 'react';

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TSX',
  go: 'Go',
  typescript: 'TypeScript',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
};

interface TabbedCodeBlockProps {
  defaultLanguage: string;
  languages: Record<string, { code: string }>;
  theme?: 'light' | 'dark';
}

const TabbedCodeBlock = ({
  defaultLanguage,
  languages,
  theme = 'light',
}: TabbedCodeBlockProps) => {
  const availableLanguages = Object.keys(languages);
  const [activeLanguage, setActiveLanguage] = useState(
    availableLanguages.includes(defaultLanguage)
      ? defaultLanguage
      : availableLanguages[0] || 'javascript',
  );
  const [copied, setCopied] = useState(false);

  const currentCode = languages[activeLanguage]?.code || '// No code available';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const codeLines = currentCode.split('\n');
  const isDark = theme === 'dark';

  return (
    <div
      className={`border rounded-xl overflow-hidden my-5 shadow-2xs ${
        isDark
          ? 'bg-[#0f0f11] border-gray-800'
          : 'bg-[#F8F9FD] border-border/80'
      }`}
    >
      {/* Code Header: Languages & Copy */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isDark
            ? 'border-gray-800/80 bg-[#151518]'
            : 'border-border/60 bg-muted/40'
        }`}
      >
        <div className='flex items-center gap-2 overflow-x-auto'>
          {availableLanguages.length === 1 ? (
            <span
              className={`text-xs font-bold font-mono uppercase tracking-wider ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {LANGUAGE_LABELS[availableLanguages[0]] ||
                availableLanguages[0].toUpperCase()}
            </span>
          ) : (
            availableLanguages.map((lang) => {
              const isActive = activeLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => {
                    setActiveLanguage(lang);
                    setCopied(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all duration-150 cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'text-purple-400 bg-purple-950/40 font-semibold'
                        : 'text-purple-700 bg-purple-100/70 font-semibold'
                      : isDark
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {LANGUAGE_LABELS[lang] ||
                    lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              );
            })
          )}
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md transition-all duration-150 cursor-pointer ${
            isDark
              ? 'text-gray-400 hover:text-white hover:bg-gray-800'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {copied ? (
            <Check className='w-3.5 h-3.5 text-emerald-500' />
          ) : (
            <Copy className='w-3.5 h-3.5' />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code with Line numbers */}
      <div className='flex overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed'>
        <div
          className={`py-3 pl-3 pr-2.5 select-none border-r shrink-0 text-right ${
            isDark
              ? 'border-gray-800/40 text-gray-600 bg-[#0d0d0f]'
              : 'border-border/40 text-muted-foreground/40 bg-muted/10'
          }`}
        >
          {codeLines.map((_, i) => (
            <div key={i} className='min-w-[20px]'>
              {i + 1}
            </div>
          ))}
        </div>
        <div className='py-3 px-4 flex-1 min-w-0'>
          <pre
            className={`font-mono bg-transparent p-0 m-0 border-0 shadow-none whitespace-pre overflow-x-auto ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            {currentCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

interface PlainTextBlockProps {
  content: string;
  theme?: 'light' | 'dark';
}

const PlainTextBlock = ({ content, theme = 'light' }: PlainTextBlockProps) => {
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

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
    <div
      className={`relative group border rounded-xl my-4 overflow-hidden shadow-2xs ${
        isDark
          ? 'bg-[#0f0f11] border-gray-800'
          : 'bg-[#F8F9FD] border-border/80'
      }`}
    >
      <button
        onClick={handleCopy}
        className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md border transition-all duration-150 opacity-0 group-hover:opacity-100 z-10 cursor-pointer ${
          isDark
            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
            : 'bg-card border-border text-muted-foreground hover:text-foreground'
        }`}
      >
        {copied ? (
          <Check className='w-3.5 h-3.5 text-emerald-500' />
        ) : (
          <Copy className='w-3.5 h-3.5' />
        )}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <div className='overflow-x-auto p-4'>
        <pre
          className={`font-mono text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words bg-transparent p-0 m-0 border-0 shadow-none ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}
        >
          {content}
        </pre>
      </div>
    </div>
  );
};

interface InterviewSheetMDXRendererProps {
  mdxSource: string;
  theme?: 'light' | 'dark';
}

export const InterviewSheetMDXRenderer = ({
  mdxSource,
  theme = 'light',
}: InterviewSheetMDXRendererProps) => {
  const textColorClass =
    theme === 'dark' ? 'text-contentDark' : 'text-contentLight';
  const isDark = theme === 'dark';

  const md = useMemo(() => {
    const instance = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
    });

    // Custom heading renderer with icons matching reference styling
    instance.renderer.rules.heading_open = (tokens: any[], idx: number) => {
      const token = tokens[idx];
      const nextToken = tokens[idx + 1];
      const titleText =
        nextToken && nextToken.type === 'inline' ? nextToken.content : '';
      const normalizedTitle = titleText.trim().toLowerCase();

      let prefixIcon = '';
      let headingColorClass = 'text-foreground font-semibold text-base';

      if (normalizedTitle.includes('problem statement')) {
        prefixIcon = '<span class="font-semibold">—</span> ';
        headingColorClass =
          'text-primary font-semibold text-xs uppercase tracking-wider';
      } else if (normalizedTitle.includes('answer')) {
        prefixIcon = '';
        headingColorClass =
          'text-primary font-semibold text-xs uppercase tracking-wider';
      } else if (
        normalizedTitle.includes('concept') ||
        normalizedTitle.includes('explanation')
      ) {
        prefixIcon = '<span class="text-amber-500 text-sm">💡</span> ';
        headingColorClass =
          'text-amber-500 font-semibold text-xs uppercase tracking-wider';
      } else if (
        normalizedTitle.includes('practical') ||
        normalizedTitle.includes('implementation')
      ) {
        prefixIcon =
          '<span class="font-mono text-primary text-xs font-semibold">&lt;/&gt;</span> ';
        headingColorClass =
          'text-primary font-semibold text-xs uppercase tracking-wider';
      } else if (normalizedTitle.includes('best practice')) {
        prefixIcon = '<span class="text-amber-500 text-sm">⭐</span> ';
        headingColorClass =
          'text-amber-500 font-semibold text-xs uppercase tracking-wider';
      } else if (normalizedTitle.includes('error handling')) {
        prefixIcon =
          '<span class="font-mono text-primary text-xs font-semibold">&lt;/&gt;</span> ';
        headingColorClass =
          'text-primary font-semibold text-xs uppercase tracking-wider';
      } else if (
        normalizedTitle.includes('real-world') ||
        normalizedTitle.includes('application')
      ) {
        prefixIcon = '<span class="text-purple-600 text-sm">🗂</span> ';
        headingColorClass =
          'text-purple-600 font-semibold text-xs uppercase tracking-wider';
      }

      return `<div class="mt-6 mb-3"><h3 class="${headingColorClass} flex items-center gap-1.5">${prefixIcon}<span>`;
    };

    instance.renderer.rules.heading_close = () => {
      return `</span></h3></div>`;
    };

    instance.renderer.rules.code_inline = (tokens: any[], idx: number) => {
      const token = tokens[idx];
      const code = token.content;
      return `<code class="font-mono text-xs sm:text-[13px] px-1.5 py-0.5 rounded-md ${
        isDark
          ? 'bg-muted/40 text-red-400 border border-gray-800'
          : 'bg-red-50 text-primary border border-red-200/50'
      } font-medium mx-0.5">${code}</code>`;
    };

    instance.renderer.rules.strong_open = () =>
      `<strong class="font-semibold ${textColorClass}">`;
    instance.renderer.rules.strong_close = () => `</strong>`;
    instance.renderer.rules.em_open = () =>
      `<em class="italic ${textColorClass}">`;
    instance.renderer.rules.em_close = () => `</em>`;

    instance.renderer.rules.ordered_list_open = () =>
      `<ol class="list-decimal pl-5 mb-3 space-y-1.5 ${textColorClass}">`;
    instance.renderer.rules.bullet_list_open = () =>
      `<ul class="list-disc pl-5 mb-3 space-y-1.5 ${textColorClass}">`;
    instance.renderer.rules.list_item_open = () =>
      `<li class="text-sm sm:text-[15px] leading-relaxed text-foreground/90 font-normal">`;
    instance.renderer.rules.list_item_close = () => `</li>`;
    instance.renderer.rules.paragraph_open = () =>
      `<p class="mb-3 text-sm sm:text-[15px] leading-relaxed text-foreground/90 font-normal">`;

    instance.renderer.rules.link_open = (tokens: any, idx: any) => {
      const token = tokens[idx];
      const href = token.attrGet('href');
      if (href.includes('youtube.com') || href.includes('youtu.be')) {
        if (href.includes('list=')) {
          return `<a href=${href} target="_blank" class="text-primary underline strong-text">`;
        } else {
          let embedHref = href;
          if (href.includes('watch')) {
            const videoId = href.split('v=')[1].split('&')[0];
            embedHref = `https://www.youtube.com/embed/${videoId}`;
          }
          return `<iframe width="100%" height="550" class="rounded" src="${embedHref}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }
      }
      return `<a href=${href} target="_blank" class="text-primary underline strong-text">`;
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
      const src = token.attrGet('src') || '';
      const alt = self.renderInlineAsText(token.children, options, env) || '';
      const title = token.attrGet('title') || '';
      return (
        `<figure class="my-6">` +
        `<img` +
        ` src="${src}"` +
        ` alt="${alt}"` +
        (title ? ` title="${title}"` : '') +
        ` loading="lazy"` +
        ` class="max-w-full h-auto rounded-xl border shadow-lg mx-auto block ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }"` +
        ` />` +
        (alt
          ? `<figcaption class="text-center text-xs text-gray-500 mt-2 italic">${alt}</figcaption>`
          : '') +
        `</figure>`
      );
    };

    return instance;
  }, [textColorClass, isDark]);

  const parseMarkdownToSegments = (src: string) => {
    const lines = src.split('\n');
    const segments: Array<
      | { type: 'html'; content: string }
      | {
          type: 'code';
          defaultLanguage: string;
          languages: Record<string, { code: string }>;
        }
      | { type: 'text-block'; content: string }
    > = [];
    let currentMarkdownLines: string[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (currentMarkdownLines.length > 0) {
          segments.push({
            type: 'html',
            content: currentMarkdownLines.join('\n'),
          });
          currentMarkdownLines = [];
        }

        const initialLang = line.trim().slice(3).trim().toLowerCase() || 'text';

        if (['text', 'txt', 'plaintext'].includes(initialLang)) {
          const codeLines: string[] = [];
          i++; // skip ```
          while (i < lines.length) {
            const codeLine = lines[i];
            if (codeLine.trim() === '```') {
              i++;
              break;
            }
            codeLines.push(codeLine);
            i++;
          }
          segments.push({
            type: 'text-block',
            content: codeLines.join('\n'),
          });
          continue;
        }

        const groupLanguages: Record<string, { code: string }> = {};
        let firstLang = '';

        while (i < lines.length) {
          const currentLine = lines[i];
          if (!currentLine.trim().startsWith('```')) {
            if (currentLine.trim() === '') {
              i++;
              continue;
            }
            break;
          }

          const lang =
            currentLine.trim().slice(3).trim().toLowerCase() || 'text';
          if (!firstLang) {
            firstLang = lang;
          }

          const codeLines: string[] = [];
          i++;
          while (i < lines.length) {
            const codeLine = lines[i];
            if (codeLine.trim() === '```') {
              i++;
              break;
            }
            codeLines.push(codeLine);
            i++;
          }

          groupLanguages[lang] = { code: codeLines.join('\n') };

          let nextIdx = i;
          while (nextIdx < lines.length && lines[nextIdx].trim() === '') {
            nextIdx++;
          }
          if (
            nextIdx < lines.length &&
            lines[nextIdx].trim().startsWith('```')
          ) {
            i = nextIdx;
          } else {
            break;
          }
        }

        segments.push({
          type: 'code',
          defaultLanguage: firstLang,
          languages: groupLanguages,
        });
      } else {
        currentMarkdownLines.push(line);
        i++;
      }
    }

    if (currentMarkdownLines.length > 0) {
      segments.push({ type: 'html', content: currentMarkdownLines.join('\n') });
    }

    return segments;
  };

  const segments = useMemo(() => {
    return parseMarkdownToSegments(mdxSource);
  }, [mdxSource]);

  const renderHTMLSegment = (src: string) => {
    // Basic Latex delimiter normalizer fallback
    let out = src;
    out = out.replace(/\\\[/g, '$$');
    out = out.replace(/\\\]/g, '$$');
    out = out.replace(/\\\(/g, '$');
    out = out.replace(/\\\)/g, '$');

    let html = md.render(out);

    if (html.includes('**')) {
      html = html.replace(/\*\*([^*\n<]+?)\*\*/g, (match, text) => {
        if (match.includes('<') || match.includes('>')) {
          return match;
        }
        return `<strong class="font-semibold ${textColorClass}">${text.trim()}</strong>`;
      });
    }
    return sanitizeHTML(html);
  };

  const containerClass = isDark
    ? 'break-words text-contentDark [&_*]:text-contentDark [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-xs [&_h1]:mt-4 [&_h2]:mt-3 [&_h3]:mt-2 [&_h4]:mt-2 [&_h5]:mt-2 [&_h6]:mt-2 [&_strong]:font-semibold [&_strong]:text-contentDark [&_em]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_table]:block [&_table]:overflow-x-auto [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:border-b [&_th]:border-gray-800 [&_th]:text-gray-200 [&_th]:font-semibold [&_th]:text-sm [&_td]:px-4 [&_td]:py-2 [&_td]:border-b [&_td]:border-gray-900 [&_td]:text-gray-400 [&_td]:text-sm [&_code]:font-mono [&_code]:text-xs [&_code]:sm:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-muted/40 [&_code]:text-red-400 [&_code]:border [&_code]:border-gray-800'
    : 'break-words text-contentLight [&_*]:text-contentLight [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-xs [&_h1]:mt-4 [&_h2]:mt-3 [&_h3]:mt-2 [&_h4]:mt-2 [&_h5]:mt-2 [&_h6]:mt-2 [&_strong]:font-semibold [&_strong]:text-contentLight [&_em]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_table]:block [&_table]:overflow-x-auto [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:border-b [&_th]:border-gray-200 [&_th]:text-gray-700 [&_th]:font-semibold [&_th]:text-sm [&_td]:px-4 [&_td]:py-2 [&_td]:border-b [&_td]:border-gray-100 [&_td]:text-gray-600 [&_td]:text-sm [&_code]:font-mono [&_code]:text-xs [&_code]:sm:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-red-50 [&_code]:text-primary [&_code]:border [&_code]:border-red-200/50';

  return (
    <div className='w-full flex flex-col justify-between'>
      <div className={`space-y-6 ${textColorClass}`}>
        {segments.map((seg, idx) => {
          if (seg.type === 'html') {
            const html = renderHTMLSegment(seg.content);
            return (
              <div
                key={idx}
                dangerouslySetInnerHTML={{ __html: html }}
                className={containerClass}
              />
            );
          } else if (seg.type === 'text-block') {
            return (
              <PlainTextBlock key={idx} content={seg.content} theme={theme} />
            );
          } else {
            return (
              <TabbedCodeBlock
                key={idx}
                defaultLanguage={seg.defaultLanguage}
                languages={seg.languages}
                theme={theme}
              />
            );
          }
        })}
      </div>
    </div>
  );
};
