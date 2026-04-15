/**
 * Canonical site URL for metadata, sitemap, and JSON-LD.
 * Override in deploy env for previews (e.g. Vercel URL).
 */
export function getSiteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_RESOURCES_SITE_URL ??
    "https://resources.theboringeducation.com";
  return raw.replace(/\/$/, "");
}

export function getPlatformSignupUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://theboringeducation.com"
  ).replace(/\/$/, "");
}
