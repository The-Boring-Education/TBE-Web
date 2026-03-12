/**
 * next-sitemap configuration for DSAYatra app
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://dsayatra.theboringeducation.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  // Exclude private/protected routes
  exclude: ["/api/*", "/dashboard/*", "/_next/*", "/404"],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: ["/", "/pricing"],
      },
      {
        userAgent: "*",
        disallow: ["/api/", "/dashboard/"],
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
