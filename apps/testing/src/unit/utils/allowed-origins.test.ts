import { describe, expect, it } from "vitest";

import {
  isAllowedTbeHostname,
  isAllowedTbeUrl,
} from "../../../../api/src/lib/utils/allowed-origins";

describe("allowed TBE origins", () => {
  describe("local and production hosts", () => {
    it("allows localhost and loopback", () => {
      expect(isAllowedTbeHostname("localhost")).toBe(true);
      expect(isAllowedTbeHostname("127.0.0.1")).toBe(true);
    });

    it("allows TBE production domains", () => {
      expect(isAllowedTbeHostname("theboringeducation.com")).toBe(true);
      expect(isAllowedTbeHostname("dsayatra.theboringeducation.com")).toBe(
        true,
      );
    });
  });

  describe("Vercel preview hosts", () => {
    it("allows dsayatra development preview used by Dev env", () => {
      expect(
        isAllowedTbeHostname("dsayatra-git-development-tbe.vercel.app"),
      ).toBe(true);
    });

    it("allows other known TBE app previews and tbe- prefixed API previews", () => {
      expect(
        isAllowedTbeHostname("prepyatra-git-development-tbe.vercel.app"),
      ).toBe(true);
      expect(
        isAllowedTbeHostname("tbe-dev-git-development-tbe.vercel.app"),
      ).toBe(true);
      expect(isAllowedTbeHostname("dsayatra-tbe.vercel.app")).toBe(true);
    });

    it("rejects attacker-controlled Vercel hosts", () => {
      expect(isAllowedTbeHostname("evil-tbe.vercel.app")).toBe(false);
      expect(isAllowedTbeHostname("dsayatra.vercel.app")).toBe(false);
      expect(isAllowedTbeHostname("tbe-evil.vercel.app")).toBe(false);
    });
  });

  describe("full URL checks", () => {
    it("allows the Dev env OAuth redirect_uri that was failing", () => {
      expect(
        isAllowedTbeUrl(
          "https://dsayatra-git-development-tbe.vercel.app/auth/callback?returnTo=%2Fpricing",
        ),
      ).toBe(true);
    });

    it("rejects unknown origins", () => {
      expect(isAllowedTbeUrl("https://malicious.example.com/callback")).toBe(
        false,
      );
    });

    it("allows extra origins from ALLOWED_AUTH_ORIGINS", () => {
      expect(
        isAllowedTbeUrl(
          "https://custom-preview.example.com/auth/callback",
          "https://custom-preview.example.com",
        ),
      ).toBe(true);
    });

    it("returns false for invalid URLs", () => {
      expect(isAllowedTbeUrl("not-a-url")).toBe(false);
    });
  });
});
