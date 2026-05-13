/**
 * Optional profile link fields (LinkedIn, GitHub, etc.).
 * Empty or whitespace-only values are treated as omitted (valid).
 */

const HTTP_SCHEME = /^https?:\/\//i;

function isLikelyPublicWebHostname(hostname: string): boolean {
  const h = hostname.trim().toLowerCase();
  if (!h) return false;
  if (h === "localhost") return true;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(h)) return true;
  if (h.includes(":")) return true;
  return h.includes(".");
}

/** Prepends https:// when the user omits the scheme so `URL` parses hostnames correctly. */
export function normalizeOptionalProfileUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return HTTP_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Returns a user-visible error message if `raw` is non-empty but not a valid http(s) URL,
 * otherwise `undefined`.
 */
export function getOptionalProfileUrlError(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    const u = new URL(normalizeOptionalProfileUrl(trimmed));
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return "Use a valid http or https URL.";
    }
    if (!isLikelyPublicWebHostname(u.hostname)) {
      return "Enter a full URL including a domain.";
    }
    return undefined;
  } catch {
    return "Enter a valid URL.";
  }
}
