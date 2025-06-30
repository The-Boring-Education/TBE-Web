import { rest } from 'msw';

export const handlers = [
  // Example handler – update with real endpoints as needed
  rest.get('/api/health', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ status: 'ok' }));
  }),
];