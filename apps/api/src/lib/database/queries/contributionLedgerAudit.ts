/**
 * Ledger invariant audit — for every lead:
 *
 *   SUM(ContributionLedger.delta WHERE leadId = X) === DevRelLead.totalContributionPoints
 *
 * The cached total is written inside the review transaction, so drift should
 * never happen. This job exists so a bug is caught before a lead disputes a
 * point count (docs/contributors/02-contribution-ledger.md §4). It is read-only:
 * it never "repairs" a total, because a silent repair would hide the bug.
 */
import { DevRelLead } from "../models/DevRel/DevRelLead";

export interface LedgerDrift {
  leadId: string;
  email: string;
  /** The cached `DevRelLead.totalContributionPoints`. */
  cachedTotal: number;
  /** The ground truth `SUM(delta)` from the ledger. */
  ledgerTotal: number;
  /** `ledgerTotal - cachedTotal`. */
  difference: number;
}

export interface LedgerInvariantReport {
  checkedAt: Date;
  leadsChecked: number;
  drifts: LedgerDrift[];
}

/** Runs the invariant check across every lead. */
export const auditContributionLedger =
  async (): Promise<LedgerInvariantReport> => {
    const rows = await DevRelLead.aggregate<{
      _id: unknown;
      email: string;
      cachedTotal: number;
      ledgerTotal: number;
    }>([
      {
        $lookup: {
          from: "contributionledgers",
          localField: "_id",
          foreignField: "leadId",
          as: "ledger",
          pipeline: [{ $project: { _id: 0, delta: 1 } }],
        },
      },
      {
        $project: {
          email: 1,
          cachedTotal: { $ifNull: ["$totalContributionPoints", 0] },
          ledgerTotal: { $ifNull: [{ $sum: "$ledger.delta" }, 0] },
        },
      },
    ]);

    const drifts = rows
      .filter((row) => row.cachedTotal !== row.ledgerTotal)
      .map((row) => ({
        leadId: String(row._id),
        email: row.email,
        cachedTotal: row.cachedTotal,
        ledgerTotal: row.ledgerTotal,
        difference: row.ledgerTotal - row.cachedTotal,
      }));

    return { checkedAt: new Date(), leadsChecked: rows.length, drifts };
  };
