import { rest, RestRequest, ResponseComposition, RestContext } from 'msw';

interface HealthResponse {
  status: string;
}

interface UserResponse {
  id: string;
  name: string;
}

export const handlers = [
  // Health endpoint
  rest.get<HealthResponse>('/api/health', (_req: RestRequest, res: ResponseComposition<HealthResponse>, ctx: RestContext) => {
    return res(ctx.status(200), ctx.json({ status: 'ok' }));
  }),

  // Example user details endpoint
  rest.get<UserResponse>('/api/v1/user/:id', (req: RestRequest, res: ResponseComposition<UserResponse>, ctx: RestContext) => {
    const { id } = req.params as { id: string };
    return res(
      ctx.status(200),
      ctx.json({ id, name: `User-${id}` })
    );
  }),

  // Example POST feedback endpoint
  rest.post('/api/v1/feedback', (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(ctx.status(201));
  }),
];