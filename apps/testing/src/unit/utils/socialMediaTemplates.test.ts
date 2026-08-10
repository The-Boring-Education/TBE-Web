import {
  generateDefaultSocialMessage,
  generateSocialMessage,
  getTemplateById,
  getTemplatesForPlatform,
  socialMediaTemplates,
} from "@tbe/utils/socialMediaTemplates";
import { describe, expect, it } from "vitest";

const baseData = {
  challengeName: "100 Days of Code",
  currentDay: 9,
  totalDays: 100,
  progressText: "Solved 5 array problems",
  hoursSpent: 2,
  nextGoals: ["Practice linked lists", "Review binary search"],
  appUrl: "https://prepyatra.theboringeducation.com",
};

describe("socialMediaTemplates utils", () => {
  const stripHashtagLine = (message: string) =>
    message
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"))
      .join("\n");

  it("exposes all defined templates", () => {
    expect(socialMediaTemplates.length).toBeGreaterThan(0);
    expect(socialMediaTemplates.map((t) => t.id)).toContain("default");
  });

  describe("getTemplateById", () => {
    it("finds a template by id", () => {
      const template = getTemplateById("default");
      expect(template?.name).toBe("Default Progress Update");
    });

    it("returns undefined for an unknown id", () => {
      expect(getTemplateById("unknown-id")).toBeUndefined();
    });
  });

  describe("getTemplatesForPlatform", () => {
    it("includes platform-specific and general templates for twitter", () => {
      const templates = getTemplatesForPlatform("twitter");
      const platforms = templates.map((t) => t.platform);

      expect(platforms).toContain("twitter");
      expect(platforms).toContain("general");
      expect(platforms).not.toContain("linkedin");
    });
  });

  describe("generateSocialMessage", () => {
    it("renders the requested template with challenge data", () => {
      const message = generateSocialMessage("twitter-short", baseData);

      expect(message).toContain("100 Days of Code");
      expect(message).toContain("Solved 5 array problems");
      expect(message).toContain(baseData.appUrl);
    });

    it("falls back to the default template for an unknown template id", () => {
      const message = generateSocialMessage("does-not-exist", baseData);
      const defaultMessage = getTemplateById("default")?.template(baseData);

      expect(stripHashtagLine(message)).toBe(
        stripHashtagLine(defaultMessage || ""),
      );
    });

    it("includes a milestone message at the halfway point", () => {
      const message = generateSocialMessage("default", {
        ...baseData,
        currentDay: 50,
        totalDays: 100,
      });

      expect(message).toContain("HALFWAY THERE");
    });
  });

  describe("generateDefaultSocialMessage", () => {
    it("is equivalent to generateSocialMessage('default', data)", () => {
      expect(stripHashtagLine(generateDefaultSocialMessage(baseData))).toBe(
        stripHashtagLine(generateSocialMessage("default", baseData)),
      );
    });
  });
});
