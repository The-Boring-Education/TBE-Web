import type { MetadataRoute } from "next";

import { listResourceSlugs } from "@/lib/content";
import { getSiteBaseUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteBaseUrl();
  const slugs = await listResourceSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const resourceRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/resources/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...resourceRoutes];
}
