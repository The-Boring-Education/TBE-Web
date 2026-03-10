/**
 * Factory functions to create mock data for tests
 */

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role?: "user" | "admin";
}

/**
 * Create a mock user
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    ...overrides,
  };
}
