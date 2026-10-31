/**
 * Exercises the `completionTracking → Contribution` migration runner with the
 * Mongoose models stubbed, so the dry-run / idempotency behaviour is covered
 * without a database. The DB-backed variant lives in
 * `src/integration/migration/devrel-contributions.integration.test.ts`.
 */
import { migrateCompletionTrackingToContributions } from "@api/lib/migration/devrel-contributions";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const leadId = new Types.ObjectId();
const taskId = new Types.ObjectId();
const userId = new Types.ObjectId();

const tasks = vi.hoisted(() => ({ value: [] as unknown[] }));
const existingProofs = vi.hoisted(() => ({ value: new Set<string>() }));
const createdDocs = vi.hoisted(() => ({
  value: [] as Record<string, unknown>[],
}));

vi.mock("@api/lib/database/models/DevRel/DevRelTask", () => ({
  DevRelTask: {
    find: () => ({ lean: async () => tasks.value }),
  },
}));

vi.mock("@api/lib/database/models/DevRel/DevRelLead", () => ({
  DevRelLead: {
    findById: () => ({
      select: () => ({ lean: async () => ({ email: "asha@example.com" }) }),
    }),
  },
}));

vi.mock("@api/lib/database/models/User", () => ({
  default: {
    findOne: () => ({
      select: () => ({ lean: async () => ({ _id: userId }) }),
    }),
  },
}));

vi.mock("@api/lib/database/models/DevRel/Contribution", () => ({
  Contribution: {
    exists: async ({ proofUrl }: { proofUrl: string }) =>
      existingProofs.value.has(proofUrl) ? { _id: new Types.ObjectId() } : null,
    create: async (doc: Record<string, unknown>) => {
      createdDocs.value.push(doc);
      existingProofs.value.add(doc.proofUrl as string);
      return doc;
    },
  },
}));

const taskWithTracking = (tracking: Record<string, unknown>) => ({
  _id: taskId,
  track: "code",
  pointsReward: 20,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  completionTracking: tracking,
});

describe("migrateCompletionTrackingToContributions", () => {
  beforeEach(() => {
    existingProofs.value = new Set();
    createdDocs.value = [];
    tasks.value = [
      taskWithTracking({
        [String(leadId)]: {
          status: "completed",
          reviewStatus: "approved",
          submissionUrl: "https://github.com/org/repo/pull/7",
          notes: "Merged",
          reviewedAt: new Date("2026-01-03T00:00:00.000Z"),
        },
      }),
    ];
  });

  it("reports planned writes without creating anything on a dry run", async () => {
    const result = await migrateCompletionTrackingToContributions({
      dryRun: true,
      verbose: false,
    });

    expect(result).toEqual({
      tasksScanned: 1,
      entriesScanned: 1,
      created: 1,
      dropped: 0,
      skippedExisting: 0,
      skippedUnresolved: 0,
      errors: 0,
    });
    expect(createdDocs.value).toHaveLength(0);
  });

  it("writes approved contributions with the task's points", async () => {
    await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });

    expect(createdDocs.value).toHaveLength(1);
    expect(createdDocs.value[0]).toMatchObject({
      taskId,
      userId,
      track: "code",
      status: "approved",
      pointsAwarded: 20,
      proofKind: "github_pr",
      proofUrl: "https://github.com/org/repo/pull/7",
      notes: "Merged",
    });
  });

  it("skips entries already present in the ledger on a rerun", async () => {
    await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });
    const rerun = await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });

    expect(rerun.created).toBe(0);
    expect(rerun.skippedExisting).toBe(1);
    expect(createdDocs.value).toHaveLength(1);
  });

  it("drops un-started entries and awards no points to pending ones", async () => {
    tasks.value = [
      taskWithTracking({
        [String(leadId)]: { status: "in_progress" },
        [String(new Types.ObjectId())]: { status: "pending" },
      }),
    ];

    const result = await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });

    expect(result).toMatchObject({ entriesScanned: 2, created: 1, dropped: 1 });
    expect(createdDocs.value[0]).toMatchObject({
      status: "pending",
      pointsAwarded: 0,
      proofKind: "other",
    });
    expect(createdDocs.value[0].proofUrl).toBe(
      `legacy://devrel-task/${taskId}/lead/${leadId}`,
    );
  });
});
