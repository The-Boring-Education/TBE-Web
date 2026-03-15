import katex from "katex";
import type MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";

export function registerMathPlugin(md: MarkdownIt) {
  md.use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: { throwOnError: false },
  });
}

/**
 * Normalizes LaTeX delimiters to the `dollars` convention expected by
 * markdown-it-texmath:
 *   \[...\]  ->  $$...$$   (display math)
 *   \(...\)  ->  $...$     (inline math)
 */
export function normalizeLatexDelimiters(src: string): string {
  let out = src;
  out = out.replace(/\\\[/g, "$$");
  out = out.replace(/\\\]/g, "$$");
  out = out.replace(/\\\(/g, "$");
  out = out.replace(/\\\)/g, "$");
  return out;
}
