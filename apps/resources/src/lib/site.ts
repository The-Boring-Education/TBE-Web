import { DEFAULT_OG_IMAGE } from "@tbe/constants";

/**
 * Open Graph image entry for Next.js metadata. Falls back to the shared TBE
 * social preview image when a resource does not provide its own `ogImage`.
 */
export function getOgImage(ogImage?: string) {
  if (ogImage) return { url: ogImage, alt: DEFAULT_OG_IMAGE.alt };
  return {
    url: DEFAULT_OG_IMAGE.url,
    width: DEFAULT_OG_IMAGE.width,
    height: DEFAULT_OG_IMAGE.height,
    type: DEFAULT_OG_IMAGE.type,
    alt: DEFAULT_OG_IMAGE.alt,
  };
}

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
