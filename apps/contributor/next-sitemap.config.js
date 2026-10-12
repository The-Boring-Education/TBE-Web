/**
 * next-sitemap configuration for Contributor (DevRel) landing app
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.SITE_URL || "https://contributors.theboringeducation.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/api/*", "/_next/*", "/404"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: ["/"],
      },
    ],
  },
};
