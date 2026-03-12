/**
 * next-sitemap configuration for PrepYatra app
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://prepyatra.theboringeducation.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  // Exclude private/protected routes
  exclude: ["/api/*", "/dashboard/*", "/journey/*", "/_next/*", "/404"],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: ["/", "/pricing"],
      },
      {
        userAgent: "*",
        disallow: ["/api/", "/dashboard/", "/journey/"],
      },
    ],
  },

  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = "weekly";

    if (path === "/") {
      priority = 1.0;
      changefreq = "weekly";
    } else if (path === "/pricing") {
      priority = 0.9;
      changefreq = "monthly";
    } else if (path === "/login") {
      priority = 0.5;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
