import {
  getOptionalProfileUrlError,
  normalizeOptionalProfileUrl,
} from "@tbe/utils";
import { describe, expect, it } from "vitest";

describe("normalizeOptionalProfileUrl", () => {
  it("returns empty string for blank input", () => {
    expect(normalizeOptionalProfileUrl("")).toBe("");
    expect(normalizeOptionalProfileUrl("   ")).toBe("");
  });

  it("preserves existing http/https scheme", () => {
    expect(normalizeOptionalProfileUrl("https://x.com/u")).toBe(
      "https://x.com/u",
    );
    expect(normalizeOptionalProfileUrl("http://x.com/u")).toBe(
      "http://x.com/u",
    );
  });

  it("prepends https when scheme omitted", () => {
    expect(normalizeOptionalProfileUrl("github.com/alice")).toBe(
      "https://github.com/alice",
    );
    expect(normalizeOptionalProfileUrl("linkedin.com/in/a")).toBe(
      "https://linkedin.com/in/a",
    );
  });
});

describe("getOptionalProfileUrlError", () => {
  it("returns undefined for omitted values", () => {
    expect(getOptionalProfileUrlError("")).toBeUndefined();
    expect(getOptionalProfileUrlError(" \t")).toBeUndefined();
  });

  it("accepts valid http(s) URLs with or without scheme", () => {
    expect(
      getOptionalProfileUrlError("https://leetcode.com/alice"),
    ).toBeUndefined();
    expect(
      getOptionalProfileUrlError("http://leetcode.com/alice"),
    ).toBeUndefined();
    expect(getOptionalProfileUrlError("github.com/repo")).toBeUndefined();
    expect(getOptionalProfileUrlError("www.example.com/foo")).toBeUndefined();
  });

  it("rejects arbitrary non-url text", () => {
    expect(getOptionalProfileUrlError("not a url")).toBe("Enter a valid URL.");
    expect(getOptionalProfileUrlError("foo bar")).toBe("Enter a valid URL.");
    expect(getOptionalProfileUrlError("://bad")).toBe("Enter a valid URL.");
  });

  it("rejects bare words that parse as single-label hosts", () => {
    expect(getOptionalProfileUrlError("hello")).toBe(
      "Enter a full URL including a domain.",
    );
    expect(getOptionalProfileUrlError("anything")).toBe(
      "Enter a full URL including a domain.",
    );
    expect(getOptionalProfileUrlError("https://nope")).toBe(
      "Enter a full URL including a domain.",
    );
  });
});
