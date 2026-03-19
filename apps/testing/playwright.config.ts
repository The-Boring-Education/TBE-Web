import { defineConfig, devices } from "@playwright/test";

/**
 * TBE Multi-App Playwright Config
 *
 * Supports E2E testing across all TBE frontend apps. Each app has its own
 * project with app-specific baseURL and webServer.
 *
 * Usage:
 *   pnpm test:e2e                    # Run all app tests
 *   pnpm test:e2e --project=platform # Run only platform tests
 *   pnpm test:e2e --project=prep-yatra
 *
 * Env overrides (for CI or deployed URLs):
 *   PLATFORM_URL, PREP_YATRA_URL, QUIZES_URL, etc.
 */

// ---------------------------------------------------------------------------
// App registry: name → { port, filter, testDir }
// ---------------------------------------------------------------------------
const APPS = {
  platform: {
    port: 3000,
    filter: "@tbe/platform",
    testDir: "platform",
  },
  "prep-yatra": {
    port: 3001,
    filter: "@tbe/prep-yatra",
    testDir: "prep-yatra",
  },
  quizes: {
    port: 3002,
    filter: "@tbe/quizes",
    testDir: "quizes",
  },
  techyatra: {
    port: 3003,
    filter: "@tbe/techyatra",
    testDir: "techyatra",
  },
  dsayatra: {
    port: 3005,
    filter: "@tbe/dsayatra",
    testDir: "dsayatra",
  },
  "resume-yatra": {
    port: 3006,
    filter: "@tbe/resume-yatra",
    testDir: "resume-yatra",
  },
  oncampus: {
    port: 3007,
    filter: "@tbe/oncampus",
    testDir: "oncampus",
  },
  onboarding: {
    port: 5173, // Vite default
    filter: "@tbe/onboarding",
    testDir: "onboarding",
  },
} as const;

// API (3004) is backend — typically tested via frontend or separate API tests
// Add an "api" project if you need direct API E2E tests

function getAppUrl(appKey: keyof typeof APPS): string {
  const app = APPS[appKey];
  const envKey = `TBE_${appKey.toUpperCase().replace(/-/g, "_")}_URL`;
  const envUrl =
    process.env[envKey] ??
    (appKey === "platform" ? process.env.PLATFORM_URL : undefined);
  if (envUrl) return envUrl;
  return `http://localhost:${app.port}`;
}

function buildProjects() {
  const projects: ReturnType<typeof defineConfig>["projects"] = [];

  for (const [appKey, app] of Object.entries(APPS)) {
    const baseURL = getAppUrl(appKey as keyof typeof APPS);
    const testMatch = `${app.testDir}/**/*.spec.ts`;

    projects.push({
      name: appKey,
      use: {
        ...devices["Desktop Chrome"],
        baseURL,
      },
      testMatch,
      testDir: "./src/e2e",
      // Start app when running this project's tests (local dev only)
      ...(process.env.CI
        ? {}
        : {
            webServer: {
              command: `pnpm --filter ${app.filter} dev`,
              url: baseURL,
              reuseExistingServer: true,
              cwd: "../../",
              timeout: 60_000,
            },
          }),
    });
  }

  return projects;
}

export default defineConfig({
  testDir: "./src/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["html", { open: "never" }],
        ["json", { outputFile: "test-results/results.json" }],
      ]
    : [["html", { open: "on-failure" }]],

  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: buildProjects(),

  outputDir: "./test-results",
});
