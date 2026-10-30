/**
 * Validates and sanitizes a redirect target to prevent open redirect and client-side XSS.
 * Accepts safe relative paths starting with a single '/' (blocking '//', '\', 'javascript:', etc.)
 * or trusted domain URLs (converting them to safe relative paths).
 */
export const getSafeRedirectPath = (
  rawPath: unknown,
  fallback = "/",
): string => {
  if (typeof rawPath !== "string") {
    return fallback;
  }
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return fallback;
  }

  // Ensure relative path starting with a single '/' and no protocol-relative slashes or backslashes
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\")
  ) {
    return trimmed;
  }

  // Allow trusted absolute URLs by converting to a safe relative path
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "theboringeducation.com" ||
        hostname.endsWith(".theboringeducation.com")
      ) {
        const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        if (
          relative.startsWith("/") &&
          !relative.startsWith("//") &&
          !relative.includes("\\")
        ) {
          return relative;
        }
      }
    }
  } catch {
    // Malformed or invalid URL
  }

  return fallback;
};
