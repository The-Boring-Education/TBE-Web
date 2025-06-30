/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler/dist/src';

import handler from '@/pages/api/sitemap';

describe('GET /api/sitemap', () => {
  it('returns valid XML response', async () => {
    await testApiHandler({
      pagesHandler: handler,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test: async ({ fetch }: any) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toMatch(/^<\?xml/);
      },
    });
  });
});