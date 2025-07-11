import { rest } from 'msw';
import type { RestRequest, ResponseComposition, RestContext } from 'msw';

interface HealthResponse {
  status: string;
}

interface UserResponse {
  id: string;
  name: string;
}

export const handlers = [
  // Health endpoint
  rest.get(
    '/api/health',
    (
      _req: RestRequest,
      res: ResponseComposition<HealthResponse>,
      ctx: RestContext
    ) => {
      return res(ctx.status(200), ctx.json({ status: 'ok' }));
    }
  ),

  // Example user details endpoint
  rest.get(
    '/api/v1/user/:id',
    (
      req: RestRequest,
      res: ResponseComposition<UserResponse>,
      ctx: RestContext
    ) => {
      const { id } = req.params as { id: string };
      return res(ctx.status(200), ctx.json({ id, name: `User-${id}` }));
    }
  ),

  // Example POST feedback endpoint
  rest.post(
    '/api/v1/feedback',
    (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      return res(ctx.status(201));
    }
  ),

  // PrepYatra onboarding
  rest.post(
    '/api/v1/prepyatra/onboarding',
    (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      return res(
        ctx.status(201),
        ctx.json({ success: true, userId: 'temp123' })
      );
    }
  ),

  rest.get(
    '/api/v1/prepyatra/subscription',
    (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      const userId = req.url.searchParams.get('userId');
      return res(
        ctx.status(200),
        ctx.json({
          isActive: true,
          userId,
          expiryDate: new Date().toISOString(),
        })
      );
    }
  ),

  // Certificate public endpoint
  rest.get(
    '/api/v1/certificate/:id',
    (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      const { id } = req.params as { id: string };
      return res(
        ctx.status(200),
        ctx.json({ certificateId: id, name: 'John Doe', course: 'Full-Stack' })
      );
    }
  ),
];
