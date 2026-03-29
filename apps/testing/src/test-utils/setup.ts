import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Set default env vars for tests to avoid "Missing required environment variables" or "baseURL is undefined"
if (typeof process !== "undefined") {
  process.env.NEXT_PUBLIC_API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004/api/v1";
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/tbe-test";
  process.env.NEXTAUTH_SECRET =
    process.env.NEXTAUTH_SECRET || "test-secret-at-least-32-chars-long-123";
  process.env.ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-secret-test";
}

// Cleanup after each test (skip DOM cleanup in node / integration tests)
afterEach(() => {
  vi.clearAllMocks();
  if (typeof document !== "undefined") {
    cleanup();
  }
});

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    route: "/",
  }),
}));

// Next.js App Router: `next/navigation` is aliased in vitest.config to `next-navigation-mock.ts`

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Setup global test environment (jsdom only)
if (typeof window !== "undefined") {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
