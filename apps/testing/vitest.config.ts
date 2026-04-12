import fs from "node:fs";

import react from "@vitejs/plugin-react";
import path from "path";
import type { PluginOption } from "vite";
import { defineConfig } from "vitest/config";

const SENTRY_STUB = `export const captureException=()=>{};
export const captureMessage=()=>{};
export const setUser=()=>{};
export const setTag=()=>{};
export const setContext=()=>{};
export const addBreadcrumb=()=>{};
export const startSpan=async(_n,_o,c)=>c();
export default{};
export const captureAPIError=()=>{};
export const captureDatabaseError=()=>{};
export const captureAuthError=()=>{};
export const capturePaymentError=()=>{};
export const trackPerformance=()=>{};`;

const sentryStubPlugin = () => ({
  name: "stub-sentry-nextjs",
  resolveId(id: string) {
    if (id === "@sentry/nextjs" || id === "@sentry/nextjs/server") {
      return "virtual:sentry-stub";
    }
    return null;
  },
  load(id: string) {
    if (id === "virtual:sentry-stub") {
      return { code: SENTRY_STUB, map: null };
    }
    return null;
  },
});

const testingTsconfig = fs.readFileSync(
  path.resolve(__dirname, "tsconfig.json"),
  "utf-8",
);

export default defineConfig({
  plugins: [react() as PluginOption, sentryStubPlugin()],
  define: {
    // Stub process.env so packages/constants/envConfig.ts (which uses
    // process.env.NEXT_PUBLIC_* at module scope) works in jsdom without errors.
    "process.env": "{}",
  },
  esbuild: {
    // esbuild transform() does not accept `tsconfig` path; pass JSON contents explicitly
    tsconfigRaw: testingTsconfig,
  },
  test: {
    globals: true,
    environment: "jsdom",
    environmentMatchGlobs: [
      // MongoDB / Node-only integration tests
      ["src/integration/**", "node"],
    ],
    setupFiles: ["./src/test-utils/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "src/e2e/**/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test-utils/",
        "src/e2e/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/",
        "**/mocks/",
        "src/api/mocks/",
      ],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    deps: {
      optimizer: {
        web: {
          include: ["@tbe/*"],
        },
      },
    },
  },
  resolve: {
    alias: {
      // Stable App Router stub for unit tests (workspace packages import `next/navigation` from source)
      "next/navigation": path.resolve(
        __dirname,
        "./src/test-utils/next-navigation-mock.ts",
      ),
      // API app @ alias - must come first for proper resolution
      "@/lib/auth": path.resolve(__dirname, "../api/src/lib/auth"),
      "@/lib/constants": path.resolve(__dirname, "../api/src/lib/constants"),
      "@/lib/database": path.resolve(__dirname, "../api/src/lib/database"),
      "@/lib/interfaces": path.resolve(__dirname, "../api/src/lib/interfaces"),
      "@/lib/services": path.resolve(__dirname, "../api/src/lib/services"),
      "@/lib/utils": path.resolve(__dirname, "../api/src/lib/utils"),
      "@/middleware": path.resolve(__dirname, "../api/src/middleware"),
      "@test-utils": path.resolve(__dirname, "./src/test-utils"),
      // Map workspace packages to their source
      "@tbe/components": path.resolve(
        __dirname,
        "../../packages/components/src",
      ),
      "@tbe/constants": path.resolve(__dirname, "../../packages/constants/src"),
      "@tbe/types": path.resolve(__dirname, "../../packages/types/src"),
      "@tbe/interface": path.resolve(__dirname, "../../packages/interface/src"),
      // Directory aliases so sub-path imports work (e.g. @tbe/hooks/useOnboarding)
      "@tbe/hooks": path.resolve(__dirname, "../../packages/hooks/src"),
      "@tbe/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@tbe/gamification": path.resolve(
        __dirname,
        "../../packages/gamification/src",
      ),
      "@tbe/query": path.resolve(__dirname, "../../packages/api/src"),
      "@tbe/services": path.resolve(__dirname, "../../packages/services/src"),
      "@tbe/auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@tbe/config/quizes": path.resolve(
        __dirname,
        "../../packages/config/src/quizes.ts",
      ),
      "@tbe/config": path.resolve(
        __dirname,
        "../../packages/config/src/onboarding.ts",
      ),
      // Onboarding app components (for onboarding unit tests)
      "@tbe/onboarding/components/OnboardingForm": path.resolve(
        __dirname,
        "../onboarding/src/components/OnboardingForm.tsx",
      ),
      "@tbe/onboarding/components/OnboardingLayout": path.resolve(
        __dirname,
        "../onboarding/src/components/OnboardingLayout.tsx",
      ),
      "@tbe/onboarding/config/products": path.resolve(
        __dirname,
        "../onboarding/src/config/products.ts",
      ),
      // API app path aliases for testing API routes
      "@api": path.resolve(__dirname, "../api/src"),
      "@dsayatra/dsa-gamification-award": path.resolve(
        __dirname,
        "../dsayatra/src/utils/dsaGamificationAward.ts",
      ),
    },
  },
});
