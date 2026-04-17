import type { MetadataRoute } from "next";

import {
  getResourceLastModified,
  getSiteContentLastModified,
  listResourceSlugs,
} from "@/lib/content";
import { getSiteBaseUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteBaseUrl();
  const slugs = await listResourceSlugs();
  const siteMtime = await getSiteContentLastModified();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: siteMtime,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/search`,
      lastModified: siteMtime,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const resourceRoutes: MetadataRoute.Sitemap = await Promise.all(
    slugs.map(async (slug) => {
      const lastModified = (await getResourceLastModified(slug)) ?? siteMtime;
      return {
        url: `${base}/resources/${slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      };
    }),
  );

  return [...staticRoutes, ...resourceRoutes];
}
