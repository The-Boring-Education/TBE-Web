/**
 * Tier resolver — maps a contributor's lifetime points to their tier.
 *
 * The thresholds below are the only place these numbers live in code.
 * Moving a threshold is a one-line change here plus a backfill of
 * `DevRelLead.currentTier`.
 */

export type Tier = "contributor" | "lead" | "captain";

export const TIER_THRESHOLDS = {
  lead: 50,
  captain: 100,
} as const;

export const tier = (points: number): Tier => {
  if (points >= TIER_THRESHOLDS.captain) return "captain";
  if (points >= TIER_THRESHOLDS.lead) return "lead";
  return "contributor";
};
