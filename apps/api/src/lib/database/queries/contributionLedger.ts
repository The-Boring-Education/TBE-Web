/**
 * Contribution Ledger queries — the only sanctioned way to touch the ledger
 * (docs/contributors/02-contribution-ledger.md).
 *
 * Exactly four public functions: `record`, `balanceOf`, `historyOf`, `retract`.
 * Nothing here ever updates or deletes a row; corrections are appended.
 */
import mongoose, { type ClientSession } from "mongoose";

import {
  ContributionLedger,
  type LedgerEntryKindType,
} from "../models/DevRel/ContributionLedger";

export interface LedgerEntry {
  _id: string;
  leadId: string;
  userId: string;
  submissionId: string | null;
  kind: LedgerEntryKindType;
  delta: number;
  balanceAfter: number;
  reason?: string;
  actorId: string;
  createdAt: Date;
}

export interface RecordLedgerEntryInput {
  leadId: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
  /** Required for `contribution_approved`; must be absent for `manual_adjustment`. */
  submissionId?: string | mongoose.Types.ObjectId | null;
  kind: LedgerEntryKindType;
  delta: number;
  /** Required for `manual_adjustment` and `retraction`. */
  reason?: string;
  actorId: string | mongoose.Types.ObjectId;
  /** Pass the review transaction's session so the row commits with the cached total. */
  session?: ClientSession;
}

export interface LedgerHistoryOptions {
  page: number;
  limit: number;
  session?: ClientSession;
}

const DUPLICATE_KEY = 11000;

const isDuplicateKeyError = (error: unknown) =>
  (error as { code?: unknown })?.code === DUPLICATE_KEY;

const toObjectId = (value: string | mongoose.Types.ObjectId, field: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return new mongoose.Types.ObjectId(String(value));
};

/** The shape of a ledger row as it comes back from `lean()` or `toObject()`. */
interface LedgerRow {
  _id: unknown;
  leadId: unknown;
  userId: unknown;
  submissionId?: unknown;
  kind: LedgerEntryKindType;
  delta: number;
  balanceAfter: number;
  reason?: string;
  actorId: unknown;
  createdAt: Date;
}

const toEntry = (doc: LedgerRow): LedgerEntry => ({
  _id: String(doc._id),
  leadId: String(doc.leadId),
  userId: String(doc.userId),
  submissionId: doc.submissionId ? String(doc.submissionId) : null,
  kind: doc.kind,
  delta: doc.delta,
  balanceAfter: doc.balanceAfter,
  reason: doc.reason,
  actorId: String(doc.actorId),
  createdAt: doc.createdAt,
});

const findBySubmission = async (
  submissionId: mongoose.Types.ObjectId,
  kind: LedgerEntryKindType,
  session?: ClientSession,
) =>
  ContributionLedger.findOne({ submissionId, kind })
    .session(session ?? null)
    .lean<LedgerRow | null>();

/**
 * The ground truth balance for one lead: `SUM(delta)`.
 * `DevRelLead.totalContributionPoints` is a cache of this number and must never
 * be used to compute a new balance.
 */
export const balanceOf = async (
  leadId: string | mongoose.Types.ObjectId,
  session?: ClientSession,
): Promise<number> => {
  const [result] = await ContributionLedger.aggregate<{ total: number }>([
    { $match: { leadId: toObjectId(leadId, "leadId") } },
    { $group: { _id: null, total: { $sum: "$delta" } } },
  ]).session(session ?? null);

  return result?.total ?? 0;
};

/**
 * Appends a ledger row. Idempotent on `(submissionId, kind)`: when a row
 * already exists for that pair it is returned unchanged, so callers can safely
 * retry after a network error.
 */
export const record = async (
  entry: RecordLedgerEntryInput,
): Promise<LedgerEntry> => {
  const { session } = entry;
  const leadId = toObjectId(entry.leadId, "leadId");
  const userId = toObjectId(entry.userId, "userId");
  const actorId = toObjectId(entry.actorId, "actorId");
  const submissionId = entry.submissionId
    ? toObjectId(entry.submissionId, "submissionId")
    : null;

  if (submissionId) {
    const existing = await findBySubmission(submissionId, entry.kind, session);
    if (existing) return toEntry(existing);
  }

  const balanceAfter = (await balanceOf(leadId, session)) + entry.delta;

  try {
    const [created] = await ContributionLedger.create(
      [
        {
          leadId,
          userId,
          submissionId,
          kind: entry.kind,
          delta: entry.delta,
          balanceAfter,
          reason: entry.reason,
          actorId,
        },
      ],
      session ? { session } : {},
    );
    if (!created) throw new Error("Failed to append the ledger entry");
    return toEntry(created.toObject() as unknown as LedgerRow);
  } catch (error) {
    // A concurrent writer won the race on the unique (submissionId, kind) index.
    if (submissionId && isDuplicateKeyError(error)) {
      const existing = await findBySubmission(
        submissionId,
        entry.kind,
        session,
      );
      if (existing) return toEntry(existing);
    }
    throw error;
  }
};

/** Ledger history for one lead, newest first and paged. */
export const historyOf = async (
  leadId: string | mongoose.Types.ObjectId,
  opts: LedgerHistoryOptions,
): Promise<LedgerEntry[]> => {
  const page = Math.max(1, Math.trunc(opts.page) || 1);
  const limit = Math.max(1, Math.trunc(opts.limit) || 1);

  const rows = await ContributionLedger.find({
    leadId: toObjectId(leadId, "leadId"),
  })
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .session(opts.session ?? null)
    .lean<LedgerRow[]>();

  return rows.map(toEntry);
};

/**
 * Reverses an entry by appending a new negative row with `kind: "retraction"`.
 * The original row is never touched. Idempotent for submission-backed entries:
 * the unique `(submissionId, kind)` index allows a single retraction per
 * submission.
 */
export const retract = async (
  originalEntryId: string | mongoose.Types.ObjectId,
  reason: string,
  actorId: string | mongoose.Types.ObjectId,
  session?: ClientSession,
): Promise<LedgerEntry> => {
  if (!reason?.trim()) {
    throw new Error("A retraction reason is required");
  }

  const original = await ContributionLedger.findById(
    toObjectId(originalEntryId, "originalEntryId"),
  )
    .session(session ?? null)
    .lean<LedgerRow | null>();

  if (!original) {
    throw new Error("Ledger entry not found");
  }
  if (original.kind === "retraction") {
    throw new Error("A retraction cannot be retracted");
  }

  return record({
    leadId: String(original.leadId),
    userId: String(original.userId),
    submissionId: original.submissionId
      ? String(original.submissionId)
      : undefined,
    kind: "retraction",
    delta: -original.delta,
    reason: reason.trim(),
    actorId,
    session,
  });
};
