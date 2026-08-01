/**
 * Stable Pages Router stub for unit tests — workspace packages resolve
 * `next/router` (Pages Router) here (see the alias in vitest.config.ts),
 * because `@tbe/hooks` is pre-bundled by Vite's deps optimizer
 * (`deps.optimizer.web.include: ["@tbe/*"]`), and calling the *real*
 * `next/router` outside of a mounted Next.js app throws
 * "NextRouter was not mounted".
 *
 * Note: because of that same pre-bundling, a test file importing this
 * module directly does NOT share a live singleton with the copy consumed
 * from inside `@tbe/hooks` — each gets its own bundled instance. So specs
 * needing to control router behavior should use `vi.mock("next/router", …)`
 * with their own local mock (see `useOptimizedNavigation.test.ts`,
 * `useDsaPrepUrlSync.test.ts`, `useTracking.test.ts`) rather than relying
 * on this file's default export at runtime.
 */
export function useRouter(): Record<string, unknown> {
  throw new Error(
    "next/router stub called directly — specs must vi.mock('next/router', ...) with their own router double.",
  );
}
