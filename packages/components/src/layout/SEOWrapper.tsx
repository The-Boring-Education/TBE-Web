import {
  type AppIdentifier,
  getAppIdentifierFromDomain,
  getSEOMeta,
} from "@tbe/constants";
import type { GetSEOMetaResponseType } from "@tbe/types";
import { useRouter } from "next/router";

import SEO from "./SEO";

interface SEOWrapperProps {
  appId?: AppIdentifier;
  slug?: string;
  customMeta?: Partial<GetSEOMetaResponseType>;
  domain?: string;
}

/**
 * SEO Wrapper Component
 *
 * A convenient wrapper that automatically generates SEO metadata based on the current route.
 * This component simplifies SEO implementation across all TBE apps.
 *
 * Usage:
 * ```tsx
 * // In a page component
 * export const getStaticProps = async () => ({
 *   props: { slug: routes.home },
 * });
 *
 * const Page = ({ slug }: { slug: string }) => (
 *   <SEOWrapper appId="platform" slug={slug} />
 * );
 * ```
 *
 * @param appId - App identifier (optional, will auto-detect from domain if not provided)
 * @param slug - Current route slug (optional, will use router path if not provided)
 * @param customMeta - Custom metadata to override defaults (optional)
 * @param domain - Custom domain override (optional)
 */
const SEOWrapper = ({ appId, slug, customMeta, domain }: SEOWrapperProps) => {
  let router: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    // App Router or RouterContext not mounted
  }

  // Auto-detect app ID from domain if not provided
  const detectedAppId =
    appId ||
    getAppIdentifierFromDomain(
      typeof window !== "undefined" ? window.location.hostname : undefined,
    );

  // Use provided slug or fallback to router path
  const routePath =
    slug || (router?.asPath ? router.asPath.split("?")[0] : "/");

  // Get SEO metadata
  const baseMeta = getSEOMeta(routePath, detectedAppId);

  // Merge with custom metadata if provided
  const seoMeta = customMeta ? { ...baseMeta, ...customMeta } : baseMeta;

  return <SEO seoMeta={seoMeta} appId={detectedAppId} domain={domain} />;
};

/**
 * Page-level SEO Wrapper
 *
 * Use this in your page components for automatic SEO handling.
 *
 * Example:
 * ```tsx
 * const HomePage = ({ seoMeta }: PageProps) => (
 *   <Fragment>
 *     <PageSEO seoMeta={seoMeta} appId="platform" />
 *     <YourPageContent />
 *   </Fragment>
 * );
 * ```
 */
export const PageSEO = ({
  seoMeta,
  appId = "platform",
  domain,
}: {
  seoMeta: GetSEOMetaResponseType;
  appId?: AppIdentifier;
  domain?: string;
}) => {
  return <SEO seoMeta={seoMeta} appId={appId} domain={domain} />;
};

export default SEOWrapper;
