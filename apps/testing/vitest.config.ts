import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react() as any],
  esbuild: {
    // Skip tsconfig resolution for workspace packages
    tsconfigRaw: "{}",
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
      // Handle workspace packages properly
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
      "@tbe/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@tbe/constants": path.resolve(__dirname, "../../packages/constants/src"),
      "@tbe/types": path.resolve(__dirname, "../../packages/types/src"),
      "@tbe/interface": path.resolve(__dirname, "../../packages/interface/src"),
      "@tbe/hooks": path.resolve(__dirname, "../../packages/hooks/src"),
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
      // API app path aliases for testing API routes
      "@api": path.resolve(__dirname, "../api/src"),
    },
  },
});
