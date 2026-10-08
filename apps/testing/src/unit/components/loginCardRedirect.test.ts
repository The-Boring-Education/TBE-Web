import { getSafeRedirectPath } from "@tbe/components";
import { describe, expect, it } from "vitest";

describe("getSafeRedirectPath security sanitizer", () => {
  it("allows valid relative paths", () => {
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("/quizzes/daily-challenge-1")).toBe(
      "/quizzes/daily-challenge-1",
    );
    expect(getSafeRedirectPath("/shiksha/learn?chapterId=ch-2#top")).toBe(
      "/shiksha/learn?chapterId=ch-2#top",
    );
  });

  it("blocks protocol-relative URLs (open redirect)", () => {
    expect(getSafeRedirectPath("//evil.com", "/fallback")).toBe("/fallback");
    expect(getSafeRedirectPath("//theboringeducation.com", "/fallback")).toBe(
      "/fallback",
    );
  });

  it("blocks backslash bypass attempts", () => {
    expect(getSafeRedirectPath("/\\evil.com", "/fallback")).toBe("/fallback");
    expect(getSafeRedirectPath("\\evil.com", "/fallback")).toBe("/fallback");
    expect(getSafeRedirectPath("/foo\\bar", "/fallback")).toBe("/fallback");
  });

  it("blocks javascript: and other executable schemes (XSS prevention)", () => {
    expect(getSafeRedirectPath("javascript:alert(1)", "/fallback")).toBe(
      "/fallback",
    );
    expect(
      getSafeRedirectPath("javascript:void(document.cookie)", "/fallback"),
    ).toBe("/fallback");
    expect(
      getSafeRedirectPath("data:text/html;base64,PHNjcmlwdD4=", "/fallback"),
    ).toBe("/fallback");
    expect(getSafeRedirectPath("vbscript:msgbox(1)", "/fallback")).toBe(
      "/fallback",
    );
  });

  it("blocks untrusted external domains (open redirect)", () => {
    expect(getSafeRedirectPath("https://evil.com/login", "/fallback")).toBe(
      "/fallback",
    );
    expect(
      getSafeRedirectPath(
        "https://theboringeducation.com.evil.com",
        "/fallback",
      ),
    ).toBe("/fallback");
    expect(
      getSafeRedirectPath(
        "http://attacker.com?theboringeducation.com",
        "/fallback",
      ),
    ).toBe("/fallback");
  });

  it("converts trusted absolute URLs to safe relative paths", () => {
    expect(
      getSafeRedirectPath("https://theboringeducation.com/quizzes/dashboard"),
    ).toBe("/quizzes/dashboard");
    expect(
      getSafeRedirectPath(
        "https://platform.theboringeducation.com/quizzes/123?sort=asc",
      ),
    ).toBe("/quizzes/123?sort=asc");
    expect(getSafeRedirectPath("http://localhost:3000/profile")).toBe(
      "/profile",
    );
  });

  it("falls back gracefully when input is missing or invalid", () => {
    expect(getSafeRedirectPath(undefined, "/default")).toBe("/default");
    expect(getSafeRedirectPath(null, "/default")).toBe("/default");
    expect(getSafeRedirectPath("", "/default")).toBe("/default");
    expect(getSafeRedirectPath("   ", "/default")).toBe("/default");
    expect(getSafeRedirectPath(123 as unknown as string, "/default")).toBe(
      "/default",
    );
  });
});
