/**
 * Polyfill for performance object in Edge runtime.
 * This is required by @opentelemetry/core (used by Sentry) which expects a global performance object.
 */
if (typeof globalThis.performance === "undefined") {
  // @ts-ignore
  globalThis.performance = {
    now: () => Date.now(),
    timeOrigin: Date.now(),
  };
}

export {};
