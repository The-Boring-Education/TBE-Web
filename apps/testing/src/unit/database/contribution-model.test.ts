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
        const doc = new Contribution({
          ...createBaseContributionData(),
          category,
          typeGroup: CATEGORY_TO_TYPE_GROUP[category],
        });
        expect(doc.validateSync()).toBeUndefined();
      },
    );

    it.each(["INVALID_CAT", "code", "random", ""])(
      "rejects invalid category: %s",
      (category) => {
        expect(CONTRIBUTION_CATEGORIES).not.toContain(category);
        const doc = new Contribution({
          ...createBaseContributionData(),
          category,
        });
        const err = doc.validateSync();
        expect(err?.errors["category"]).toBeDefined();
      },
    );

    it.each(CONTRIBUTION_TYPE_GROUPS)(
      "accepts valid typeGroup: %s",
      (typeGroup) => {
        const category = CONTRIBUTION_CATEGORIES.find(
          (candidate) => CATEGORY_TO_TYPE_GROUP[candidate] === typeGroup,
        );
        const doc = new Contribution({
          ...createBaseContributionData(),
          category,
          typeGroup,
        });
        expect(doc.validateSync()).toBeUndefined();
      },
    );

    it.each(["invalid", "video", "DESIGN", ""])(
      "rejects invalid typeGroup: %s",
      (typeGroup) => {
        const doc = new Contribution({
          ...createBaseContributionData(),
          typeGroup,
        });
        expect(doc.validateSync()?.errors["typeGroup"]).toBeDefined();
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
      const { typeGroup, ...data } = createBaseContributionData();

      const doc = new Contribution(data);
      expect(doc.typeGroup).toBe(typeGroup);

      await doc.validate();
      expect(doc.typeGroup).toBe("blogs");
    });

    it("does not derive a typeGroup without a document when evaluating upsert defaults", () => {
      expect(
        Contribution.schema.path("typeGroup").getDefault(null),
      ).toBeUndefined();
    });

    it("corrects and re-derives mismatched typeGroup via pre-validate hook", async () => {
      const doc = new Contribution({
        ...createBaseContributionData(),
        category: "BLOG",
        typeGroup: "code",
      });

      await doc.validate();
      expect(doc.typeGroup).toBe("blogs");
    });

    it("rejects mismatched category and typeGroup during synchronous validation", () => {
      const doc = new Contribution({
        ...createBaseContributionData(),
        typeGroup: "code",
      });

      expect(doc.validateSync()?.errors["typeGroup"]).toBeDefined();
    });

    it.each(["category", "typeGroup"])(
      "rejects mismatched update pairs when validating %s",
      async (field) => {
        const query = Contribution.updateOne(
          { _id: new mongoose.Types.ObjectId() },
          { $set: { category: "BLOG", typeGroup: "code" } },
          { runValidators: true },
        );

        const validation = new Promise<void>((resolve, reject) => {
          Contribution.schema
            .path(field)
            .doValidate(
              query.get(field),
              (error) => (error ? reject(error) : resolve()),
              query,
            );
        });

        await expect(validation).rejects.toThrow(
          "typeGroup does not match category mapping",
        );
      },
    );

    it.each(CONTRIBUTION_CATEGORIES)(
      "accepts matching update pair for %s",
      async (category) => {
        const query = Contribution.updateOne(
          { _id: new mongoose.Types.ObjectId() },
          { $set: { category, typeGroup: CATEGORY_TO_TYPE_GROUP[category] } },
          { runValidators: true },
        );

        for (const field of ["category", "typeGroup"]) {
          await new Promise<void>((resolve, reject) => {
            Contribution.schema
              .path(field)
              .doValidate(
                query.get(field),
                (error) => (error ? reject(error) : resolve()),
                query,
              );
          });
        }
      },
    );

    it.each([{ category: "POST" }, { typeGroup: "content" }])(
      "rejects updates to only one paired field: %o",
      async (update) => {
        const field = "category" in update ? "category" : "typeGroup";
        const query = Contribution.updateOne(
          { _id: new mongoose.Types.ObjectId() },
          { $set: update },
          { runValidators: true },
        );

        const validation = new Promise<void>((resolve, reject) => {
          Contribution.schema
            .path(field)
            .doValidate(
              query.get(field),
              (error) => (error ? reject(error) : resolve()),
              query,
            );
        });

        await expect(validation).rejects.toThrow(
          "typeGroup does not match category mapping",
        );
      },
    );

    it("validates all category to typeGroup pairs correctly", async () => {
      for (const category of CONTRIBUTION_CATEGORIES) {
        const doc = new Contribution({
          ...createBaseContributionData(),
          category,
        });
        await doc.validate();
        expect(doc.typeGroup).toBe(CATEGORY_TO_TYPE_GROUP[category]);
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
          status,
        });
        const err = doc.validateSync();
        expect(err?.errors["status"]).toBeDefined();
      },
    );
  });

  describe("XP validation", () => {
    it("requires standardXp", () => {
      const doc = new Contribution({
        ...createBaseContributionData(),
        standardXp: undefined,
      });
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
