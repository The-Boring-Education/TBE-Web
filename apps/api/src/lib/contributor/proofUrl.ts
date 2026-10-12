/**
 * Proof URL classifier — turns a user-supplied proof link into a kind,
 * a normalized URL and (for GitHub pull requests) its structured parts.
 *
 * Never throws: anything unparseable comes back as `other` with a warning.
 */

export type ProofKind =
  | "github_pr"
  | "github_issue"
  | "blog"
  | "tweet"
  | "linkedin"
  | "youtube"
  | "drive"
  | "other";

export type ProofParts = {
  owner: string;
  repo: string;
  number: number;
};

export type ProofClassification = {
  kind: ProofKind;
  canonicalUrl: string;
  parts?: ProofParts;
  warnings: string[];
};

const GITHUB_PULL_PATH = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/;
const GITHUB_ISSUE_PATH = /^\/([^/]+)\/([^/]+)\/issues\/(\d+)\/?$/;

const isHost = (hostname: string, domain: string): boolean =>
  hostname === domain || hostname.endsWith(`.${domain}`);

const stripTrailingSlash = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

/** Drops the fragment and any trailing slash; keeps the query string. */
const normalizeUrl = (url: URL): string => {
  const normalized = new URL(url.toString());
  normalized.hash = "";
  normalized.pathname = stripTrailingSlash(normalized.pathname);
  return normalized.toString();
};

export const classify = (url: string): ProofClassification => {
  const trimmed = (url ?? "").trim();

  if (!trimmed) {
    return {
      kind: "other",
      canonicalUrl: "",
      warnings: ["Proof URL is empty"],
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      kind: "other",
      canonicalUrl: trimmed,
      warnings: [`Could not parse "${trimmed}" as a URL`],
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      kind: "other",
      canonicalUrl: trimmed,
      warnings: [
        `Unsupported URL scheme "${parsed.protocol.replace(":", "")}"`,
      ],
    };
  }

  if (!parsed.hostname) {
    return {
      kind: "other",
      canonicalUrl: trimmed,
      warnings: ["URL has no hostname"],
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const pathname = stripTrailingSlash(parsed.pathname);

  if (isHost(hostname, "github.com")) {
    const pull = GITHUB_PULL_PATH.exec(pathname);
    if (pull) {
      const [, owner = "", repo = "", number = ""] = pull;
      return {
        kind: "github_pr",
        canonicalUrl: `https://github.com/${owner}/${repo}/pull/${number}`,
        parts: { owner, repo, number: Number(number) },
        warnings: [],
      };
    }

    const issue = GITHUB_ISSUE_PATH.exec(pathname);
    if (issue) {
      const [, owner = "", repo = "", number = ""] = issue;
      return {
        kind: "github_issue",
        canonicalUrl: `https://github.com/${owner}/${repo}/issues/${number}`,
        warnings: [],
      };
    }
  }

  const canonicalUrl = normalizeUrl(parsed);

  if (isHost(hostname, "twitter.com") || isHost(hostname, "x.com")) {
    return { kind: "tweet", canonicalUrl, warnings: [] };
  }

  if (isHost(hostname, "linkedin.com")) {
    return { kind: "linkedin", canonicalUrl, warnings: [] };
  }

  if (isHost(hostname, "youtube.com") || isHost(hostname, "youtu.be")) {
    return { kind: "youtube", canonicalUrl, warnings: [] };
  }

  if (isHost(hostname, "drive.google.com")) {
    return { kind: "drive", canonicalUrl, warnings: [] };
  }

  return { kind: "blog", canonicalUrl, warnings: [] };
};
