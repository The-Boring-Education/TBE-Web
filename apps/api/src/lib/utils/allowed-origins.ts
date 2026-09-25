/**
 * Shared origin allowlist for OAuth redirect_uri, CORS, and Edge middleware.
 *
 * TBE Vercel previews use `{project}-git-{branch}-tbe.vercel.app` (the trailing
 * `-tbe` is the team slug). We require a known project slug so a hobby project
 * like `evil-tbe.vercel.app` cannot be used as an OAuth redirect target.
 */

const TBE_VERCEL_PROJECT_SLUGS = [
  "tbe",
  "dsayatra",
  "prepyatra",
  "prep-yatra",
  "quizes",
  "techyatra",
  "onboarding",
  "resume-yatra",
  "resumeyatra",
  "oncampus",
  "admin",
  "platform",
  "resources",
  "contributor",
  "the-boring-education",
  "theboringeducation",
] as const;

const isLocalhost = (hostname: string): boolean =>
  hostname === "localhost" || hostname === "127.0.0.1";

const isTbeProductionHost = (hostname: string): boolean =>
  hostname === "theboringeducation.com" ||
  hostname.endsWith(".theboringeducation.com");

const isTbeVercelPreviewHost = (hostname: string): boolean => {
  if (!hostname.endsWith("-tbe.vercel.app")) {
    return false;
  }

  return TBE_VERCEL_PROJECT_SLUGS.some(
    (slug) =>
      hostname === `${slug}-tbe.vercel.app` || hostname.startsWith(`${slug}-`),
  );
};

export const isAllowedTbeHostname = (hostname: string): boolean =>
  isLocalhost(hostname) ||
  isTbeProductionHost(hostname) ||
  isTbeVercelPreviewHost(hostname);

const hostnameMatchesExtraOrigins = (
  hostname: string,
  extraOrigins: string,
): boolean =>
  extraOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .some((origin) => {
      try {
        return new URL(origin).hostname === hostname;
      } catch {
        return false;
      }
    });

export const isAllowedTbeUrl = (
  url: string,
  extraOrigins = process.env.ALLOWED_AUTH_ORIGINS || "",
): boolean => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false;
    }
    const { hostname } = parsedUrl;
    if (isAllowedTbeHostname(hostname)) {
      return true;
    }
    return hostnameMatchesExtraOrigins(hostname, extraOrigins);
  } catch {
    return false;
  }
};
