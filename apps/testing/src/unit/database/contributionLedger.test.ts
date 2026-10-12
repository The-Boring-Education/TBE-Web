import fs from "node:fs";
import path from "node:path";

import {
  ContributionLedger,
  LedgerImmutableError,
} from "@api/lib/database/models/DevRel/ContributionLedger";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

/**
 * Schema-level guards for the append-only Contribution Ledger
 * (docs/contributors/02-contribution-ledger.md). No DB connection needed —
 * Mongoose validates documents and exposes index definitions in-process.
 */

const indexes = () =>
  ContributionLedger.schema
    .indexes()
    .map(([fields, options]) => ({ fields, options: options ?? {} }));

const approvedPayload = () => ({
  leadId: new Types.ObjectId(),
  userId: new Types.ObjectId(),
  submissionId: new Types.ObjectId(),
  kind: "contribution_approved",
  delta: 20,
  balanceAfter: 20,
  actorId: new Types.ObjectId(),
});

describe("ContributionLedger schema", () => {
  it("accepts an approval row and carries no updatedAt", () => {
    const entry = new ContributionLedger(approvedPayload());

    expect(entry.validateSync()).toBeUndefined();
    expect(ContributionLedger.schema.path("updatedAt")).toBeUndefined();
    expect(ContributionLedger.schema.path("createdAt")).toBeDefined();
  });

  it("requires a reason for manual adjustments and retractions", () => {
    const adjustment = new ContributionLedger({
      ...approvedPayload(),
      submissionId: null,
      kind: "manual_adjustment",
    });
    const retraction = new ContributionLedger({
      ...approvedPayload(),
      kind: "retraction",
      delta: -20,
    });

    expect(adjustment.validateSync()?.errors.reason).toBeDefined();
    expect(retraction.validateSync()?.errors.reason).toBeDefined();
  });

  it("does not require a reason for an approval", () => {
    const entry = new ContributionLedger(approvedPayload());

    expect(entry.validateSync()?.errors.reason).toBeUndefined();
  });

  it("rejects an approval without a submission or with a non-positive delta", () => {
    const noSubmission = new ContributionLedger({
      ...approvedPayload(),
      submissionId: null,
    });
    const zeroDelta = new ContributionLedger({
      ...approvedPayload(),
      delta: 0,
    });

    expect(noSubmission.validateSync()?.errors.submissionId).toBeDefined();
    expect(zeroDelta.validateSync()?.errors.delta).toBeDefined();
  });

  it("rejects a retraction with a non-negative delta", () => {
    const entry = new ContributionLedger({
      ...approvedPayload(),
      kind: "retraction",
      reason: "PR reverted",
      delta: 20,
    });

    expect(entry.validateSync()?.errors.delta).toBeDefined();
  });

  it("rejects a manual adjustment that references a submission", () => {
    const entry = new ContributionLedger({
      ...approvedPayload(),
      kind: "manual_adjustment",
      reason: "Pair work",
    });

    expect(entry.validateSync()?.errors.submissionId).toBeDefined();
  });

  it("rejects an unknown kind and a fractional delta", () => {
    const unknownKind = new ContributionLedger({
      ...approvedPayload(),
      kind: "bonus",
    });
    const fractional = new ContributionLedger({
      ...approvedPayload(),
      delta: 1.5,
    });

    expect(unknownKind.validateSync()?.errors.kind).toBeDefined();
    expect(fractional.validateSync()?.errors.delta).toBeDefined();
  });

  it("indexes history reads and the idempotency pair", () => {
    const history = indexes().find(
      ({ fields }) =>
        JSON.stringify(fields) === JSON.stringify({ leadId: 1, createdAt: -1 }),
    );
    const idempotency = indexes().find(
      ({ fields }) =>
        JSON.stringify(fields) === JSON.stringify({ submissionId: 1, kind: 1 }),
    );

    expect(history).toBeDefined();
    // Partial (not sparse): a sparse compound index would still index the
    // `manual_adjustment` rows, whose submissionId is null.
    expect(idempotency?.options).toMatchObject({
      unique: true,
      partialFilterExpression: { submissionId: { $type: "objectId" } },
    });
  });
});

describe("ContributionLedger immutability", () => {
  it.each([
    "updateOne",
    "updateMany",
    "findOneAndUpdate",
    "findOneAndReplace",
    "replaceOne",
    "deleteOne",
    "deleteMany",
    "findOneAndDelete",
  ])("blocks %s before it reaches the database", async (op) => {
    const query = (ContributionLedger as unknown as Record<string, any>)[op](
      { kind: "contribution_approved" },
      { $set: { delta: 9999 } },
    );

    await expect(query.exec()).rejects.toBeInstanceOf(LedgerImmutableError);
  });

  it("blocks re-saving an existing row", async () => {
    const entry = new ContributionLedger(approvedPayload());
    entry.isNew = false;

    await expect(entry.save()).rejects.toBeInstanceOf(LedgerImmutableError);
  });

  it("keeps the query helper free of update and delete calls", () => {
    const helper = fs.readFileSync(
      path.resolve(
        __dirname,
        "../../../../api/src/lib/database/queries/contributionLedger.ts",
      ),
      "utf-8",
    );

    expect(helper).toMatch(/ContributionLedger\./);
    expect(helper).not.toMatch(
      /\.(updateOne|updateMany|findOneAndUpdate|findOneAndReplace|replaceOne|deleteOne|deleteMany|findOneAndDelete|bulkWrite|remove)\(/,
    );
  });
});
