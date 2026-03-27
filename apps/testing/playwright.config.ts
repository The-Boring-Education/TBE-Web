import fs from "node:fs";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

/**
 * TBE Multi-App Playwright Config
 *
 * Each app is a Playwright project (baseURL + testDir). The dev server is
 * started via the **root** `webServer` only — `webServer` on project entries
 * is not supported by Playwright and is ignored.
 *
 * Usage:
 *   pnpm test:e2e                              # all projects; webServer only if exactly one app has specs
 *   pnpm test:e2e -- --project=platform        # platform only (typical when several apps have specs)
 *   PLAYWRIGHT_E2E_APP=platform pnpm test:e2e -- --project=platform
 *
 * Env overrides for baseURL (app already running):
 *   PLATFORM_URL, TBE_PREP_YATRA_URL, QUIZES_URL, etc.
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

const REPO_ROOT = path.resolve(__dirname, "../..");
const E2E_ROOT = path.join(__dirname, "src/e2e");

function dirContainsSpecTs(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (dirContainsSpecTs(full)) return true;
    } else if (ent.isFile() && ent.name.endsWith(".spec.ts")) {
      return true;
    }
  }
  return false;
}

/** Apps that have at least one `*.spec.ts` under `src/e2e/<testDir>/` — only these start `webServer`. */
function discoverAppsWithE2e(): Set<keyof typeof APPS> {
  const found = new Set<keyof typeof APPS>();
  for (const key of Object.keys(APPS) as (keyof typeof APPS)[]) {
    if (dirContainsSpecTs(path.join(E2E_ROOT, APPS[key].testDir))) {
      found.add(key);
    }
  }
  return found;
}

const APPS_WITH_E2E = discoverAppsWithE2e();

function getProjectFromArgv(): keyof typeof APPS | undefined {
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--project" && argv[i + 1] && argv[i + 1] in APPS) {
      return argv[i + 1] as keyof typeof APPS;
    }
    if (arg.startsWith("--project=")) {
      const name = arg.slice("--project=".length);
      if (name in APPS) return name as keyof typeof APPS;
    }
  }
  return undefined;
}

function resolveWebAppKey(): keyof typeof APPS | undefined {
  const fromEnv = process.env.PLAYWRIGHT_E2E_APP as
    | keyof typeof APPS
    | undefined;
  if (fromEnv && fromEnv in APPS && APPS_WITH_E2E.has(fromEnv)) return fromEnv;

  const fromArgv = getProjectFromArgv();
  if (fromArgv && APPS_WITH_E2E.has(fromArgv)) return fromArgv;
  if (fromArgv) return undefined;

  if (APPS_WITH_E2E.size === 1) return [...APPS_WITH_E2E][0];
  return undefined;
}

function getAppUrl(appKey: keyof typeof APPS): string {
  const app = APPS[appKey];
  const envKey = `TBE_${appKey.toUpperCase().replace(/-/g, "_")}_URL`;
  const envUrl =
    process.env[envKey] ??
    (appKey === "platform" ? process.env.PLATFORM_URL : undefined);
  if (envUrl) return envUrl;
  return `http://localhost:${app.port}`;
}

type WebServerConfig = {
  command: string;
  url: string;
  cwd: string;
  reuseExistingServer: boolean;
  timeout: number;
};

function buildWebServer(): WebServerConfig | undefined {
  const appKey = resolveWebAppKey();
  if (!appKey) return undefined;
  const app = APPS[appKey];
  return {
    command: `pnpm --filter ${app.filter} dev`,
    url: getAppUrl(appKey),
    cwd: REPO_ROOT,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 120_000 : 60_000,
  };
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
    });
  }

  return projects;
}

const webServer = buildWebServer();

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 6 : undefined,
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
    navigationTimeout: 90_000,
    actionTimeout: 60_000,
  },

  ...(webServer ? { webServer } : {}),

  projects: buildProjects(),
});
