import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { routes } from './constant';
import { isAdmin, isUserAuthenticated, sendAPIResponse } from './utils';

const protectedAPIRoutes = [
  {
    path: /^\/api\/v1\/shiksha(?:\/|$)/,
    restrictMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },
  {
    path: /^\/api\/v1\/admin(?:\/|$)/,
    restrictMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
];

const protectedUIRoutes = [{ path: /^\/shiksha\/(?:\/|$)/ }];

const middleware = async (req: NextRequest) => {
  const currentUrl = req.nextUrl.pathname;
  const method = req.method;
  const adminHeader = req.headers.get('x-admin-secret') || '';

  // Block all DELETE requests unless admin
  if (method === 'DELETE' && !isAdmin(adminHeader)) {
    return NextResponse.json(
      sendAPIResponse({
        status: false,
        message: 'Unauthorized - Admin header required for DELETE',
      }),
      { status: 401 }
    );
  }

  // Check API restrictions
  for (const route of protectedAPIRoutes) {
    if (route.path.test(currentUrl)) {
      const isAdminRequest = isAdmin(adminHeader);

      if (route.restrictMethods.includes(method) && !isAdminRequest) {
        return NextResponse.json(
          sendAPIResponse({
            status: false,
            message: 'Unauthorized',
          }),
          { status: 401 }
        );
      }
    }
  }

  // Check UI restrictions (auth based)
  const isAuthenticated = await isUserAuthenticated(req);

  if (!isAuthenticated) {
    const isProtectedUIRoute = protectedUIRoutes.find((route) =>
      route.path.test(currentUrl)
    );

    if (isProtectedUIRoute) {
      return NextResponse.redirect(new URL(routes.home, req.url));
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/register',
    '/shiksha/:courseSlug*',
    '/api/v1/course/:courseId*',
    '/api/v1/shiksha/:path*',
    '/api/v1/admin/:path*',
  ],
};

export { middleware };
