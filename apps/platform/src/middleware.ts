// Import polyfills first to ensure they're loaded before Sentry
import './polyfills';

import * as Sentry from '@sentry/nextjs';
import { routes } from '@tbe/constants';
import { isAdmin, isUserAuthenticated, sendAPIResponse } from '@tbe/utils';
import { type NextRequest, NextResponse } from 'next/server';

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

// CORS headers removed - using proxy pattern for API calls

const middleware = async (req: NextRequest) => {
  try {
    const currentUrl = req.nextUrl.pathname;
    const method = req.method;
    const adminHeader = req.headers.get('x-admin-secret') || '';
    const isAPI = currentUrl.startsWith('/api/');

    // Handle OPTIONS requests for API routes
    if (method === 'OPTIONS' && isAPI) {
      return new NextResponse(null, { status: 204 });
    }

    // Add request context to Sentry
    Sentry.setContext('middleware', {
      url: currentUrl,
      method,
      userAgent: req.headers.get('user-agent'),
      ip: req.ip || req.headers.get('x-forwarded-for'),
    });

    // Block all DELETE requests unless admin
    if (method === 'DELETE' && !isAdmin(adminHeader)) {
      Sentry.addBreadcrumb({
        message: 'Unauthorized DELETE request blocked',
        level: 'warning',
        data: { url: currentUrl, method },
      });

      const res = NextResponse.json(
        sendAPIResponse({
          status: false,
          message: 'Unauthorized - Admin header required for DELETE',
        }),
        { status: 401 },
      );
      return res;
    }

    // Check API restrictions
    for (const route of protectedAPIRoutes) {
      if (route.path.test(currentUrl)) {
        const isAdminRequest = isAdmin(adminHeader);

        if (route.restrictMethods.includes(method) && !isAdminRequest) {
          Sentry.addBreadcrumb({
            message: 'API route access denied',
            level: 'warning',
            data: { url: currentUrl, method, route: route.path.source },
          });

          const res = NextResponse.json(
            sendAPIResponse({
              status: false,
              message: 'Unauthorized',
            }),
            { status: 401 },
          );
          return res;
        }
      }
    }

    // Check UI restrictions (auth based)
    const isAuthenticated = await isUserAuthenticated(req);

    if (!isAuthenticated) {
      const isProtectedUIRoute = protectedUIRoutes.find((route) =>
        route.path.test(currentUrl),
      );

      if (isProtectedUIRoute) {
        Sentry.addBreadcrumb({
          message: 'Unauthenticated user redirected from protected route',
          level: 'info',
          data: { url: currentUrl, redirectTo: routes.home },
        });

        return NextResponse.redirect(new URL(routes.home, req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Capture middleware errors
    Sentry.captureException(error, {
      tags: {
        section: 'middleware',
        url: req.nextUrl.pathname,
        method: req.method,
      },
      extra: {
        userAgent: req.headers.get('user-agent'),
        ip: req.ip || req.headers.get('x-forwarded-for'),
      },
    });

    // Return a generic error response
    const res = NextResponse.json(
      sendAPIResponse({
        status: false,
        message: 'Internal server error',
      }),
      { status: 500 },
    );
    const origin = req.headers.get('origin');
    const isAPI = req.nextUrl.pathname.startsWith('/api/');
    return isAPI ? addCorsHeaders(res, origin) : res;
  }
};

export const config = {
  matcher: [
    '/register',
    '/shiksha/:courseSlug*',
    '/api/v1/course/:courseId*',
    '/api/v1/shiksha/:path*',
    '/api/v1/admin/:path*',
    '/api/v1/interview-prep/:path*',
  ],
};

export { middleware };
