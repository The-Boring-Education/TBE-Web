/**
 * next-sitemap configuration for Quizes app
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://quizes.theboringeducation.com',
    generateRobotsTxt: true,
    generateIndexSitemap: false,

    // Exclude private/protected routes
    exclude: [
        '/api/*',
        '/dashboard/*',
        '/quiz/*',
        '/results/*',
        '/performance/*',
        '/_next/*',
        '/404'
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: ['/', '/leaderboard']
            },
            {
                userAgent: '*',
                disallow: ['/api/', '/dashboard/', '/quiz/', '/results/', '/performance/']
            }
        ]
    },

    transform: async (config, path) => {
        let priority = 0.7;
        let changefreq = 'weekly';

        if (path === '/') {
            priority = 1.0;
            changefreq = 'weekly';
        } else if (path === '/leaderboard') {
            priority = 0.8;
            changefreq = 'daily';
        } else if (path === '/login') {
            priority = 0.5;
            changefreq = 'monthly';
        }

        return {
            loc: path,
            changefreq,
            priority,
            lastmod: new Date().toISOString()
        };
    }
};

