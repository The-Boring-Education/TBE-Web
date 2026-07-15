import DOMPurify from "dompurify";

const ALLOWED_URI_SCHEMES = ["http:", "https:", "mailto:"];

/**
 * Sanitizes HTML to prevent XSS attacks.
 * Allows safe HTML tags/attributes while stripping dangerous ones.
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof window === "undefined") return html;

  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "target",
      "frameborder",
      "allow",
      "allowfullscreen",
      "class",
      "style",
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
};

/**
 * Validates that a URL uses only safe schemes.
 * Returns the URL if safe, or "#" if not.
 */
export const sanitizeHref = (href: string | null | undefined): string => {
  if (!href) return "#";
  try {
    const url = new URL(href, "https://placeholder.invalid");
    if (ALLOWED_URI_SCHEMES.includes(url.protocol)) {
      return href;
    }
    return "#";
  } catch {
    return "#";
  }
};
