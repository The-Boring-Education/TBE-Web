/**
 * Extracts inline styles and body inner HTML from a full HTML document so we can
 * embed content in the Next.js shell while keeping crawlable text on the page URL.
 */
export function extractEmbedParts(html: string): {
  styleTags: string;
  bodyHtml: string;
} {
  const styleBlocks: string[] = [];
  const styleRegex = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
  const styleFree = html.replace(styleRegex, (match) => {
    styleBlocks.push(match);
    return "";
  });

  const bodyMatch = styleFree.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch?.[1]?.trim() ?? styleFree.trim();

  return {
    styleTags: styleBlocks.join("\n"),
    bodyHtml,
  };
}
