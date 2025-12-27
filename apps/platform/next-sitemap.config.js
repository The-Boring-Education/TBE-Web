/**
 * next-sitemap configuration for Platform app
 *
 * This configuration generates sitemap.xml and robots.txt
 * during the build process (postbuild script).
 *
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://theboringeducation.com',
    generateRobotsTxt: true,
    generateIndexSitemap: true,

    // Exclude private/protected routes from sitemap
    exclude: [
        '/api/*',
        '/admin/*',
        '/user/*',
        '/onboarding',
        '/_next/*',
        '/404',
        '/_error',
        '/server-sitemap.xml' // Exclude server-side sitemap from static sitemap
    ],

    // Robots.txt configuration
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/'
            },
            {
                userAgent: '*',
                disallow: ['/api/', '/admin/', '/user/', '/onboarding']
            },
            {
                userAgent: 'Googlebot',
                allow: '/'
            }
        ],
        additionalSitemaps: [
            // Add server-side sitemap for dynamic routes if needed
            // 'https://theboringeducation.com/server-sitemap.xml',
        ]
    },

    // Transform function to customize each URL entry
    transform: async (config, path) => {
        // Define priority based on route importance
        let priority = 0.7;
        let changefreq = 'weekly';

        // Homepage gets highest priority
        if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
        }
        // Main product pages
        else if (
            path === '/shiksha' ||
            path === '/interview-prep' ||
            path === '/projects'
        ) {
            priority = 0.9;
            changefreq = 'weekly';
        }
        // Explore pages
        else if (
            path.includes('/explore') ||
            path === '/youfocus' ||
            path === '/webinar'
        ) {
            priority = 0.9;
            changefreq = 'weekly';
        }
        // Course/Project/Sheet detail pages
        else if (
            path.includes('/shiksha/') ||
            path.includes('/interview-prep/') ||
            path.includes('/projects/')
        ) {
            priority = 0.8;
            changefreq = 'weekly';
        }
        // Cohort and promotional pages
        else if (path.includes('/cohort/') || path === '/topmate-sessions') {
            priority = 0.8;
            changefreq = 'monthly';
        }
        // Static pages (contact, refund, terms)
        else if (
            path === '/contact' ||
            path === '/refund' ||
            path === '/terms-and-conditions'
        ) {
            priority = 0.5;
            changefreq = 'yearly';
        }
        // Login page
        else if (path === '/login') {
            priority = 0.5;
            changefreq = 'monthly';
        }
        // Certificate pages (rarely change)
        else if (path.includes('/certificate/')) {
            priority = 0.6;
            changefreq = 'never';
        }

        return {
            loc: path,
            changefreq,
            priority,
            lastmod: new Date().toISOString(),
            // Optional: Add alternate language links
            // alternateRefs: [
            //   { href: `https://theboringeducation.com${path}`, hreflang: 'en' },
            // ],
        };
    },

    // Additional paths to include (useful for dynamic routes)
    additionalPaths: async (config) => {
        const paths = [];

        // Add known static course paths
        const courses = [
            '/shiksha/logic-building-for-everyone',
            '/shiksha/basics-of-programming-with-js',
            '/shiksha/zero-to-one-frontend-development',
            '/shiksha/zero-to-one-backend-development'
        ];

        // Add known interview sheet paths
        const sheets = [
            '/interview-prep/javascript-interview-questions',
            '/interview-prep/react-interview-questions',
            '/interview-prep/node-interview-questions',
            '/interview-prep/db-interview-questions',
            '/interview-prep/python-interview-questions',
            '/interview-prep/java-interview-questions',
            '/interview-prep/dsa-interview-questions'
        ];

        // Add known project paths
        const projects = ['/projects/pharmasift-i'];

        const allPaths = [...courses, ...sheets, ...projects];

        for (const path of allPaths) {
            paths.push({
                loc: path,
                changefreq: 'weekly',
                priority: 0.8,
                lastmod: new Date().toISOString()
            });
        }

        return paths;
    }
};

