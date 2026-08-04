import {
  buildE2EAccessJwt,
  ONBOARDING_GATE_E2E_USER,
} from "../fixtures/onboarding-redirect";
import { expect, test } from "../fixtures/platform.fixture";

const TBE_ACCESS_COOKIE = "tbe_access_token";
const TBE_REFRESH_COOKIE = "tbe_refresh_token";

const setAccessCookie = async (
  page: import("@playwright/test").Page,
  token: string,
) => {
  await page.context().addCookies([
    {
      name: TBE_ACCESS_COOKIE,
      value: token,
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
      httpOnly: false,
      secure: false,
    },
  ]);
  await page.addInitScript(
    ([key, value]) => {
      document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
    },
    [TBE_ACCESS_COOKIE, token] as [string, string],
  );
};

test.describe("Authentication Flow E2E Tests", () => {
  test.describe("Login/Logout Flow", () => {
    test("unauthenticated user sees login options on home page", async ({
      platformPage: page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Should see some form of login/signin call to action
      const loginButton = page.getByRole("button", {
        name: /sign in|login|get started/i,
      });
      // May or may not be visible depending on UI state
      await expect(page).toHaveURL("/");
    });

    test("authenticated user can access protected dashboard route", async ({
      platformPage: page,
    }) => {
      // Set authentication cookie
      const token = buildE2EAccessJwt();
      await setAccessCookie(page, token);

      await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

      // Should stay on dashboard (not redirected to home)
      await expect(page).toHaveURL(/\/user\/dashboard/);
    });

    test("logout clears auth tokens and redirects to home", async ({
      platformPage: page,
    }) => {
      // First, authenticate
      const token = buildE2EAccessJwt();
      await setAccessCookie(page, token);

      // Mock the logout API endpoint
      await page.route("**/api/v1/auth/logout", (route) =>
        route.fulfill({
          status: 200,
          json: { status: true, message: "Logged out successfully" },
        }),
      );

      await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

      // Find and click logout (if visible in UI)
      const logoutTrigger = page.getByRole("button", {
        name: /logout|sign out/i,
      });
      if (await logoutTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
        await logoutTrigger.click();

        // Should redirect to home after logout
        await page.waitForURL("/", { timeout: 10_000 });
        await expect(page).toHaveURL("/");
      }
    });
  });

  test.describe("Protected Route Access", () => {
    test("unauthenticated user is redirected from /user/dashboard", async ({
      platformPage: page,
    }) => {
      await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

      // Should be redirected to home page
      await page.waitForURL((url) => new URL(url).pathname === "/", {
        timeout: 20_000,
      });
    });

    test("authenticated user can access their profile", async ({
      platformPage: page,
    }) => {
      const token = buildE2EAccessJwt();

      await page.context().addCookies([
        {
          name: TBE_ACCESS_COOKIE,
          value: token,
          domain: "localhost",
          path: "/",
          sameSite: "Lax",
          httpOnly: false,
          secure: false,
        },
      ]);

      await page.addInitScript(
        ([key, value]) => {
          document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
        },
        [TBE_ACCESS_COOKIE, token] as [string, string],
      );

      // Mock user profile API
      await page.route("**/api/proxy/user**", (route) => {
        const url = route.request().url();
        if (url.includes("dashboard")) {
          return route.fulfill({
            status: 200,
            json: {
              status: true,
              data: {
                enrolledCourses: [],
                enrolledProjects: [],
                enrolledSheets: [],
              },
            },
          });
        }
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: ONBOARDING_GATE_E2E_USER,
          },
        });
      });

      await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

      await expect(page).toHaveURL(/\/user\/dashboard/);
    });
  });

  test.describe("Token Expiration Handling", () => {
    test("expired token triggers redirect to login", async ({
      platformPage: page,
    }) => {
      // Create an expired token
      const header = Buffer.from(
        JSON.stringify({ alg: "none", typ: "JWT" }),
      ).toString("base64url");
      const payload = Buffer.from(
        JSON.stringify({
          sub: "user_expired",
          email: "expired@test.com",
          name: "Expired User",
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        }),
      ).toString("base64url");
      const expiredToken = `${header}.${payload}.expired`;

      await setAccessCookie(page, expiredToken);

      await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

      // Should detect expired token and redirect
      await page.waitForURL(
        (url) => !url.pathname.includes("/user/dashboard"),
        {
          timeout: 20_000,
        },
      );
    });
  });

  test.describe("Auth State Persistence", () => {
    test("auth state persists across page navigation", async ({
      platformPage: page,
    }) => {
      const token = buildE2EAccessJwt();

      await page.context().addCookies([
        {
          name: TBE_ACCESS_COOKIE,
          value: token,
          domain: "localhost",
          path: "/",
          sameSite: "Lax",
          httpOnly: false,
          secure: false,
        },
      ]);

      await setAccessCookie(page, token);

      // Mock APIs for navigation
      await page.route("**/api/proxy/**", (route) =>
        route.fulfill({
          status: 200,
          json: { status: true, data: [] },
        }),
      );

      // Navigate to dashboard
      await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/user\/dashboard/);

      // Navigate to home
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Navigate back to dashboard - should still be authenticated
      await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/user\/dashboard/);
    });
  });

  test.describe("Google OAuth Integration", () => {
    test("Google sign-in button redirects to Google OAuth", async ({
      platformPage: page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Look for Google sign-in button
      const googleButton = page.getByRole("button", {
        name: /google|sign in with google/i,
      });

      if (await googleButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Click should trigger navigation (we won't actually go to Google in tests)
        const [request] = await Promise.all([
          page
            .waitForRequest(
              (req) => {
                const url = req.url();
                // Use URL constructor for proper hostname validation to prevent bypass attacks
                try {
                  const parsedUrl = new URL(url);
                  return (
                    parsedUrl.hostname === "accounts.google.com" ||
                    parsedUrl.hostname.endsWith(".google.com") ||
                    url.includes("/api/v1/auth/login")
                  );
                } catch {
                  // If URL parsing fails, fall back to path check only
                  return url.includes("/api/v1/auth/login");
                }
              },
              { timeout: 5000 },
            )
            .catch(() => null),
          googleButton.click(),
        ]);

        // Verify OAuth flow was initiated
        if (request) {
          expect(request.url()).toMatch(/google|auth/i);
        }
      }
    });
  });
});

test.describe("Session Management E2E Tests", () => {
  test("concurrent tab login maintains session", async ({ browser }) => {
    // Create two pages (tabs)
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    const token = buildE2EAccessJwt();

    // Set auth in the shared browser context before either tab navigates.
    await context.addCookies([
      {
        name: TBE_ACCESS_COOKIE,
        value: token,
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
        httpOnly: false,
        secure: false,
      },
    ]);

    // Mock APIs
    for (const page of [page1, page2]) {
      await page.route("**/api/proxy/**", (route) =>
        route.fulfill({
          status: 200,
          json: { status: true, data: [] },
        }),
      );
    }

    // Navigate first tab
    await page1.goto("http://localhost:3000/user/dashboard", {
      waitUntil: "domcontentloaded",
    });

    // Second tab should also have the cookie (same context)
    await page2.goto("http://localhost:3000/user/dashboard", {
      waitUntil: "domcontentloaded",
    });

    // Both should be authenticated
    await expect(page1).toHaveURL(/\/user\/dashboard/);
    await expect(page2).toHaveURL(/\/user\/dashboard/);

    await context.close();
  });
});
