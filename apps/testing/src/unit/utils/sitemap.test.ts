import { routes } from "@tbe/constants";
import { generateSitemap } from "@tbe/utils/sitemap";
import { describe, expect, it } from "vitest";

describe("generateSitemap", () => {
  it("produces a well-formed XML sitemap", () => {
    const sitemap = generateSitemap();

    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(sitemap).toContain("</urlset>");
  });

  it("includes known top-level route URLs prefixed with the site origin", () => {
    const sitemap = generateSitemap();

    expect(sitemap).toContain(
      `<url><loc>https://theboringeducation.com${routes.home}</loc></url>`,
    );
    expect(sitemap).toContain(
      `<url><loc>https://theboringeducation.com${routes.login}</loc></url>`,
    );
  });

  it("flattens nested route objects into individual URLs", () => {
    const sitemap = generateSitemap();

    expect(sitemap).toContain(
      `https://theboringeducation.com${routes.allCourses.zeroToOneFrontend}`,
    );
  });

  it("excludes the api, internals, and 404 route groups entirely", () => {
    const sitemap = generateSitemap();
    const urlCount = (sitemap.match(/<url>/g) || []).length;

    // Only string leaves outside of "api"/"internals"/"404" should be counted.
    const countStringLeaves = (obj: Record<string, any>): number =>
      Object.entries(obj).reduce((total, [key, value]) => {
        if (key === "api" || key === "internals" || key === "404") {
          return total;
        }
        if (typeof value === "string") return total + 1;
        if (typeof value === "object" && value !== null) {
          return total + countStringLeaves(value);
        }
        return total;
      }, 0);

    expect(urlCount).toBe(countStringLeaves(routes));
  });
});
