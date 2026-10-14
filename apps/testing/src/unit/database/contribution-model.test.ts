import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import {
  CATEGORY_TO_TYPE_GROUP,
  CONTRIBUTION_CATEGORIES,
  CONTRIBUTION_STATUS,
  CONTRIBUTION_TYPE_GROUPS,
} from "@/lib/constants";
import Contribution from "@/lib/database/models/Contribution";

describe("Contribution Model Schema Constraints & Invariants", () => {
  const dummyContributorId = new mongoose.Types.ObjectId();
  const dummyUserId = new mongoose.Types.ObjectId();

  const createBaseContributionData = () => ({
    contributorId: dummyContributorId,
    userId: dummyUserId,
    contributorName: "John Doe",
    contributorEmail: "john@example.com",
    category: "BLOG" as const,
    typeGroup: "blogs" as const,
    proofUrl: "https://example.com/blog/1",
    title: "Understanding Microservices",
    standardXp: 5,
  });

  describe("category and typeGroup validation & derivation", () => {
    it.each(CONTRIBUTION_CATEGORIES)(
      "accepts valid category: %s",
      (category) => {
        expect(CONTRIBUTION_CATEGORIES).toContain(category);
      },
    );

    it.each(["INVALID_CAT", "code", "random", ""])(
      "rejects invalid category: %s",
      (category) => {
        expect(CONTRIBUTION_CATEGORIES).not.toContain(category);
        const doc = new Contribution({
          ...createBaseContributionData(),
          category: category as any,
        });
        const err = doc.validateSync();
        expect(err?.errors["category"]).toBeDefined();
      },
    );

    it.each(CONTRIBUTION_TYPE_GROUPS)(
      "accepts valid typeGroup: %s",
      (typeGroup) => {
        expect(CONTRIBUTION_TYPE_GROUPS).toContain(typeGroup);
      },
    );

    it.each(["invalid", "video", "DESIGN", ""])(
      "rejects invalid typeGroup: %s",
      (typeGroup) => {
        expect(CONTRIBUTION_TYPE_GROUPS).not.toContain(typeGroup);
      },
    );

    it("verifies CATEGORY_TO_TYPE_GROUP exhaustive mapping", () => {
      expect(CATEGORY_TO_TYPE_GROUP.PR_BUG_FIX).toBe("code");
      expect(CATEGORY_TO_TYPE_GROUP.CREATE_ISSUE).toBe("code");
      expect(CATEGORY_TO_TYPE_GROUP.REVIEW_PR).toBe("code");
      expect(CATEGORY_TO_TYPE_GROUP.BLOG).toBe("blogs");
      expect(CATEGORY_TO_TYPE_GROUP.POST).toBe("content");
      expect(CATEGORY_TO_TYPE_GROUP.EVENT_SESSION).toBe("community");
    });

    it("derives typeGroup automatically when omitted", async () => {
      const data = createBaseContributionData();
      delete (data as any).typeGroup;

      const doc = new Contribution(data);
      expect(doc.typeGroup).toBe("blogs");

      await doc.validate();
      expect(doc.typeGroup).toBe("blogs");
    });

    it("corrects and re-derives mismatched typeGroup via pre-validate hook", async () => {
      // Supplying mismatched pair: BLOG with typeGroup "code"
      const doc = new Contribution({
        ...createBaseContributionData(),
        category: "BLOG",
        typeGroup: "code" as any,
      });

      await doc.validate();
      // Should be auto-corrected to "blogs" based on CATEGORY_TO_TYPE_GROUP
      expect(doc.typeGroup).toBe("blogs");
    });

    it("validates all category to typeGroup pairs correctly", async () => {
      for (const [category, expectedTypeGroup] of Object.entries(
        CATEGORY_TO_TYPE_GROUP,
      )) {
        const doc = new Contribution({
          ...createBaseContributionData(),
          category: category as any,
        });
        await doc.validate();
        expect(doc.typeGroup).toBe(expectedTypeGroup);
      }
    });
  });

  describe("status enum and defaults", () => {
    it("defaults status to 'pending'", () => {
      const doc = new Contribution(createBaseContributionData());
      expect(doc.status).toBe("pending");
    });

    it.each(CONTRIBUTION_STATUS)("accepts valid status: %s", (status) => {
      expect(CONTRIBUTION_STATUS).toContain(status);
      const doc = new Contribution({
        ...createBaseContributionData(),
        status,
      });
      const err = doc.validateSync();
      expect(err?.errors["status"]).toBeUndefined();
    });

    it.each(["approved_by_admin", "declined", "IN_REVIEW", ""])(
      "rejects invalid status: %s",
      (status) => {
        expect(CONTRIBUTION_STATUS).not.toContain(status);
        const doc = new Contribution({
          ...createBaseContributionData(),
          status: status as any,
        });
        const err = doc.validateSync();
        expect(err?.errors["status"]).toBeDefined();
      },
    );
  });

  describe("XP validation", () => {
    it("requires standardXp", () => {
      const data = createBaseContributionData();
      delete (data as any).standardXp;
      const doc = new Contribution(data);
      const err = doc.validateSync();
      expect(err?.errors["standardXp"]).toBeDefined();
    });

    it("defaults awardedXp to 0", () => {
      const doc = new Contribution(createBaseContributionData());
      expect(doc.awardedXp).toBe(0);
    });

    it("accepts non-negative XP values", () => {
      const doc = new Contribution({
        ...createBaseContributionData(),
        standardXp: 15,
        awardedXp: 20,
      });
      const err = doc.validateSync();
      expect(err?.errors["standardXp"]).toBeUndefined();
      expect(err?.errors["awardedXp"]).toBeUndefined();
    });

    it("rejects negative standardXp and awardedXp", () => {
      const doc = new Contribution({
        ...createBaseContributionData(),
        standardXp: -5,
        awardedXp: -1,
      });
      const err = doc.validateSync();
      expect(err?.errors["standardXp"]).toBeDefined();
      expect(err?.errors["awardedXp"]).toBeDefined();
    });
  });

  describe("required fields validation", () => {
    it("requires contributorId, userId, contributorName, contributorEmail, proofUrl, title", () => {
      const doc = new Contribution({});
      const err = doc.validateSync();
      expect(err?.errors["contributorId"]).toBeDefined();
      expect(err?.errors["userId"]).toBeDefined();
      expect(err?.errors["contributorName"]).toBeDefined();
      expect(err?.errors["contributorEmail"]).toBeDefined();
      expect(err?.errors["proofUrl"]).toBeDefined();
      expect(err?.errors["title"]).toBeDefined();
    });
  });

  describe("index configuration", () => {
    it("has compound indexes for user dashboard and admin moderation", () => {
      const indexes = Contribution.schema.indexes();
      const indexFields = indexes.map((idx) => Object.keys(idx[0]));

      expect(
        indexFields.some(
          (keys) =>
            keys.includes("contributorId") &&
            keys.includes("status") &&
            keys.includes("createdAt"),
        ),
      ).toBe(true);

      expect(
        indexFields.some(
          (keys) =>
            keys.includes("userId") &&
            keys.includes("typeGroup") &&
            keys.includes("createdAt"),
        ),
      ).toBe(true);

      expect(
        indexFields.some(
          (keys) => keys.includes("status") && keys.includes("createdAt"),
        ),
      ).toBe(true);
    });
  });
});
