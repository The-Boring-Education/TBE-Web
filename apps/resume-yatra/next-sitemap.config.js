/**
 * next-sitemap configuration for ResumeYatra app
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://resumeyatra.theboringeducation.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  // Exclude private/protected routes
  exclude: ["/api/*", "/dashboard/*", "/builder/*", "/_next/*", "/404"],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: ["/"],
      },
      {
        userAgent: "*",
        disallow: ["/api/", "/dashboard/", "/builder/"],
      },
    ],
  },

  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = "weekly";

    if (path === "/") {
      priority = 1.0;
      changefreq = "weekly";
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
