/**
 * Integration tests for the Contribution Ledger query helper
 * (docs/contributors/02-contribution-ledger.md) against in-memory MongoDB.
 *
 * Covers idempotency, retract-writes-a-negative-row, immutability enforcement
 * and the invariant `SUM(delta) === DevRelLead.totalContributionPoints`.
 */
import { ContributionLedger } from "@api/lib/database/models/DevRel/ContributionLedger";
import { DevRelLead } from "@api/lib/database/models/DevRel/DevRelLead";
import {
  balanceOf,
  historyOf,
  record,
  retract,
} from "@api/lib/database/queries/contributionLedger";
import { auditContributionLedger } from "@api/lib/database/queries/contributionLedgerAudit";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const leadPayload = (email: string) => ({
  name: "Lead",
  email,
  applicationData: {
    techStack: ["React"],
    experienceLevel: "Beginner",
    learningFocus: ["Frontend Development"],
    availability: "5-10 hours/week",
    motivation: "Learn in public",
    whyTBE: "Community",
  },
  commitments: {
    weeklyLearning: true,
    communityParticipation: true,
    eventAttendance: true,
    contentCreation: true,
    socialMediaEngagement: true,
  },
});

const actorId = new mongoose.Types.ObjectId();

describe("contributionLedger (integration)", () => {
  let mongod: MongoMemoryServer;
  let leadId: string;
  let userId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(`${mongod.getUri()}contribution_ledger`);
    await ContributionLedger.syncIndexes();
  }, 180_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  }, 30_000);

  beforeEach(async () => {
    // The model blocks deleteMany, so clean up through the raw collection.
    await ContributionLedger.collection.deleteMany({});
    await DevRelLead.deleteMany({});

    const lead = await DevRelLead.create(leadPayload("asha@example.com"));
    leadId = String(lead._id);
    userId = String(new mongoose.Types.ObjectId());
  });

  const approve = (submissionId: string, delta: number) =>
    record({
      leadId,
      userId,
      submissionId,
      kind: "contribution_approved",
      delta,
      actorId,
    });

  describe("record", () => {
    it("appends a row and keeps the running balance", async () => {
      const first = await approve(String(new mongoose.Types.ObjectId()), 20);
      const second = await approve(String(new mongoose.Types.ObjectId()), 5);

      expect(first.balanceAfter).toBe(20);
      expect(second.balanceAfter).toBe(25);
      expect(await balanceOf(leadId)).toBe(25);
    });

    it("is idempotent on (submissionId, kind)", async () => {
      const submissionId = String(new mongoose.Types.ObjectId());

      const first = await approve(submissionId, 20);
      const retry = await approve(submissionId, 20);

      expect(retry._id).toBe(first._id);
      expect(await ContributionLedger.countDocuments({})).toBe(1);
      expect(await balanceOf(leadId)).toBe(20);
    });

    it("returns the stored row when a concurrent writer wins the race", async () => {
      const submissionId = String(new mongoose.Types.ObjectId());

      const [a, b] = await Promise.all([
        approve(submissionId, 20),
        approve(submissionId, 20),
      ]);

      expect(a._id).toBe(b._id);
      expect(await ContributionLedger.countDocuments({})).toBe(1);
    });

    it("allows several manual adjustments for the same lead", async () => {
      const first = await record({
        leadId,
        userId,
        kind: "manual_adjustment",
        delta: 5,
        reason: "Pair work on the paired lead's PR",
        actorId,
      });
      const second = await record({
        leadId,
        userId,
        kind: "manual_adjustment",
        delta: 7,
        reason: "Ran the community call",
        actorId,
      });

      expect(first.submissionId).toBeNull();
      expect(second.balanceAfter).toBe(12);
      expect(await balanceOf(leadId)).toBe(12);
    });

    it("rejects a manual adjustment without a reason", async () => {
      await expect(
        record({
          leadId,
          userId,
          kind: "manual_adjustment",
          delta: 10,
          actorId,
        }),
      ).rejects.toThrow(/reason/i);
    });
  });

  describe("historyOf", () => {
    it("returns newest-first, paged", async () => {
      for (const delta of [1, 2, 3]) {
        await approve(String(new mongoose.Types.ObjectId()), delta);
      }

      const firstPage = await historyOf(leadId, { page: 1, limit: 2 });
      const secondPage = await historyOf(leadId, { page: 2, limit: 2 });

      expect(firstPage.map((row) => row.delta)).toEqual([3, 2]);
      expect(secondPage.map((row) => row.delta)).toEqual([1]);
    });

    it("only returns rows for the requested lead", async () => {
      const other = await DevRelLead.create(leadPayload("bo@example.com"));
      await approve(String(new mongoose.Types.ObjectId()), 7);
      await record({
        leadId: String(other._id),
        userId,
        submissionId: String(new mongoose.Types.ObjectId()),
        kind: "contribution_approved",
        delta: 9,
        actorId,
      });

      const history = await historyOf(leadId, { page: 1, limit: 10 });

      expect(history).toHaveLength(1);
      expect(history[0].delta).toBe(7);
    });
  });

  describe("retract", () => {
    it("writes a new negative row and leaves the original untouched", async () => {
      const submissionId = String(new mongoose.Types.ObjectId());
      const original = await approve(submissionId, 20);

      const retraction = await retract(original._id, "PR reverted", actorId);
      const stored = await ContributionLedger.findById(original._id).lean();

      expect(retraction.kind).toBe("retraction");
      expect(retraction.delta).toBe(-20);
      expect(retraction.balanceAfter).toBe(0);
      expect(retraction.submissionId).toBe(submissionId);
      expect(stored?.delta).toBe(20);
      expect(await balanceOf(leadId)).toBe(0);
      expect(await ContributionLedger.countDocuments({})).toBe(2);
    });

    it("is idempotent for a submission-backed entry", async () => {
      const original = await approve(String(new mongoose.Types.ObjectId()), 20);

      const first = await retract(original._id, "PR reverted", actorId);
      const second = await retract(original._id, "PR reverted", actorId);

      expect(second._id).toBe(first._id);
      expect(await balanceOf(leadId)).toBe(0);
    });

    it("refuses to retract a retraction", async () => {
      const original = await approve(String(new mongoose.Types.ObjectId()), 20);
      const retraction = await retract(original._id, "PR reverted", actorId);

      await expect(retract(retraction._id, "Oops", actorId)).rejects.toThrow(
        /retraction/i,
      );
    });

    it("requires a reason", async () => {
      const original = await approve(String(new mongoose.Types.ObjectId()), 20);

      await expect(retract(original._id, "  ", actorId)).rejects.toThrow(
        /reason/i,
      );
    });
  });

  describe("immutability", () => {
    it("blocks updates and deletes through the model", async () => {
      const entry = await approve(String(new mongoose.Types.ObjectId()), 20);

      await expect(
        ContributionLedger.updateOne(
          { _id: entry._id },
          { $set: { delta: 9999 } },
        ).exec(),
      ).rejects.toThrow(/append-only/);
      await expect(ContributionLedger.deleteMany({}).exec()).rejects.toThrow(
        /append-only/,
      );

      const stored = await ContributionLedger.findById(entry._id).lean();
      expect(stored?.delta).toBe(20);
    });
  });

  describe("the invariant", () => {
    /**
     * Property-style: approve N random contributions, retract a random subset
     * in random order, then compare the cached total to the ledger sum.
     */
    it("holds after N random approvals and retractions", async () => {
      const entryIds: string[] = [];

      for (let i = 0; i < 25; i += 1) {
        const delta = 1 + Math.floor(Math.random() * 50);
        const entry = await approve(
          String(new mongoose.Types.ObjectId()),
          delta,
        );
        entryIds.push(entry._id);
      }

      const retracted = entryIds
        .filter(() => Math.random() < 0.4)
        .sort(() => Math.random() - 0.5);
      for (const id of retracted) {
        await retract(id, "Reverted during audit", actorId);
      }

      // The review workflow caches the ledger sum on the lead.
      const ledgerTotal = await balanceOf(leadId);
      await DevRelLead.updateOne(
        { _id: leadId },
        { $set: { totalContributionPoints: ledgerTotal } },
      );

      const rows = await ContributionLedger.find({ leadId }).lean();
      const expected = rows.reduce((sum, row) => sum + row.delta, 0);
      const lead = await DevRelLead.findById(leadId).lean();

      expect(ledgerTotal).toBe(expected);
      expect(lead?.totalContributionPoints).toBe(ledgerTotal);

      const report = await auditContributionLedger();
      expect(report.drifts).toEqual([]);
      expect(report.leadsChecked).toBe(1);
    }, 60_000);

    it("reports drift when the cached total disagrees with the ledger", async () => {
      await approve(String(new mongoose.Types.ObjectId()), 20);
      await DevRelLead.updateOne(
        { _id: leadId },
        { $set: { totalContributionPoints: 15 } },
      );

      const report = await auditContributionLedger();

      expect(report.drifts).toHaveLength(1);
      expect(report.drifts[0]).toMatchObject({
        leadId,
        cachedTotal: 15,
        ledgerTotal: 20,
        difference: 5,
      });
    });
  });
});
