import { type AppIdentifier, favicons, getAppConfig } from "@tbe/constants"
import type { GetSEOMetaResponseType } from "@tbe/types"
import Head from "next/head"
import { useRouter } from "next/router"

interface EnhancedSEOProps {
    seoMeta: GetSEOMetaResponseType
    appId?: AppIdentifier
    domain?: string
}

/**
 * Enhanced SEO Component
 *
 * Supports app-aware domain configuration and comprehensive SEO metadata.
 * Automatically uses the correct domain based on app identifier.
 *
 * @param seoMeta - SEO metadata object
 * @param appId - App identifier (optional, defaults to 'platform')
 * @param domain - Custom domain override (optional)
 */
const SEO = ({ seoMeta, appId = "platform", domain }: EnhancedSEOProps) => {
    const router = useRouter()
    const appConfig = getAppConfig(appId)
    const baseDomain = domain || appConfig.domain

    // Build canonical URL
    const path = router.asPath === "/" ? "" : router.asPath.split("?")[0] // Remove query params for canonical
    const canonicalUrl = `${baseDomain}${path}`

    // Build OG URL (can include query params for tracking)
    const ogUrl = `${baseDomain}${router.asPath === "/" ? "" : router.asPath}`

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{seoMeta.title}</title>
            <meta content={seoMeta.description} name='description' />
            <meta content={seoMeta.keywords} name='keywords' />
            <meta content={seoMeta.robots} name='robots' />

            {/* Canonical URL */}
            <link href={canonicalUrl} rel='canonical' />

            {/* Open Graph / Facebook */}
            <meta content={seoMeta.type} property='og:type' />
            <meta content={ogUrl} property='og:url' />
            <meta content={seoMeta.title} property='og:title' />
            <meta content={seoMeta.description} property='og:description' />
            <meta content={seoMeta.image} property='og:image' />
            <meta content={seoMeta.siteName} property='og:site_name' />
            <meta content={seoMeta.author} property='og:author' />

            {/* Twitter Card */}
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content={seoMeta.title} />
            <meta name='twitter:description' content={seoMeta.description} />
            <meta name='twitter:image' content={seoMeta.image} />

            {/* Additional Meta Tags */}
            <meta content={seoMeta.author} name='author' />
            <meta content={seoMeta.publisher} name='publisher' />

            {/* Social Links */}
            <meta content={seoMeta.linkedIn} name='linkedin' />
            <meta content={seoMeta.instagram} name='instagram' />
            <meta content={seoMeta.github} name='github' />

            {/* Favicons */}
            {favicons.map((linkProps) => (
                <link key={linkProps.href} {...linkProps} />
            ))}

            {/* Browser Configuration */}
            <meta content='#ffffff' name='msapplication-TileColor' />
            <meta
                content='/favicon/browserconfig.xml'
                name='msapplication-config'
            />
            <meta content='#ff5757' name='theme-color' />
        </Head>
    )
}

export default SEO
