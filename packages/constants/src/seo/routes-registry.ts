/**
 * SEO Routes Registry
 *
 * Centralized registry of all public routes per app for:
 * - next-sitemap generation
 * - Lighthouse CI URL collection
 * - SEO Inspector route listing
 *
 * This file defines which routes should be indexed by search engines
 * and provides configuration for sitemap generation.
 */

import type { AppIdentifier } from "../apps"
import { APP_CONFIGS } from "../apps"

/**
 * Route priority levels for sitemap
 */
export type RoutePriority = 1.0 | 0.9 | 0.8 | 0.7 | 0.6 | 0.5

/**
 * Change frequency options for sitemap
 */
export type ChangeFrequency =
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"

/**
 * SEO Route configuration
 */
export interface SEORouteConfig {
    /** Route path (e.g., "/", "/shiksha", "/shiksha/[courseSlug]") */
    path: string
    /** Priority for sitemap (1.0 = highest, 0.0 = lowest) */
    priority: RoutePriority
    /** How frequently the page is likely to change */
    changefreq: ChangeFrequency
    /** Whether this is a dynamic route with parameters */
    isDynamic?: boolean
    /** Description for SEO Inspector */
    description?: string
}

/**
 * App SEO configuration
 */
export interface AppSEOConfig {
    /** App identifier */
    appId: AppIdentifier
    /** Base domain for the app */
    domain: string
    /** List of public routes to be indexed */
    publicRoutes: SEORouteConfig[]
    /** Routes to exclude from sitemap/indexing (glob patterns) */
    excludedRoutes: string[]
    /** Additional robots.txt policies */
    robotsPolicies?: {
        userAgent: string
        allow?: string[]
        disallow?: string[]
    }[]
}

/**
 * Platform app public routes
 */
const platformRoutes: SEORouteConfig[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        description: "Homepage - Tech Education for Everyone"
    },
    {
        path: "/login",
        priority: 0.5,
        changefreq: "monthly",
        description: "Login page"
    },
    {
        path: "/topmate-sessions",
        priority: 0.8,
        changefreq: "weekly",
        description: "Mentorship sessions booking"
    },
    // Shiksha (Courses)
    {
        path: "/shiksha",
        priority: 0.9,
        changefreq: "weekly",
        description: "Shiksha - Online courses landing"
    },
    {
        path: "/shiksha/explore",
        priority: 0.9,
        changefreq: "weekly",
        description: "Explore all courses"
    },
    {
        path: "/shiksha/[courseSlug]",
        priority: 0.8,
        changefreq: "weekly",
        isDynamic: true,
        description: "Individual course pages"
    },
    // Projects
    {
        path: "/projects",
        priority: 0.9,
        changefreq: "weekly",
        description: "Projects landing page"
    },
    {
        path: "/projects/explore",
        priority: 0.9,
        changefreq: "weekly",
        description: "Explore all projects"
    },
    {
        path: "/projects/[projectSlug]",
        priority: 0.8,
        changefreq: "weekly",
        isDynamic: true,
        description: "Individual project pages"
    },
    // Interview Prep
    {
        path: "/interview-prep",
        priority: 0.9,
        changefreq: "weekly",
        description: "Interview preparation landing"
    },
    {
        path: "/interview-prep/explore",
        priority: 0.9,
        changefreq: "weekly",
        description: "Explore interview sheets"
    },
    {
        path: "/interview-prep/[sheetSlug]",
        priority: 0.8,
        changefreq: "weekly",
        isDynamic: true,
        description: "Individual interview sheet pages"
    },
    {
        path: "/interview-prep/[sheetSlug]/about",
        priority: 0.7,
        changefreq: "monthly",
        isDynamic: true,
        description: "Interview sheet about pages"
    },
    {
        path: "/interview-prep/[sheetSlug]/landing",
        priority: 0.8,
        changefreq: "monthly",
        isDynamic: true,
        description: "Interview sheet landing pages"
    },
    // Webinars
    {
        path: "/webinar",
        priority: 0.8,
        changefreq: "weekly",
        description: "Webinars listing"
    },
    {
        path: "/webinar/[webinarSlug]",
        priority: 0.7,
        changefreq: "monthly",
        isDynamic: true,
        description: "Individual webinar pages"
    },
    // YouFocus
    {
        path: "/youfocus",
        priority: 0.8,
        changefreq: "weekly",
        description: "YouFocus playlists"
    },
    {
        path: "/youfocus/explore",
        priority: 0.8,
        changefreq: "weekly",
        description: "Explore YouFocus playlists"
    },
    {
        path: "/youfocus/explore/skill",
        priority: 0.7,
        changefreq: "weekly",
        description: "Skill-based playlists"
    },
    // Portfolio & Others
    {
        path: "/portfolio",
        priority: 0.7,
        changefreq: "monthly",
        description: "Portfolio showcase"
    },
    {
        path: "/unskilled",
        priority: 0.7,
        changefreq: "weekly",
        description: "Unskilled - Job market insights"
    },
    // Cohort
    {
        path: "/cohort/bring-your-idea",
        priority: 0.8,
        changefreq: "monthly",
        description: "Bring Your Idea Cohort"
    },
    // Static pages
    {
        path: "/contact",
        priority: 0.6,
        changefreq: "monthly",
        description: "Contact us"
    },
    {
        path: "/contribute",
        priority: 0.7,
        changefreq: "monthly",
        description: "Open source contribution"
    },
    {
        path: "/terms-and-conditions",
        priority: 0.5,
        changefreq: "yearly",
        description: "Terms and conditions"
    },
    {
        path: "/refund",
        priority: 0.5,
        changefreq: "yearly",
        description: "Refund policy"
    },
    // Certificate (public viewable)
    {
        path: "/certificate/[certificateId]",
        priority: 0.6,
        changefreq: "never",
        isDynamic: true,
        description: "Certificate verification"
    }
]

/**
 * PrepYatra app public routes
 */
const prepYatraRoutes: SEORouteConfig[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        description: "PrepYatra - Interview preparation platform"
    },
    {
        path: "/pricing",
        priority: 0.9,
        changefreq: "monthly",
        description: "Pricing plans"
    },
    {
        path: "/login",
        priority: 0.5,
        changefreq: "monthly",
        description: "Login page"
    }
]

/**
 * Quizes app public routes
 */
const quizesRoutes: SEORouteConfig[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        description: "TBE Quizes - Test your knowledge"
    },
    {
        path: "/leaderboard",
        priority: 0.8,
        changefreq: "daily",
        description: "Quiz leaderboard"
    },
    {
        path: "/login",
        priority: 0.5,
        changefreq: "monthly",
        description: "Login page"
    }
]

/**
 * Resume Yatra app public routes
 */
const resumeYatraRoutes: SEORouteConfig[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        description: "ResumeYatra - Professional resume builder"
    },
    {
        path: "/login",
        priority: 0.5,
        changefreq: "monthly",
        description: "Login page"
    }
]

/**
 * DSA Yatra app public routes
 */
const dsaYatraRoutes: SEORouteConfig[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        description: "DSAYatra - Data Structures & Algorithms"
    },
    {
        path: "/pricing",
        priority: 0.9,
        changefreq: "monthly",
        description: "Pricing plans"
    },
    {
        path: "/login",
        priority: 0.5,
        changefreq: "monthly",
        description: "Login page"
    }
]

/**
 * TechYatra app public routes
 */
const techYatraRoutes: SEORouteConfig[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        description: "TechYatra - Tech learning journey"
    },
    {
        path: "/login",
        priority: 0.5,
        changefreq: "monthly",
        description: "Login page"
    }
]

/**
 * Oncampus app public routes
 */
const oncampusRoutes: SEORouteConfig[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        description: "Oncampus - Campus events and workshops"
    },
    {
        path: "/login",
        priority: 0.5,
        changefreq: "monthly",
        description: "Login page"
    }
]

/**
 * Complete SEO configuration for all apps
 */
export const SEO_REGISTRY: Record<AppIdentifier | "oncampus", AppSEOConfig> = {
    platform: {
        appId: "platform",
        domain: APP_CONFIGS.platform.domain,
        publicRoutes: platformRoutes,
        excludedRoutes: [
            "/api/*",
            "/admin/*",
            "/user/*",
            "/onboarding",
            "/_next/*",
            "/404",
            "/_error"
        ],
        robotsPolicies: [
            {
                userAgent: "*",
                allow: ["/"],
                disallow: ["/api/", "/admin/", "/user/", "/onboarding"]
            }
        ]
    },
    "prep-yatra": {
        appId: "prep-yatra",
        domain: APP_CONFIGS["prep-yatra"].domain,
        publicRoutes: prepYatraRoutes,
        excludedRoutes: [
            "/api/*",
            "/dashboard/*",
            "/journey/*",
            "/_next/*",
            "/404"
        ],
        robotsPolicies: [
            {
                userAgent: "*",
                allow: ["/", "/pricing"],
                disallow: ["/api/", "/dashboard/", "/journey/"]
            }
        ]
    },
    quizes: {
        appId: "quizes",
        domain: APP_CONFIGS.quizes.domain,
        publicRoutes: quizesRoutes,
        excludedRoutes: [
            "/api/*",
            "/dashboard/*",
            "/quiz/*",
            "/results/*",
            "/performance/*",
            "/_next/*",
            "/404"
        ],
        robotsPolicies: [
            {
                userAgent: "*",
                allow: ["/", "/leaderboard"],
                disallow: ["/api/", "/dashboard/", "/quiz/", "/results/", "/performance/"]
            }
        ]
    },
    "resume-yatra": {
        appId: "resume-yatra",
        domain: APP_CONFIGS["resume-yatra"].domain,
        publicRoutes: resumeYatraRoutes,
        excludedRoutes: ["/api/*", "/dashboard/*", "/builder/*", "/_next/*", "/404"],
        robotsPolicies: [
            {
                userAgent: "*",
                allow: ["/"],
                disallow: ["/api/", "/dashboard/", "/builder/"]
            }
        ]
    },
    dsayatra: {
        appId: "dsayatra",
        domain: APP_CONFIGS.dsayatra.domain,
        publicRoutes: dsaYatraRoutes,
        excludedRoutes: ["/api/*", "/dashboard/*", "/_next/*", "/404"],
        robotsPolicies: [
            {
                userAgent: "*",
                allow: ["/", "/pricing"],
                disallow: ["/api/", "/dashboard/"]
            }
        ]
    },
    techyatra: {
        appId: "techyatra",
        domain: APP_CONFIGS.techyatra.domain,
        publicRoutes: techYatraRoutes,
        excludedRoutes: ["/api/*", "/dashboard/*", "/_next/*", "/404"],
        robotsPolicies: [
            {
                userAgent: "*",
                allow: ["/"],
                disallow: ["/api/", "/dashboard/"]
            }
        ]
    },
    onboarding: {
        appId: "onboarding",
        domain: APP_CONFIGS.onboarding.domain,
        publicRoutes: [],
        excludedRoutes: ["/*"],
        robotsPolicies: [
            {
                userAgent: "*",
                disallow: ["/"]
            }
        ]
    },
    oncampus: {
        appId: "platform", // oncampus doesn't have its own appId, using platform as fallback
        domain: "https://oncampus.theboringeducation.com",
        publicRoutes: oncampusRoutes,
        excludedRoutes: ["/api/*", "/dashboard/*", "/_next/*", "/404"],
        robotsPolicies: [
            {
                userAgent: "*",
                allow: ["/"],
                disallow: ["/api/", "/dashboard/"]
            }
        ]
    }
}

/**
 * Get all public URLs for a specific app (for Lighthouse CI)
 * @param appId - App identifier
 * @param useProductionUrls - Whether to use production URLs (default: true)
 * @returns Array of full URLs
 */
export const getPublicUrlsForApp = (
    appId: AppIdentifier | "oncampus",
    useProductionUrls = true
): string[] => {
    const config = SEO_REGISTRY[appId]
    if (!config) return []

    const baseUrl = useProductionUrls
        ? config.domain
        : `http://localhost:3000`

    return config.publicRoutes
        .filter((route) => !route.isDynamic)
        .map((route) => `${baseUrl}${route.path}`)
}

/**
 * Get all public URLs for all apps (for Lighthouse CI bulk auditing)
 * @param useProductionUrls - Whether to use production URLs
 * @returns Array of full URLs
 */
export const getAllPublicUrls = (useProductionUrls = true): string[] => {
    const allUrls: string[] = []
    const apps = Object.keys(SEO_REGISTRY) as (AppIdentifier | "oncampus")[]

    for (const appId of apps) {
        // Skip onboarding as it's not meant to be indexed
        if (appId === "onboarding") continue
        allUrls.push(...getPublicUrlsForApp(appId, useProductionUrls))
    }

    return allUrls
}

/**
 * Get SEO config for a specific app
 * @param appId - App identifier
 * @returns AppSEOConfig or undefined
 */
export const getAppSEOConfig = (
    appId: AppIdentifier | "oncampus"
): AppSEOConfig | undefined => {
    return SEO_REGISTRY[appId]
}

/**
 * Get excluded routes for next-sitemap
 * @param appId - App identifier
 * @returns Array of excluded route patterns
 */
export const getExcludedRoutes = (
    appId: AppIdentifier | "oncampus"
): string[] => {
    return SEO_REGISTRY[appId]?.excludedRoutes || []
}

/**
 * Get robots.txt policies for an app
 * @param appId - App identifier
 * @returns Robots policies array
 */
export const getRobotsPolicies = (appId: AppIdentifier | "oncampus") => {
    return SEO_REGISTRY[appId]?.robotsPolicies || []
}

/**
 * Transform function for next-sitemap to set priority and changefreq
 * @param path - Route path
 * @param appId - App identifier
 * @returns Sitemap transform config
 */
export const getSitemapTransformConfig = (
    path: string,
    appId: AppIdentifier | "oncampus"
) => {
    const config = SEO_REGISTRY[appId]
    if (!config) {
        return { loc: path, priority: 0.7, changefreq: "weekly" as const }
    }

    // Find matching route config
    const routeConfig = config.publicRoutes.find((route) => {
        if (route.isDynamic) {
            // Convert dynamic route pattern to regex
            const pattern = route.path.replace(/\[.*?\]/g, "[^/]+")
            const regex = new RegExp(`^${pattern}$`)
            return regex.test(path)
        }
        return route.path === path
    })

    if (routeConfig) {
        return {
            loc: path,
            priority: routeConfig.priority,
            changefreq: routeConfig.changefreq
        }
    }

    // Default fallback
    return { loc: path, priority: 0.7, changefreq: "weekly" as const }
}

