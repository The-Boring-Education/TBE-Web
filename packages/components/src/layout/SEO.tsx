import { type AppIdentifier, favicons, getAppConfig } from "@tbe/constants"
import type { GetSEOMetaResponseType } from "@tbe/types"
import Head from "next/head"
import { useRouter } from "next/router"

/**
 * JSON-LD Schema Types
 */
export type SchemaType =
    | "Organization"
    | "WebSite"
    | "Course"
    | "Article"
    | "FAQPage"
    | "Product"
    | "BreadcrumbList"

/**
 * Course schema for Shiksha courses
 */
export interface CourseSchema {
    name: string
    description: string
    provider?: string
    url?: string
    image?: string
    duration?: string
    skillLevel?: "Beginner" | "Intermediate" | "Advanced"
}

/**
 * FAQ Item for FAQPage schema
 */
export interface FAQItem {
    question: string
    answer: string
}

/**
 * Article schema for blog/webinar pages
 */
export interface ArticleSchema {
    headline: string
    description: string
    author?: string
    datePublished?: string
    dateModified?: string
    image?: string
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
    name: string
    url: string
}

interface EnhancedSEOProps {
    seoMeta: GetSEOMetaResponseType
    appId?: AppIdentifier
    domain?: string
    /**
     * JSON-LD Schema configuration
     */
    schema?: {
        /** Schema type to render */
        type?: SchemaType
        /** Course data for Course schema */
        course?: CourseSchema
        /** FAQ items for FAQPage schema */
        faq?: FAQItem[]
        /** Article data for Article schema */
        article?: ArticleSchema
        /** Breadcrumb items */
        breadcrumbs?: BreadcrumbItem[]
        /** Disable organization schema (included by default) */
        disableOrganization?: boolean
    }
}

/**
 * Generate Organization JSON-LD schema
 */
function getOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "The Boring Education",
        alternateName: "TBE",
        url: "https://theboringeducation.com",
        logo: "https://theboringeducation.com/images/large-og.png",
        sameAs: [
            "https://www.linkedin.com/company/theboringeducation",
            "https://www.instagram.com/theboringeducation",
            "https://github.com/The-Boring-Education",
            "https://twitter.com/imsks7"
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: "https://theboringeducation.com/contact"
        }
    }
}

/**
 * Generate WebSite JSON-LD schema
 */
function getWebSiteSchema(domain: string, siteName: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteName,
        url: domain,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${domain}/shiksha/explore?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    }
}

/**
 * Generate Course JSON-LD schema
 */
function getCourseSchema(course: CourseSchema, domain: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.name,
        description: course.description,
        provider: {
            "@type": "Organization",
            name: course.provider || "The Boring Education",
            sameAs: domain
        },
        ...(course.url && { url: course.url }),
        ...(course.image && { image: course.image }),
        ...(course.duration && {
            hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                duration: course.duration
            }
        }),
        ...(course.skillLevel && {
            educationalLevel: course.skillLevel
        }),
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
            availability: "https://schema.org/InStock"
        }
    }
}

/**
 * Generate FAQPage JSON-LD schema
 */
function getFAQSchema(faqItems: FAQItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer
            }
        }))
    }
}

/**
 * Generate Article JSON-LD schema
 */
function getArticleSchema(article: ArticleSchema, domain: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.headline,
        description: article.description,
        author: {
            "@type": "Person",
            name: article.author || "The Boring Education Team"
        },
        publisher: {
            "@type": "Organization",
            name: "The Boring Education",
            logo: {
                "@type": "ImageObject",
                url: "https://theboringeducation.com/images/large-og.png"
            }
        },
        ...(article.datePublished && { datePublished: article.datePublished }),
        ...(article.dateModified && { dateModified: article.dateModified }),
        ...(article.image && {
            image: {
                "@type": "ImageObject",
                url: article.image
            }
        }),
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": domain
        }
    }
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
function getBreadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    }
}

/**
 * Enhanced SEO Component
 *
 * Supports app-aware domain configuration, comprehensive SEO metadata,
 * and JSON-LD structured data for rich search results.
 *
 * @param seoMeta - SEO metadata object
 * @param appId - App identifier (optional, defaults to 'platform')
 * @param domain - Custom domain override (optional)
 * @param schema - JSON-LD schema configuration (optional)
 */
const SEO = ({
    seoMeta,
    appId = "platform",
    domain,
    schema
}: EnhancedSEOProps) => {
    const router = useRouter()
    const appConfig = getAppConfig(appId)
    const baseDomain = domain || appConfig.domain

    // Build canonical URL
    const path = router.asPath === "/" ? "" : router.asPath.split("?")[0]
    const canonicalUrl = `${baseDomain}${path}`

    // Build OG URL (can include query params for tracking)
    const ogUrl = `${baseDomain}${router.asPath === "/" ? "" : router.asPath}`

    // Build JSON-LD schemas
    const jsonLdSchemas: object[] = []

    // Add Organization schema by default (unless disabled)
    if (!schema?.disableOrganization) {
        jsonLdSchemas.push(getOrganizationSchema())
    }

    // Add WebSite schema for homepage
    if (router.asPath === "/" || router.asPath === "") {
        jsonLdSchemas.push(getWebSiteSchema(baseDomain, seoMeta.siteName))
    }

    // Add type-specific schemas
    if (schema?.type === "Course" && schema.course) {
        jsonLdSchemas.push(getCourseSchema(schema.course, baseDomain))
    }

    if (schema?.type === "FAQPage" && schema.faq && schema.faq.length > 0) {
        jsonLdSchemas.push(getFAQSchema(schema.faq))
    }

    if (schema?.type === "Article" && schema.article) {
        jsonLdSchemas.push(getArticleSchema(schema.article, canonicalUrl))
    }

    if (schema?.breadcrumbs && schema.breadcrumbs.length > 0) {
        jsonLdSchemas.push(getBreadcrumbSchema(schema.breadcrumbs))
    }

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{seoMeta.title}</title>
            <meta content={seoMeta.description} name="description" />
            <meta content={seoMeta.keywords} name="keywords" />
            <meta content={seoMeta.robots} name="robots" />

            {/* Canonical URL */}
            <link href={canonicalUrl} rel="canonical" />

            {/* Open Graph / Facebook */}
            <meta content={seoMeta.type} property="og:type" />
            <meta content={ogUrl} property="og:url" />
            <meta content={seoMeta.title} property="og:title" />
            <meta content={seoMeta.description} property="og:description" />
            <meta content={seoMeta.image} property="og:image" />
            <meta content={seoMeta.siteName} property="og:site_name" />
            <meta content={seoMeta.author} property="og:author" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seoMeta.title} />
            <meta name="twitter:description" content={seoMeta.description} />
            <meta name="twitter:image" content={seoMeta.image} />

            {/* Additional Meta Tags */}
            <meta content={seoMeta.author} name="author" />
            <meta content={seoMeta.publisher} name="publisher" />

            {/* Social Links */}
            <meta content={seoMeta.linkedIn} name="linkedin" />
            <meta content={seoMeta.instagram} name="instagram" />
            <meta content={seoMeta.github} name="github" />

            {/* Favicons */}
            {favicons.map((linkProps) => (
                <link key={linkProps.href} {...linkProps} />
            ))}

            {/* Browser Configuration */}
            <meta content="#ffffff" name="msapplication-TileColor" />
            <meta
                content="/favicon/browserconfig.xml"
                name="msapplication-config"
            />
            <meta content="#ff5757" name="theme-color" />

            {/* JSON-LD Structured Data */}
            {jsonLdSchemas.map((schema, index) => (
                <script
                    key={`json-ld-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema)
                    }}
                />
            ))}
        </Head>
    )
}

export default SEO

// Export schema helper functions for external use
export {
    getOrganizationSchema,
    getWebSiteSchema,
    getCourseSchema,
    getFAQSchema,
    getArticleSchema,
    getBreadcrumbSchema
}
