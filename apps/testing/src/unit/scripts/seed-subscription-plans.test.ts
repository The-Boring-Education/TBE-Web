// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  normalizeSeedApiBase,
  resolveSeedAdminSecret,
} from "../../../../api/scripts/seed-subscription-plans";

describe("seed-subscription-plans: resolveSeedAdminSecret", () => {
  it("rejects a missing secret", () => {
    const result = resolveSeedAdminSecret(undefined, "/tmp/.env.local");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(
        /ADMIN_SECRET not found in \/tmp\/\.env\.local/,
      );
    }
  });

  it("accepts the local file value even when shorter than 16 characters", () => {
    const result = resolveSeedAdminSecret("  TBEAdmin  ");
    expect(result).toEqual({ ok: true, secret: "TBEAdmin" });
  });
});

describe("seed-subscription-plans: normalizeSeedApiBase", () => {
  it("appends /api/v1 when the origin is bare", () => {
    expect(normalizeSeedApiBase("http://localhost:3004")).toBe(
      "http://localhost:3004/api/v1",
    );
  });

  it("keeps an existing /api/v1 suffix and strips a trailing slash", () => {
    expect(
      normalizeSeedApiBase("https://api.theboringeducation.com/api/v1/"),
    ).toBe("https://api.theboringeducation.com/api/v1");
  });
});
