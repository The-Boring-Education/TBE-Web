import type { Page } from "@playwright/test";

import { mockDsayatraDashboardApis } from "./authenticated-dashboard-smoke";
import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
  ONBOARDING_GATE_E2E_USER,
} from "./onboarding-redirect";

export type DsayatraE2EProfile = {
  _id: string;
  email: string;
  name: string;
  userName: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  dsaYatra: {
    dyOnboarded: boolean;
    target: string;
    timeline: string;
    experienceLevel: string;
    preferredLanguage: string;
    targetTopics: string[];
  };
};

export const defaultDsayatraE2EProfile = (): DsayatraE2EProfile => ({
  _id: ONBOARDING_GATE_E2E_USER.id,
  email: ONBOARDING_GATE_E2E_USER.email,
  name: ONBOARDING_GATE_E2E_USER.name,
  userName: "e2e-dsa-user",
  dsaYatra: {
    dyOnboarded: true,
    target: "Startups",
    timeline: "6Months",
    experienceLevel: "Fresher (0-1 yr)",
    preferredLanguage: "C++",
    targetTopics: [],
  },
});

/**
 * Authenticated DSA dashboard with a mutable user profile and stubbed
 * POST /dsayatra/onboarding so social URLs persist across GET refetches.
 */
export async function installDsayatraSocialProfileMocks(
  page: Page,
  initialProfile: DsayatraE2EProfile = defaultDsayatraE2EProfile(),
): Promise<{ getProfile: () => DsayatraE2EProfile }> {
  let profile = { ...initialProfile };

  await installOnboardingRedirectMocks(
    page,
    fullyOnboardedProductFieldsByApp.dsayatra,
  );
  await mockDsayatraDashboardApis(page);

  const fulfillUserProfileGet = (route: {
    request: () => { method: () => string; url: () => string };
    fulfill: (options: {
      status: number;
      contentType: string;
      body: string;
    }) => Promise<void>;
    continue: () => Promise<void>;
  }) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    const userId = new URL(route.request().url()).searchParams.get("userId");
    if (userId !== profile._id) {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: profile,
      }),
    });
  };

  const isUserProfileGet = (url: URL) => {
    const path = url.pathname.replace(/\/$/, "") || "/";
    return (
      url.searchParams.has("userId") &&
      (path === "/api/proxy/user" ||
        path === "/api/v1/user" ||
        path.endsWith("/api/v1/user"))
    );
  };

  await page.route(isUserProfileGet, fulfillUserProfileGet);

  await page.route("**/api/proxy/dsayatra/onboarding**", async (route) => {
    if (route.request().method() !== "POST") {
      return route.continue();
    }

    const body = route.request().postDataJSON() as {
      name?: string;
      username?: string;
      linkedInUrl?: string;
      githubUrl?: string;
      leetCodeUrl?: string;
      target?: string;
      timeline?: string;
      experienceLevel?: string;
      preferredLanguage?: string;
    };

    profile = {
      ...profile,
      name: body.name ?? profile.name,
      userName: body.username ?? profile.userName,
      linkedInUrl: body.linkedInUrl ?? "",
      githubUrl: body.githubUrl ?? "",
      leetCodeUrl: body.leetCodeUrl ?? "",
      dsaYatra: {
        ...profile.dsaYatra,
        target: body.target ?? profile.dsaYatra.target,
        timeline: body.timeline ?? profile.dsaYatra.timeline,
        experienceLevel:
          body.experienceLevel ?? profile.dsaYatra.experienceLevel,
        preferredLanguage:
          body.preferredLanguage ?? profile.dsaYatra.preferredLanguage,
      },
    };

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        message: "Onboarding preferences updated successfully",
        data: { user: profile },
      }),
    });
  });

  return {
    getProfile: () => profile,
  };
}
