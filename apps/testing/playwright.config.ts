import { defineConfig, devices } from "@playwright/test";

const PLATFORM_PORT = 3000;
const PLATFORM_URL =
  process.env.PLATFORM_URL || `http://localhost:${PLATFORM_PORT}`;

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
    baseURL: PLATFORM_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  outputDir: "./test-results",

  webServer: process.env.CI
    ? undefined
    : {
        command: `pnpm --filter @tbe/platform dev`,
        url: PLATFORM_URL,
        reuseExistingServer: true,
        cwd: "../../",
        timeout: 60_000,
      },
});
