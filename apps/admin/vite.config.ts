import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv } from "vite";

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const apiUrl = env.VITE_BASE_API_URL || "http://localhost:3004/api/v1";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), sentryStubPlugin()],
    define: {
      "process.env.NEXT_PUBLIC_API_URL": JSON.stringify(apiUrl),
      "process.env.VITE_BASE_API_URL": JSON.stringify(apiUrl),
    },
    resolve: {
      alias: {
        "@": path.resolve(root, "./src"),
        "@tbe/auth": path.resolve(root, "../../packages/auth/src/index.ts"),
        "@tbe/constants": path.resolve(
          root,
          "../../packages/constants/src/index.ts",
        ),
        "@tbe/hooks": path.resolve(root, "../../packages/hooks/src"),
        "@sentry/nextjs": "virtual:sentry-stub",
      },
    },
    optimizeDeps: {
      exclude: ["@tbe/auth", "@tbe/constants", "@tbe/hooks"],
    },
  };
});
