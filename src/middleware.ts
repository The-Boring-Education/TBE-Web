import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { isAdmin, isUserAuthenticated, sendAPIResponse, getUserOnboardingStatus } from './utils';
import { routes } from './constant';

const protectedAPIRoutes: {
  path: RegExp;
}[] = [
  {
    path: /^\/api\/v1\/shiksha(?:\/|$)/,
  },
];

const protectedUIRoutes: {
  path: RegExp;
}[] = [
  {
    path: /^\/shiksha\/(?:\/|$)/,
  },
  {
    path: /^\/user\/dashboard(?:\/|$)/,
  },
  {
    path: /^\/projects\/(?:\/|$)/,
  },
  {
    path: /^\/interview-prep\/(?:\/|$)/,
  },
  {
    path: /^\/youfocus\/(?:\/|$)/,
  },
];

// Routes that don't require onboarding
const onboardingExemptRoutes: {
  path: RegExp;
}[] = [
  {
    path: /^\/onboarding(?:\/|$)/,
  },
  {
    path: /^\/api\/v1\/user\/onboarding(?:\/|$)/,
  },
  {
    path: /^\/api\/v1\/user\/validate-username(?:\/|$)/,
  },
];

const middleware = async (req: NextRequest) => {
  // console.log('path matched : ', req.url);

  const currentUrl = req.nextUrl.pathname;

  const isProtectedAPIRoute = protectedAPIRoutes.find((route) =>
    route.path.test(currentUrl)
  );

  if (isProtectedAPIRoute) {
    const adminHeader = req.headers.get('x-admin-secret') || '';

    if (!isAdmin(adminHeader) && req.method !== 'GET') {
      return NextResponse.json(
        sendAPIResponse({
          status: false,
          message: 'Unauthorized',
        })
      );
    }
  }

  const isAuthenticated = await isUserAuthenticated(req);

  if (!isAuthenticated) {
    const isProtectedUIRoute = protectedUIRoutes.find((route) =>
      route.path.test(currentUrl)
    );

    if (isProtectedUIRoute) {
      return NextResponse.redirect(new URL(routes.home, req.url));
    }
  } else {
    // Check if the user has completed onboarding
    const isExemptFromOnboarding = onboardingExemptRoutes.find((route) =>
      route.path.test(currentUrl)
    );

    if (!isExemptFromOnboarding) {
      const isOnboarded = await getUserOnboardingStatus(req);
      
      if (!isOnboarded) {
        // Redirect to onboarding with the original URL as a query parameter
        const onboardingUrl = new URL(routes.onboarding, req.url);
        onboardingUrl.searchParams.set('redirectTo', encodeURIComponent(currentUrl));
        return NextResponse.redirect(onboardingUrl);
      }
    }
    
    return NextResponse.next();
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/register', '/shiksha/:courseSlug*', '/api/v1/course/:courseId*'],
};

export { middleware };
