/**
 * Submission state machine — the single source of truth for which
 * submission status transitions are legal.
 *
 * The function is pure; persisting the new status is the caller's job.
 */

export type SubmissionStatus =
  "pending" | "approved" | "changes_requested" | "rejected" | "retracted";

export const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "pending",
  "approved",
  "changes_requested",
  "rejected",
  "retracted",
];

export const ALLOWED_SUBMISSION_TRANSITIONS: Record<
  SubmissionStatus,
  SubmissionStatus[]
> = {
  pending: ["approved", "changes_requested", "rejected"],
  changes_requested: ["pending", "rejected"],
  approved: ["retracted"],
  rejected: [],
  retracted: [],
};

export const canTransition = (
  from: SubmissionStatus,
  to: SubmissionStatus,
): boolean => ALLOWED_SUBMISSION_TRANSITIONS[from]?.includes(to) ?? false;
