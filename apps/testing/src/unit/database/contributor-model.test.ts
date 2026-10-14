import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import { CONTRIBUTOR_ROLES } from "@/lib/constants";
import Contributor from "@/lib/database/models/Contributor";

describe("Contributor Model Schema Constraints & Invariants", () => {
  const dummyUserId = new mongoose.Types.ObjectId();

  const createBaseContributorData = () => ({
    userId: dummyUserId,
    email: "jane@example.com",
    name: "Jane Smith",
  });

  describe("defaults and basic fields", () => {
    it("sets default values for new contributor", () => {
      const doc = new Contributor(createBaseContributorData());
      expect(doc.role).toBe("Contributor");
      expect(doc.totalXp).toBe(0);
      expect(doc.approvedCount).toBe(0);
      expect(doc.pendingCount).toBe(0);
      expect(doc.isCaptain).toBe(false);
      expect(doc.captainUnlockedAt).toBeUndefined();
    });

    it("requires userId, email, and name", () => {
      const doc = new Contributor({});
      const err = doc.validateSync();
      expect(err?.errors["userId"]).toBeDefined();
      expect(err?.errors["email"]).toBeDefined();
      expect(err?.errors["name"]).toBeDefined();
    });

    it("trims and lowercases email", () => {
      const doc = new Contributor({
        ...createBaseContributorData(),
        email: "  JANE@EXAMPLE.COM  ",
      });
      expect(doc.email).toBe("jane@example.com");
    });
  });

  describe("role enum validation", () => {
    it.each(CONTRIBUTOR_ROLES)("accepts valid role: %s", (role) => {
      expect(CONTRIBUTOR_ROLES).toContain(role);
      const doc = new Contributor({
        ...createBaseContributorData(),
        role,
      });
      const err = doc.validateSync();
      expect(err?.errors["role"]).toBeUndefined();
    });

    it.each(["Admin", "SuperUser", "captain", ""])(
      "rejects invalid role: %s",
      (role) => {
        expect(CONTRIBUTOR_ROLES).not.toContain(role);
        const doc = new Contributor({
          ...createBaseContributorData(),
          role,
        });
        const err = doc.validateSync();
        expect(err?.errors["role"]).toBeDefined();
      },
    );
  });

  describe("counts and XP validation", () => {
    it("accepts non-negative totalXp, approvedCount, and pendingCount", () => {
      const doc = new Contributor({
        ...createBaseContributorData(),
        totalXp: 150,
        approvedCount: 10,
        pendingCount: 2,
      });
      const err = doc.validateSync();
      expect(err?.errors["totalXp"]).toBeUndefined();
      expect(err?.errors["approvedCount"]).toBeUndefined();
      expect(err?.errors["pendingCount"]).toBeUndefined();
    });

    it("rejects negative totalXp, approvedCount, and pendingCount", () => {
      const doc = new Contributor({
        ...createBaseContributorData(),
        totalXp: -10,
        approvedCount: -1,
        pendingCount: -3,
      });
      const err = doc.validateSync();
      expect(err?.errors["totalXp"]).toBeDefined();
      expect(err?.errors["approvedCount"]).toBeDefined();
      expect(err?.errors["pendingCount"]).toBeDefined();
    });
  });

  describe("GitHub handle contract", () => {
    it("accepts optional githubUsername and exposes virtual githubHandle", () => {
      const doc = new Contributor({
        ...createBaseContributorData(),
        githubUsername: "janesmith",
      });
      expect(doc.githubUsername).toBe("janesmith");
      expect(doc.githubHandle).toBe("janesmith");
      expect(doc.validateSync()).toBeUndefined();
    });

    it("trims and serializes the stored GitHub username", () => {
      const doc = new Contributor({
        ...createBaseContributorData(),
        githubUsername: "  janesmith  ",
      });

      expect(doc.githubHandle).toBe("janesmith");
      expect(doc.toObject().githubUsername).toBe("janesmith");
      expect(doc.toJSON().githubUsername).toBe("janesmith");
      expect(doc.validateSync()).toBeUndefined();
    });

    it("allows omitting githubUsername", () => {
      const doc = new Contributor(createBaseContributorData());
      expect(doc.githubUsername).toBeUndefined();
      expect(doc.githubHandle).toBeUndefined();
      expect(doc.validateSync()).toBeUndefined();
    });
  });

  describe("captain-state invariants", () => {
    it("synchronizes role to 'TBE Captain' and sets captainUnlockedAt when isCaptain is true", async () => {
      const doc = new Contributor({
        ...createBaseContributorData(),
        isCaptain: true,
      });

      await doc.validate();
      expect(doc.role).toBe("TBE Captain");
      expect(doc.isCaptain).toBe(true);
      expect(doc.captainUnlockedAt).toBeInstanceOf(Date);
    });

    it("synchronizes isCaptain to true and sets captainUnlockedAt when role is 'TBE Captain'", async () => {
      const doc = new Contributor({
        ...createBaseContributorData(),
        role: "TBE Captain",
      });

      await doc.validate();
      expect(doc.isCaptain).toBe(true);
      expect(doc.role).toBe("TBE Captain");
      expect(doc.captainUnlockedAt).toBeInstanceOf(Date);
    });

    it("preserves pre-existing captainUnlockedAt timestamp", async () => {
      const existingDate = new Date("2025-01-01T00:00:00.000Z");
      const doc = new Contributor({
        ...createBaseContributorData(),
        isCaptain: true,
        captainUnlockedAt: existingDate,
      });

      await doc.validate();
      expect(doc.captainUnlockedAt?.toISOString()).toBe(
        existingDate.toISOString(),
      );
    });

    it("preserves standard contributor state when isCaptain is false", async () => {
      const doc = new Contributor(createBaseContributorData());
      await doc.validate();
      expect(doc.role).toBe("Contributor");
      expect(doc.isCaptain).toBe(false);
      expect(doc.captainUnlockedAt).toBeUndefined();
    });
  });

  describe("index configuration", () => {
    it("has compound index on totalXp and createdAt for top contributors leaderboard", () => {
      const indexes = Contributor.schema.indexes();
      const indexFields = indexes.map((idx) => Object.keys(idx[0]));

      expect(
        indexFields.some(
          (keys) => keys.includes("totalXp") && keys.includes("createdAt"),
        ),
      ).toBe(true);
    });
  });
});
