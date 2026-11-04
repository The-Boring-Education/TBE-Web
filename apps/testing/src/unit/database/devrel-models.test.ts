import {
  Contribution,
  DevRelLead,
  DevRelTask,
  FounderMessage,
} from "@api/lib/database/models/DevRel";
import { getCohortEndDate } from "@api/lib/database/models/DevRel/DevRelLead";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

/**
 * Schema-level guards for the contributor program data model
 * (docs/contributors/01-data-model.md). No DB connection needed — Mongoose
 * validates documents and exposes index definitions in-process.
 */

const indexKeys = (schema: {
  indexes(): [Record<string, unknown>, unknown][];
}) => schema.indexes().map(([fields]) => JSON.stringify(fields));

describe("DevRelLead program fields", () => {
  it("defaults the contribution accounting fields", () => {
    const lead = new DevRelLead({});

    expect(lead.totalContributionPoints).toBe(0);
    expect(lead.approvedContributionsCount).toBe(0);
    expect(lead.currentTier).toBe("contributor");
  });

  it("rejects an unknown tier", () => {
    const lead = new DevRelLead({ currentTier: "founder" });
    const error = lead.validateSync();

    expect(error?.errors.currentTier).toBeDefined();
  });

  it("rejects negative contribution points", () => {
    const lead = new DevRelLead({ totalContributionPoints: -1 });
    const error = lead.validateSync();

    expect(error?.errors.totalContributionPoints).toBeDefined();
  });

  it("ends a cohort 4 calendar months after it starts", () => {
    expect(getCohortEndDate(new Date("2026-01-15T00:00:00.000Z"))).toEqual(
      new Date("2026-05-15T00:00:00.000Z"),
    );
  });

  it("indexes the admin leaderboard and graduation sweep queries", () => {
    const keys = indexKeys(DevRelLead.schema);

    expect(keys).toContain(
      JSON.stringify({ status: 1, totalContributionPoints: -1 }),
    );
    expect(keys).toContain(JSON.stringify({ cohortEndsAt: 1 }));
  });
});

describe("DevRelTask program fields", () => {
  it("defaults track, difficulty, category and claim accounting", () => {
    const task = new DevRelTask({});

    expect(task.track).toBe("code");
    expect(task.difficulty).toBe("beginner");
    expect(task.category).toBe("community");
    expect(task.pointsReward).toBe(1);
    expect(task.maxClaims).toBeNull();
    expect(task.claimCount).toBe(0);
  });

  it("rejects a pointsReward below 1", () => {
    const task = new DevRelTask({ pointsReward: 0 });
    const error = task.validateSync();

    expect(error?.errors.pointsReward).toBeDefined();
  });

  it.each(["code", "community"])("accepts track %s", (track) => {
    const task = new DevRelTask({ track });

    expect(task.validateSync()?.errors.track).toBeUndefined();
  });

  it("rejects an unknown category", () => {
    const task = new DevRelTask({ category: "marketing" });

    expect(task.validateSync()?.errors.category).toBeDefined();
  });

  it("is open while active and under the claim limit", () => {
    const unlimited = new DevRelTask({ claimCount: 99 });
    const underLimit = new DevRelTask({ maxClaims: 3, claimCount: 2 });
    const atLimit = new DevRelTask({ maxClaims: 3, claimCount: 3 });
    const inactive = new DevRelTask({ isActive: false });

    expect(unlimited.isOpen).toBe(true);
    expect(underLimit.isOpen).toBe(true);
    expect(atLimit.isOpen).toBe(false);
    expect(inactive.isOpen).toBe(false);
  });
});

describe("Contribution model", () => {
  const validPayload = {
    leadId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    taskId: new Types.ObjectId(),
    track: "code",
    proofUrl: "https://github.com/org/repo/pull/1",
    proofKind: "github_pr",
    notes: "Shipped the fix",
  };

  it("accepts a task-backed contribution and defaults the ledger fields", () => {
    const contribution = new Contribution(validPayload);

    expect(contribution.validateSync()).toBeUndefined();
    expect(contribution.status).toBe("pending");
    expect(contribution.pointsAwarded).toBe(0);
    expect(contribution.revisions).toHaveLength(0);
  });

  it("requires customTitle when there is no task", () => {
    const contribution = new Contribution({
      ...validPayload,
      taskId: null,
      customTitle: undefined,
    });

    expect(contribution.validateSync()?.errors.customTitle).toBeDefined();
  });

  it("accepts a custom contribution with a title", () => {
    const contribution = new Contribution({
      ...validPayload,
      taskId: null,
      customTitle: "Hosted a community AMA",
    });

    expect(contribution.validateSync()).toBeUndefined();
  });

  it.each([["notes"], ["proofUrl"], ["proofKind"], ["track"]])(
    "requires %s",
    (field) => {
      const contribution = new Contribution({
        ...validPayload,
        [field]: undefined,
      });

      expect(contribution.validateSync()?.errors[field]).toBeDefined();
    },
  );

  it("rejects an unknown status", () => {
    const contribution = new Contribution({
      ...validPayload,
      status: "merged",
    });

    expect(contribution.validateSync()?.errors.status).toBeDefined();
  });

  it("zeroes pointsAwarded unless the contribution is approved", async () => {
    const contribution = new Contribution({
      ...validPayload,
      status: "changes_requested",
      pointsAwarded: 25,
    });
    await contribution.validate();

    expect(contribution.pointsAwarded).toBe(0);
  });

  it("keeps pointsAwarded on approved contributions", async () => {
    const contribution = new Contribution({
      ...validPayload,
      status: "approved",
      pointsAwarded: 25,
    });
    await contribution.validate();

    expect(contribution.pointsAwarded).toBe(25);
  });

  it("indexes the lead list, review queue and unique proof per lead", () => {
    const definitions = Contribution.schema.indexes();
    const keys = definitions.map(([fields]) => JSON.stringify(fields));

    expect(keys).toContain(JSON.stringify({ leadId: 1, createdAt: -1 }));
    expect(keys).toContain(JSON.stringify({ status: 1, createdAt: -1 }));

    const uniqueProof = definitions.find(
      ([fields]) =>
        JSON.stringify(fields) === JSON.stringify({ proofUrl: 1, leadId: 1 }),
    );
    expect(uniqueProof?.[1]).toMatchObject({ unique: true });
  });
});

describe("FounderMessage model", () => {
  const validPayload = {
    leadId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    tierAtSendTime: "contributor",
    category: "mentorship",
    subject: "Need a mentor for my first PR",
    body: "Could you point me at a reviewer?",
  };

  it("defaults priority to normal", () => {
    const message = new FounderMessage(validPayload);

    expect(message.validateSync()).toBeUndefined();
    expect(message.priority).toBe("normal");
  });

  it("rejects a body longer than 2000 characters", () => {
    const message = new FounderMessage({
      ...validPayload,
      body: "x".repeat(2001),
    });

    expect(message.validateSync()?.errors.body).toBeDefined();
  });

  it("rejects an unknown category", () => {
    const message = new FounderMessage({ ...validPayload, category: "other" });

    expect(message.validateSync()?.errors.category).toBeDefined();
  });

  it("indexes the admin inbox view", () => {
    expect(indexKeys(FounderMessage.schema)).toContain(
      JSON.stringify({ resolvedAt: 1, priority: -1, createdAt: 1 }),
    );
  });
});
