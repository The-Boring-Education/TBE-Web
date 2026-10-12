/**
 * Contribution Ledger — the single source of truth for every Contribution Point
 * (docs/contributors/02-contribution-ledger.md).
 *
 * The collection is append-only: rows are only ever inserted. A mistake is
 * corrected by appending a compensating row (`retraction` or
 * `manual_adjustment`), never by editing or deleting history.
 * `DevRelLead.totalContributionPoints` is a denormalised cache of
 * `SUM(delta)` over this collection.
 */
import type { Document } from "mongoose";
import { type Model, model, models, Schema } from "mongoose";

export const LEDGER_ENTRY_KINDS = [
  "contribution_approved",
  "manual_adjustment",
  "retraction",
] as const;

export type LedgerEntryKindType = (typeof LEDGER_ENTRY_KINDS)[number];

/** Kinds that must carry a human-written reason. */
export const LEDGER_KINDS_REQUIRING_REASON: readonly LedgerEntryKindType[] = [
  "manual_adjustment",
  "retraction",
];

/** Thrown whenever something tries to mutate or delete ledger history. */
export class LedgerImmutableError extends Error {
  constructor(public readonly op: string) {
    super(`ContributionLedger is append-only: "${op}" is not allowed`);
    this.name = "LedgerImmutableError";
  }
}

// Contribution Ledger Model Interface
export interface ContributionLedgerModel extends Document {
  _id: Schema.Types.ObjectId;
  leadId: Schema.Types.ObjectId;
  /** Denormalised from the lead so ledger reads never need a join. */
  userId: Schema.Types.ObjectId;
  /** `null` for `manual_adjustment`. */
  submissionId?: Schema.Types.ObjectId | null;
  kind: LedgerEntryKindType;
  /** Signed; negative only for `retraction`. */
  delta: number;
  /** Sum of deltas up to and including this row. */
  balanceAfter: number;
  reason?: string;
  actorId: Schema.Types.ObjectId;
  /** The ONLY timestamp — the ledger has no `updatedAt`. */
  createdAt: Date;
}

const ContributionLedgerSchema = new Schema<ContributionLedgerModel>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "DevRelLead",
      required: [true, "Lead is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Contribution",
      default: null,
      validate: {
        // Approvals and retractions point at a submission; adjustments never do.
        validator(this: ContributionLedgerModel, value: unknown) {
          return this.kind === "manual_adjustment" ? !value : Boolean(value);
        },
        message:
          "Submission is required unless the entry is a manual adjustment",
      },
    },
    kind: {
      type: String,
      enum: LEDGER_ENTRY_KINDS,
      required: [true, "Ledger entry kind is required"],
    },
    delta: {
      type: Number,
      required: [true, "Delta is required"],
      validate: [
        {
          validator: Number.isInteger,
          message: "Delta must be an integer",
        },
        {
          // Points are only ever taken away by a retraction.
          validator(this: ContributionLedgerModel, value: number) {
            return this.kind === "retraction" ? value < 0 : value > 0;
          },
          message: ({ value }: { value: number }) =>
            value < 0
              ? "Only a retraction can carry a negative delta"
              : "A retraction must carry a negative delta",
        },
      ],
    },
    balanceAfter: {
      type: Number,
      required: [true, "Balance after is required"],
      validate: {
        validator: Number.isInteger,
        message: "Balance after must be an integer",
      },
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [2000, "Reason cannot exceed 2000 characters"],
      required: [
        function (this: ContributionLedgerModel) {
          return LEDGER_KINDS_REQUIRING_REASON.includes(this.kind);
        },
        "Reason is required for manual adjustments and retractions",
      ],
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: [true, "Actor is required"],
    },
  },
  {
    // Append-only: there is no `updatedAt` because rows never change.
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes
// History reads for one lead, newest first
ContributionLedgerSchema.index({ leadId: 1, createdAt: -1 });
// Idempotency: one row per (submission, kind). `manual_adjustment` rows carry no
// submissionId and are excluded from the unique index by the partial filter — a
// plain `sparse` compound index would still index them (because `kind` is always
// set) and so would reject a lead's second manual adjustment.
ContributionLedgerSchema.index(
  { submissionId: 1, kind: 1 },
  {
    unique: true,
    partialFilterExpression: { submissionId: { $type: "objectId" } },
  },
);

/**
 * Immutability, layer 2: every mutating hook throws. Rows can only be inserted
 * (`save` on a new document, `create`, `insertMany`).
 */
const MUTATING_QUERY_OPS = [
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "findOneAndReplace",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "findOneAndDelete",
] as const;

for (const op of MUTATING_QUERY_OPS) {
  ContributionLedgerSchema.pre(
    op as "updateOne",
    { document: true, query: true },
    () => {
      throw new LedgerImmutableError(op);
    },
  );
}

// Re-saving an existing document would rewrite history too.
ContributionLedgerSchema.pre("save", function (next) {
  if (!this.isNew) {
    return next(new LedgerImmutableError("save"));
  }
  next();
});

export const ContributionLedger: Model<ContributionLedgerModel> =
  (models?.ContributionLedger as Model<ContributionLedgerModel>) ||
  model<ContributionLedgerModel>(
    "ContributionLedger",
    ContributionLedgerSchema,
  );
