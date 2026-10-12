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

export const isAllowedTbeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false;
    }
    return isAllowedTbeHostname(parsedUrl.hostname);
  } catch {
    return false;
  }
};
