/**
 * Auth userService tests are skipped: @tbe/auth no longer exposes createOrFindUser,
 * getUserByEmail, or getUserById. User creation/lookup happens only in the API app
 * (centralized auth). The old services/userService was removed in the auth v3 rewrite.
 */
import { describe, it } from "vitest";

describe("Auth userService", () => {
  it.skip("legacy userService was removed from @tbe/auth (user ops are in API app only)", () => {});
});
