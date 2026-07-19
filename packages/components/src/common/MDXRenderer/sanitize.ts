import DOMPurify from "dompurify";

const ALLOWED_URI_SCHEMES = ["http:", "https:", "mailto:"];

const SANITIZE_CONFIG = {
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
};

/**
 * Returns a DOMPurify instance bound to a window.
 * In the browser it uses the global window; during SSR it lazily binds to a
 * jsdom window so markup is sanitized before it is ever sent to the client
 * (a no-op on the server would emit unsanitized HTML in the initial response).
 */
let purifier: typeof DOMPurify | null = null;

const getPurifier = (): typeof DOMPurify => {
  if (purifier) return purifier;

  if (typeof window !== "undefined") {
    purifier = DOMPurify;
    return purifier;
  }

  // Server only. jsdom is aliased to `false` in the client webpack config of
  // the consuming apps, so this static require is stripped from client bundles
  // while remaining traceable for the server build.

  const { JSDOM } = require("jsdom");
  purifier = DOMPurify(
    new JSDOM("").window as unknown as Parameters<typeof DOMPurify>[0],
  );
  return purifier;
};

/**
 * Sanitizes HTML to prevent XSS attacks.
 * Allows safe HTML tags/attributes while stripping dangerous ones.
 * Runs on both the server (SSR) and the client.
 */
export const sanitizeHTML = (html: string): string =>
  getPurifier().sanitize(html, SANITIZE_CONFIG);

/**
 * Validates that a URL uses only safe schemes and returns a normalized,
 * percent-encoded href. Serializing the parsed URL prevents attribute
 * injection (e.g. embedded quotes breaking out of the href attribute).
 * Returns "#" when the scheme is not allowed or the value cannot be parsed.
 */
export const sanitizeHref = (href: string | null | undefined): string => {
  if (!href) return "#";
  const trimmed = href.trim();

  // Absolute URL (has its own scheme).
  try {
    const url = new URL(trimmed);
    return ALLOWED_URI_SCHEMES.includes(url.protocol) ? url.toString() : "#";
  } catch {
    // Not an absolute URL; fall through to relative handling.
  }

  // Reject anything that looks like a (disallowed) scheme, e.g. javascript:.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return "#";

  // Relative path/fragment: percent-encode to neutralize quotes and spaces.
  return encodeURI(trimmed);
};

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);
const YOUTUBE_SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);
const YOUTUBE_VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;

export type YouTubeLink =
  { type: "playlist" } | { type: "video"; videoId: string };

/**
 * Parses a YouTube link by validating the URL's hostname (not a substring),
 * so URLs like https://evil.com/?q=youtube.com are not treated as YouTube.
 * Returns a playlist marker, an embeddable video id, or null.
 */
export const parseYouTubeLink = (
  href: string | null | undefined,
): YouTubeLink | null => {
  if (!href) return null;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    if (url.searchParams.get("list")) return { type: "playlist" };

    const videoId = url.searchParams.get("v");
    if (videoId && YOUTUBE_VIDEO_ID.test(videoId)) {
      return { type: "video", videoId };
    }

    const pathId = url.pathname.match(
      /^\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/,
    )?.[1];
    if (pathId) return { type: "video", videoId: pathId };

    return null;
  }

  if (YOUTUBE_SHORT_HOSTS.has(host)) {
    if (url.searchParams.get("list")) return { type: "playlist" };

    const pathId = url.pathname.match(/^\/([a-zA-Z0-9_-]{11})/)?.[1];
    if (pathId) return { type: "video", videoId: pathId };

    return null;
  }

  return null;
};
