import { vi } from "vitest";

/**
 * Vitest resolves `next/navigation` here for all imports (including workspace packages).
 * Mutate `nextNavigationTest` in specs that need a specific pathname or `push` spy.
 */
export const nextNavigationTest = {
  pathname: "/",
  push: vi.fn(),
};

export function useRouter() {
  return {
    push: nextNavigationTest.push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  };
}

export function usePathname() {
  return nextNavigationTest.pathname;
}

export function useSearchParams() {
  return new URLSearchParams();
}
