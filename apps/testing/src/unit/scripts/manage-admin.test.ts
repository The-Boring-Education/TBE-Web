// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  assertProdConfirmed,
  isValidEmail,
  MIN_ADMIN_SECRET_LENGTH,
  normalizeEmail,
  resolveEnvOption,
  secretsMatch,
  verifyAdminSecretGuard,
} from "../../../../api/scripts/manage-admin";

describe("manage-admin: verifyAdminSecretGuard (fail-closed)", () => {
  const goodSecret = "x".repeat(MIN_ADMIN_SECRET_LENGTH);

  it("rejects when ADMIN_SECRET is unset", () => {
    const result = verifyAdminSecretGuard({
      adminSecret: undefined,
      confirmSecret: goodSecret,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/missing or shorter/i);
  });

  it("rejects when ADMIN_SECRET is shorter than the minimum length", () => {
    const short = "x".repeat(MIN_ADMIN_SECRET_LENGTH - 1);
    const result = verifyAdminSecretGuard({
      adminSecret: short,
      confirmSecret: short,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/missing or shorter/i);
  });

  it("rejects when the confirmation is missing", () => {
    const result = verifyAdminSecretGuard({
      adminSecret: goodSecret,
      confirmSecret: undefined,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/ADMIN_SECRET_CONFIRM env var is required/i);
  });

  it("rejects when the confirmation does not match", () => {
    const result = verifyAdminSecretGuard({
      adminSecret: goodSecret,
      confirmSecret: `${goodSecret}-different`,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/does not match/i);
  });

  it("accepts when the confirmation matches a sufficiently long secret", () => {
    const result = verifyAdminSecretGuard({
      adminSecret: goodSecret,
      confirmSecret: goodSecret,
    });
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe("manage-admin: secretsMatch (constant-time)", () => {
  it("returns false for differing lengths without throwing", () => {
    expect(secretsMatch("short", "a-much-longer-secret-value")).toBe(false);
  });

  it("returns false for equal-length mismatches", () => {
    expect(secretsMatch("abcdef", "abcxyz")).toBe(false);
  });

  it("returns true for identical strings", () => {
    expect(secretsMatch("identical-secret", "identical-secret")).toBe(true);
  });
});

describe("manage-admin: assertProdConfirmed", () => {
  it("requires --yes for production", () => {
    const result = assertProdConfirmed("production", false);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/--yes/);
  });

  it("allows production when --yes is set", () => {
    expect(assertProdConfirmed("production", true).ok).toBe(true);
  });

  it("does not require --yes for non-production", () => {
    expect(assertProdConfirmed("local", false).ok).toBe(true);
    expect(assertProdConfirmed("development", false).ok).toBe(true);
  });
});

describe("manage-admin: resolveEnvOption", () => {
  it("normalizes aliases", () => {
    expect(resolveEnvOption("local")).toBe("local");
    expect(resolveEnvOption("dev")).toBe("development");
    expect(resolveEnvOption("development")).toBe("development");
    expect(resolveEnvOption("prod")).toBe("production");
    expect(resolveEnvOption("PROD")).toBe("production");
  });

  it("returns null for unknown values", () => {
    expect(resolveEnvOption("staging")).toBeNull();
  });
});

describe("manage-admin: email helpers", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeEmail("  Admin@Example.COM ")).toBe("admin@example.com");
  });

  it("validates email format", () => {
    expect(isValidEmail("admin@example.com")).toBe(true);
    expect(isValidEmail("  Admin@Example.com ")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
  });
});
