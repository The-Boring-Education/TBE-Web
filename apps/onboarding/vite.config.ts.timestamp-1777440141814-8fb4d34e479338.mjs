// vite.config.ts
import { defineConfig } from "file:///D:/Code/TBE-Web/apps/onboarding/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Code/TBE-Web/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
const __vite_injected_original_dirname = "D:\\Code\\TBE-Web\\apps\\onboarding";
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
    resolveId(id) {
      if (id === "@sentry/nextjs" || id === "@sentry/nextjs/server") {
        return "virtual:sentry-stub";
      }
      return null;
    },
    load(id) {
      if (id === "virtual:sentry-stub") {
        return { code: SENTRY_STUB, map: null };
      }
      return null;
    },
  };
}
const root = path.resolve(__vite_injected_original_dirname);
const vite_config_default = defineConfig({
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
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDb2RlXFxcXFRCRS1XZWJcXFxcYXBwc1xcXFxvbmJvYXJkaW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxDb2RlXFxcXFRCRS1XZWJcXFxcYXBwc1xcXFxvbmJvYXJkaW5nXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Db2RlL1RCRS1XZWIvYXBwcy9vbmJvYXJkaW5nL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5cclxuY29uc3QgU0VOVFJZX1NUVUIgPSBgZXhwb3J0IGNvbnN0IGNhcHR1cmVFeGNlcHRpb249KCk9Pnt9O1xyXG5leHBvcnQgY29uc3QgY2FwdHVyZU1lc3NhZ2U9KCk9Pnt9O1xyXG5leHBvcnQgY29uc3Qgc2V0VXNlcj0oKT0+e307XHJcbmV4cG9ydCBjb25zdCBzZXRUYWc9KCk9Pnt9O1xyXG5leHBvcnQgY29uc3Qgc2V0Q29udGV4dD0oKT0+e307XHJcbmV4cG9ydCBjb25zdCBhZGRCcmVhZGNydW1iPSgpPT57fTtcclxuZXhwb3J0IGNvbnN0IHN0YXJ0U3Bhbj1hc3luYyhfbixfbyxjKT0+YygpO1xyXG5leHBvcnQgZGVmYXVsdHt9O1xyXG5leHBvcnQgY29uc3QgY2FwdHVyZUFQSUVycm9yPSgpPT57fTtcclxuZXhwb3J0IGNvbnN0IGNhcHR1cmVEYXRhYmFzZUVycm9yPSgpPT57fTtcclxuZXhwb3J0IGNvbnN0IGNhcHR1cmVBdXRoRXJyb3I9KCk9Pnt9O1xyXG5leHBvcnQgY29uc3QgY2FwdHVyZVBheW1lbnRFcnJvcj0oKT0+e307XHJcbmV4cG9ydCBjb25zdCB0cmFja1BlcmZvcm1hbmNlPSgpPT57fTtgO1xyXG5cclxuZnVuY3Rpb24gc2VudHJ5U3R1YlBsdWdpbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogXCJzdHViLXNlbnRyeS1uZXh0anNcIixcclxuICAgIHJlc29sdmVJZChpZDogc3RyaW5nKSB7XHJcbiAgICAgIGlmIChpZCA9PT0gXCJAc2VudHJ5L25leHRqc1wiIHx8IGlkID09PSBcIkBzZW50cnkvbmV4dGpzL3NlcnZlclwiKSB7XHJcbiAgICAgICAgLy8gUmV0dXJuIGEgdmlydHVhbCBtb2R1bGUgSUQgdGhhdCB0aGlzIHBsdWdpbiB3aWxsIHNlcnZlXHJcbiAgICAgICAgcmV0dXJuIFwidmlydHVhbDpzZW50cnktc3R1YlwiO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuICAgIGxvYWQoaWQ6IHN0cmluZykge1xyXG4gICAgICBpZiAoaWQgPT09IFwidmlydHVhbDpzZW50cnktc3R1YlwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgY29kZTogU0VOVFJZX1NUVUIsIG1hcDogbnVsbCB9O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG5jb25zdCByb290ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBzZW50cnlTdHViUGx1Z2luKCldLFxyXG4gIGRlZmluZToge1xyXG4gICAgLy8gcGFja2FnZXMvY29uc3RhbnRzL3NyYy9lbnZDb25maWcudHMgdXNlcyBgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfKmAgYXRcclxuICAgIC8vIG1vZHVsZSBzY29wZS4gSW4gVml0ZS9icm93c2VyIHRoZXJlIGlzIG5vIE5vZGUuanMgYHByb2Nlc3NgIGdsb2JhbCwgc28gd2VcclxuICAgIC8vIHJlcGxhY2UgYWxsIHJlZmVyZW5jZXMgd2l0aCBhbiBlbXB0eSBvYmplY3QuICBUaGUgdmFsdWVzIGFyZSBvbmx5IHJlYWQgYXRcclxuICAgIC8vIHN0YXJ0dXAgKG5vdCB1c2VkIHJlYWN0aXZlbHkpLCBzbyBhbiBlbXB0eSBvYmplY3QgaXMgc2FmZSBcdTIwMTQgdGhlIEFQSSBVUkxcclxuICAgIC8vIGZhbGxiYWNrIGluIHNlbmRSZXF1ZXN0IGlzIG92ZXJyaWRkZW4gYnkgdGhlIGV4cGxpY2l0IGBiYXNlVVJMYCBwcm9wIHRoYXRcclxuICAgIC8vIE9uYm9hcmRpbmdGb3JtIHBhc3NlcyBvbiBldmVyeSBjYWxsLlxyXG4gICAgXCJwcm9jZXNzLmVudlwiOiBcInt9XCIsXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAvLyBXb3Jrc3BhY2UgcGFja2FnZSBhbGlhc2VzIFx1MjAxNCBWaXRlIGRvZXMgbm90IHJlc29sdmUgd29ya3NwYWNlOiogcHJvdG9jb2xcclxuICAgICAgLy8gYXV0b21hdGljYWxseSwgc28gd2UgcG9pbnQgZGlyZWN0bHkgdG8gZWFjaCBwYWNrYWdlJ3Mgc291cmNlIGVudHJ5IGZpbGUuXHJcbiAgICAgIC8vIEB0YmUvcXVlcnkgYW5kIEB0YmUvY29uZmlnIHVzZSBzaW5nbGUtZmlsZSBlbnRyaWVzOyBAdGJlL2hvb2tzIGFuZFxyXG4gICAgICAvLyBAdGJlL3V0aWxzIHVzZSBkaXJlY3RvcnkgYWxpYXNlcyBzbyBzdWItcGF0aCBpbXBvcnRzIHdvcmtcclxuICAgICAgLy8gKGUuZy4gQHRiZS9ob29rcy91c2VPbmJvYXJkaW5nIHJlc29sdmVzIHRvIHBhY2thZ2VzL2hvb2tzL3NyYy91c2VPbmJvYXJkaW5nLnRzKVxyXG4gICAgICBcIkB0YmUvcXVlcnlcIjogcGF0aC5yZXNvbHZlKHJvb3QsIFwiLi4vLi4vcGFja2FnZXMvYXBpL3NyYy9pbmRleC50c1wiKSxcclxuICAgICAgXCJAdGJlL2NvbmZpZ1wiOiBwYXRoLnJlc29sdmUoXHJcbiAgICAgICAgcm9vdCxcclxuICAgICAgICBcIi4uLy4uL3BhY2thZ2VzL2NvbmZpZy9zcmMvb25ib2FyZGluZy50c1wiLFxyXG4gICAgICApLFxyXG4gICAgICBcIkB0YmUvaG9va3NcIjogcGF0aC5yZXNvbHZlKHJvb3QsIFwiLi4vLi4vcGFja2FnZXMvaG9va3Mvc3JjXCIpLFxyXG4gICAgICBcIkB0YmUvdXRpbHNcIjogcGF0aC5yZXNvbHZlKHJvb3QsIFwiLi4vLi4vcGFja2FnZXMvdXRpbHMvc3JjXCIpLFxyXG4gICAgICAvLyBUaGUgdmlydHVhbDpzZW50cnktc3R1YiBtb2R1bGUgaXMgc2VydmVkIGJ5IHNlbnRyeVN0dWJQbHVnaW4gYWJvdmVcclxuICAgICAgXCJAc2VudHJ5L25leHRqc1wiOiBcInZpcnR1YWw6c2VudHJ5LXN0dWJcIixcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIC8vIEV4Y2x1ZGUgQHRiZS8qIGZyb20gcHJlLWJ1bmRsaW5nIFx1MjAxNCB3b3Jrc3BhY2UgcGFja2FnZXMgYXJlIHNvdXJjZSBmaWxlcyxcclxuICAgIC8vIG5vdCBidW5kbGVkIGFydGVmYWN0cy4gTGV0IFZpdGUgcmVzb2x2ZSB0aGVtIHZpYSB0aGUgYWxpYXNlcyBhYm92ZS5cclxuICAgIC8vIFRoZSBzZW50cnlTdHViUGx1Z2luIGhhbmRsZXMgYW55IEBzZW50cnkvbmV4dGpzIGltcG9ydHMgZm91bmQgZHVyaW5nXHJcbiAgICAvLyB0aGUgb3B0aW1pemVEZXBzIHNjYW4uXHJcbiAgICBleGNsdWRlOiBbXCJAdGJlL3F1ZXJ5XCIsIFwiQHRiZS9jb25maWdcIiwgXCJAdGJlL2hvb2tzXCIsIFwiQHRiZS91dGlsc1wiXSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5UixPQUFPLFdBQVc7QUFDM1MsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBRjdCLElBQU0sbUNBQW1DO0FBSXpDLElBQU0sY0FBYztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWNwQixTQUFTLG1CQUFtQjtBQUMxQixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixVQUFVLElBQVk7QUFDcEIsVUFBSSxPQUFPLG9CQUFvQixPQUFPLHlCQUF5QjtBQUU3RCxlQUFPO0FBQUEsTUFDVDtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxLQUFLLElBQVk7QUFDZixVQUFJLE9BQU8sdUJBQXVCO0FBQ2hDLGVBQU8sRUFBRSxNQUFNLGFBQWEsS0FBSyxLQUFLO0FBQUEsTUFDeEM7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU0sT0FBTyxLQUFLLFFBQVEsZ0NBQVM7QUFFbkMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztBQUFBLEVBQ3JDLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU9OLGVBQWU7QUFBQSxFQUNqQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU1MLGNBQWMsS0FBSyxRQUFRLE1BQU0saUNBQWlDO0FBQUEsTUFDbEUsZUFBZSxLQUFLO0FBQUEsUUFDbEI7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsY0FBYyxLQUFLLFFBQVEsTUFBTSwwQkFBMEI7QUFBQSxNQUMzRCxjQUFjLEtBQUssUUFBUSxNQUFNLDBCQUEwQjtBQUFBO0FBQUEsTUFFM0Qsa0JBQWtCO0FBQUEsSUFDcEI7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtaLFNBQVMsQ0FBQyxjQUFjLGVBQWUsY0FBYyxZQUFZO0FBQUEsRUFDbkU7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
