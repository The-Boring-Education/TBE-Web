/**
 * One-shot migration: legacy `DevRelTask.completionTracking` map entries →
 * `Contribution` documents (see `docs/contributors/01-data-model.md`).
 *
 * Status mapping:
 * | completionTracking            | Contribution        |
 * | :---------------------------- | :------------------ |
 * | completed + approved          | approved            |
 * | completed + needs_revision    | changes_requested   |
 * | completed (not yet reviewed)  | pending             |
 * | in_progress                   | pending             |
 * | pending / overdue             | dropped             |
 *
 * Idempotent — reruns skip entries already present in the ledger (matched on
 * the unique `(proofUrl, leadId)` pair).
 *
 * Used by `apps/api/scripts/migrate-devrel-contributions.ts`.
 */
import chalk from "chalk";
import { Types } from "mongoose";

import { Contribution } from "../database/models/DevRel/Contribution";
import { DevRelLead } from "../database/models/DevRel/DevRelLead";
import { DevRelTask } from "../database/models/DevRel/DevRelTask";
import User from "../database/models/User";

export type LegacyContributionStatus =
  "pending" | "approved" | "changes_requested";

export interface LegacyTrackingEntry {
  status?: string;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  submissionUrl?: string;
  reviewStatus?: string;
  reviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
}

/** `null` means the entry carries no contribution worth migrating. */
export const mapLegacyStatus = (
  entry: LegacyTrackingEntry,
): LegacyContributionStatus | null => {
  if (entry.status === "completed") {
    if (entry.reviewStatus === "approved") return "approved";
    if (entry.reviewStatus === "needs_revision") return "changes_requested";
    return "pending";
  }
  if (entry.status === "in_progress") return "pending";
  return null;
};

/**
 * Legacy entries without a submission URL still need a unique, stable
 * `proofUrl` so the ledger's unique index can dedupe reruns.
 */
export const legacyProofUrl = (
  entry: LegacyTrackingEntry,
  taskId: string,
  leadId: string,
): string =>
  entry.submissionUrl?.trim() ||
  `legacy://devrel-task/${taskId}/lead/${leadId}`;

/** Narrow classifier — the full Proof URL Classifier lands with the ledger. */
export const legacyProofKind = (
  proofUrl: string,
): "github_pr" | "github_issue" | "other" => {
  let host = "";
  let pathname = "";
  try {
    const parsed = new URL(proofUrl);
    host = parsed.hostname.toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch {
    return "other";
  }
  if (host !== "github.com" && !host.endsWith(".github.com")) return "other";
  if (pathname.includes("/pull/")) return "github_pr";
  if (pathname.includes("/issues/")) return "github_issue";
  return "other";
};

export interface MigrateContributionsOptions {
  dryRun: boolean;
  /** When false, skip chalk console output (for tests). Default true. */
  verbose?: boolean;
}

export interface MigrateContributionsResult {
  tasksScanned: number;
  entriesScanned: number;
  created: number;
  /** Entries whose status maps to "dropped". */
  dropped: number;
  /** Entries already present in the ledger. */
  skippedExisting: number;
  /** Entries whose lead or user could not be resolved. */
  skippedUnresolved: number;
  errors: number;
}

/**
 * Walk every `DevRelTask.completionTracking` entry and write it to the
 * `Contribution` ledger.
 */
export async function migrateCompletionTrackingToContributions(
  options: MigrateContributionsOptions,
): Promise<MigrateContributionsResult> {
  const { dryRun, verbose = true } = options;
  const log = (message: string) => {
    if (verbose) console.log(message);
  };

  const result: MigrateContributionsResult = {
    tasksScanned: 0,
    entriesScanned: 0,
    created: 0,
    dropped: 0,
    skippedExisting: 0,
    skippedUnresolved: 0,
    errors: 0,
  };

  const tasks = await DevRelTask.find({
    completionTracking: { $exists: true, $ne: {} },
  }).lean();

  /** leadId → userId, resolved through the lead's email. */
  const userIdByLeadId = new Map<string, Types.ObjectId | null>();

  const resolveUserId = async (leadId: string) => {
    if (userIdByLeadId.has(leadId)) return userIdByLeadId.get(leadId) ?? null;

    let userId: Types.ObjectId | null = null;
    if (Types.ObjectId.isValid(leadId)) {
      const lead = await DevRelLead.findById(leadId).select("email").lean();
      if (lead?.email) {
        const user = await User.findOne({ email: lead.email })
          .select("_id")
          .lean();
        userId = (user?._id as Types.ObjectId) ?? null;
      }
    }
    userIdByLeadId.set(leadId, userId);
    return userId;
  };

  for (const task of tasks) {
    result.tasksScanned += 1;
    const taskId = String(task._id);
    const tracking = (task.completionTracking ?? {}) as unknown as Record<
      string,
      LegacyTrackingEntry
    >;

    for (const [leadId, entry] of Object.entries(tracking)) {
      result.entriesScanned += 1;

      const status = mapLegacyStatus(entry ?? {});
      if (!status) {
        result.dropped += 1;
        continue;
      }

      const userId = await resolveUserId(leadId);
      if (!userId) {
        result.skippedUnresolved += 1;
        log(
          chalk.yellow(`  skip: no user for lead ${leadId} (task ${taskId})`),
        );
        continue;
      }

      const proofUrl = legacyProofUrl(entry, taskId, leadId);
      const existing = await Contribution.exists({ proofUrl, leadId });
      if (existing) {
        result.skippedExisting += 1;
        continue;
      }

      const pointsAwarded =
        status === "approved" ? (task.pointsReward ?? 0) : 0;
      const payload = {
        leadId: new Types.ObjectId(leadId),
        userId,
        taskId: task._id,
        track: task.track ?? "code",
        proofUrl,
        proofKind: legacyProofKind(proofUrl),
        notes:
          entry.notes?.trim() ||
          `Migrated from legacy completionTracking (${entry.status}).`,
        status,
        pointsAwarded,
        reviewedBy: entry.reviewedBy,
        reviewedAt: entry.reviewedAt,
        reviewerFeedback: entry.reviewNotes,
        createdAt: entry.startedAt ?? task.createdAt,
        updatedAt: entry.completedAt ?? entry.startedAt ?? task.updatedAt,
      };

      if (dryRun) {
        result.created += 1;
        log(
          chalk.gray(
            `  [dry-run] ${status} contribution for lead ${leadId} (task ${taskId})`,
          ),
        );
        continue;
      }

      try {
        await Contribution.create(payload);
        result.created += 1;
      } catch (error) {
        result.errors += 1;
        log(
          chalk.red(
            `  error: lead ${leadId} (task ${taskId}): ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    }
  }

  return result;
}
