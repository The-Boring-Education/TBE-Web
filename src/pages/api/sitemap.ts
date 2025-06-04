import type { NextApiRequest, NextApiResponse } from 'next';

import { generateSitemap } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sitemap = generateSitemap();

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};

export default handler;
