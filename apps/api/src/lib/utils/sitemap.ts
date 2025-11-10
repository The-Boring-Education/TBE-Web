import { routes } from '@/lib/constants';

const flattenRoutesForSitemap = (routesObj: Record<string, any>): string[] => {
  const SITE_URL = 'https://theboringeducation.com';

  let urls: string[] = [];

  for (const key in routesObj) {
    if (key === 'api' || key === 'internals' || key === '404') continue;

    const value = routesObj[key];

    if (typeof value === 'string') urls.push(`${SITE_URL}${value}`);
    else if (typeof value === 'object')
      urls = urls.concat(flattenRoutesForSitemap(value));
  }

  return urls;
};

export const generateSitemap = () => {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const sitemapRoutes = flattenRoutesForSitemap(routes);

  sitemapRoutes.forEach((url) => {
    sitemap += `<url><loc>${url}</loc></url>\n`;
  });

  sitemap += `</urlset>`;

  return sitemap;
};
