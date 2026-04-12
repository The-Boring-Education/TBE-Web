import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

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

function sentryStubPlugin() {
  return {
    name: "stub-sentry-nextjs",
    resolveId(id: string) {
      if (id === "@sentry/nextjs" || id === "@sentry/nextjs/server") {
        // Return a virtual module ID that this plugin will serve
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
  };
}

const root = path.resolve(__dirname);

export default defineConfig({
  plugins: [react(), sentryStubPlugin()],
  define: {
    // packages/constants/src/envConfig.ts uses `process.env.NEXT_PUBLIC_*` at
    // module scope. In Vite/browser there is no Node.js `process` global, so we
    // replace all references with an empty object.  The values are only read at
    // startup (not used reactively), so an empty object is safe — the API URL
    // fallback in sendRequest is overridden by the explicit `baseURL` prop that
    // OnboardingForm passes on every call.
    "process.env": "{}",
  },
  resolve: {
    alias: {
      // Workspace package aliases — Vite does not resolve workspace:* protocol
      // automatically, so we point directly to each package's source entry file.
      // @tbe/query and @tbe/config use single-file entries; @tbe/hooks and
      // @tbe/utils use directory aliases so sub-path imports work
      // (e.g. @tbe/hooks/useOnboarding resolves to packages/hooks/src/useOnboarding.ts)
      "@tbe/query": path.resolve(root, "../../packages/api/src/index.ts"),
      "@tbe/config": path.resolve(
        root,
        "../../packages/config/src/onboarding.ts",
      ),
      "@tbe/hooks": path.resolve(root, "../../packages/hooks/src"),
      "@tbe/utils": path.resolve(root, "../../packages/utils/src"),
      // The virtual:sentry-stub module is served by sentryStubPlugin above
      "@sentry/nextjs": "virtual:sentry-stub",
    },
  },
  optimizeDeps: {
    // Exclude @tbe/* from pre-bundling — workspace packages are source files,
    // not bundled artefacts. Let Vite resolve them via the aliases above.
    // The sentryStubPlugin handles any @sentry/nextjs imports found during
    // the optimizeDeps scan.
    exclude: ["@tbe/query", "@tbe/config", "@tbe/hooks", "@tbe/utils"],
  },
});
