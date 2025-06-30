/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler/dist/src';
import type { TestApiHandlerResponse } from 'next-test-api-route-handler';

import handler from '@/pages/api/sitemap';

describe('GET /api/sitemap', () => {
  it('returns valid XML response', async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }: { fetch: (init?: RequestInit) => Promise<TestApiHandlerResponse> }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toMatch(/^<\?xml/);
      },
    });
  });
});