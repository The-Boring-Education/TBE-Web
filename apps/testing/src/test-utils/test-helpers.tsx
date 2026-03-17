import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Custom render with providers (QueryClient, etc.)
 */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

/**
 * Create mock session data
 */
export function createMockSession(overrides?: any) {
  return {
    user: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      ...overrides?.user,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

/**
 * Create mock API response
 */
export function createMockAPIResponse<T>(data: T, status = true) {
  return {
    status,
    data,
    message: status ? "Success" : "Error",
  };
}
