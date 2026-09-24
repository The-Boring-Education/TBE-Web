/**
 * Period Calendar — pure IST calendar math for leaderboard Periods (see CONTEXT.md).
 *
 * Period keys:
 *   DAILY   → "YYYY-MM-DD"  (IST calendar day)
 *   WEEKLY  → "GGGG-Www"    (ISO week, Monday start, ISO week-year)
 *   MONTHLY → "YYYY-MM"     (IST calendar month)
 *
 * IST has no DST, so a fixed offset is exact. Bounds are returned as UTC instants,
 * start inclusive, end exclusive.
 */
import { LEADERBOARD_TZ_OFFSET_MINUTES } from "@tbe/constants";
import type { LeaderboardType } from "@tbe/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const OFFSET_MS = LEADERBOARD_TZ_OFFSET_MINUTES * 60 * 1000;

const PERIOD_KEY_PATTERNS: Record<LeaderboardType, RegExp> = {
  DAILY: /^(\d{4})-(\d{2})-(\d{2})$/,
  WEEKLY: /^(\d{4})-W(\d{2})$/,
  MONTHLY: /^(\d{4})-(\d{2})$/,
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Wall-clock IST as a Date whose UTC getters read IST fields. */
const toIstWallClock = (instant: Date) =>
  new Date(instant.getTime() + OFFSET_MS);

/** Monday 00:00 (as a UTC-epoch wall-clock) of ISO week 1 of an ISO week-year. */
const isoWeekOneMonday = (isoYear: number) => {
  const jan4 = Date.UTC(isoYear, 0, 4);
  const jan4Weekday = (new Date(jan4).getUTCDay() + 6) % 7; // Mon=0
  return jan4 - jan4Weekday * DAY_MS;
};

const isoWeekOf = (wallClock: Date) => {
  const midnight = Date.UTC(
    wallClock.getUTCFullYear(),
    wallClock.getUTCMonth(),
    wallClock.getUTCDate(),
  );
  const weekday = (new Date(midnight).getUTCDay() + 6) % 7; // Mon=0
  const thursday = new Date(midnight + (3 - weekday) * DAY_MS);
  const isoYear = thursday.getUTCFullYear();
  const week =
    Math.floor((thursday.getTime() - isoWeekOneMonday(isoYear)) / (7 * DAY_MS)) +
    1;
  return { isoYear, week };
};

export const getPeriodKey = (type: LeaderboardType, instant: Date): string => {
  const ist = toIstWallClock(instant);
  const y = ist.getUTCFullYear();
  const m = pad(ist.getUTCMonth() + 1);
  if (type === "DAILY") return `${y}-${m}-${pad(ist.getUTCDate())}`;
  if (type === "MONTHLY") return `${y}-${m}`;
  const { isoYear, week } = isoWeekOf(ist);
  return `${isoYear}-W${pad(week)}`;
};

export const getPeriodKeysAt = (
  instant: Date,
): Record<LeaderboardType, string> => ({
  DAILY: getPeriodKey("DAILY", instant),
  WEEKLY: getPeriodKey("WEEKLY", instant),
  MONTHLY: getPeriodKey("MONTHLY", instant),
});

export const isValidPeriodKey = (type: LeaderboardType, key: unknown) => {
  if (typeof key !== "string") return false;
  const match = PERIOD_KEY_PATTERNS[type]?.exec(key);
  if (!match) return false;
  // Round-trip guards against impossible dates like 2026-02-31 or 2026-W60.
  const { start } = getPeriodBoundsUnchecked(type, key);
  return getPeriodKey(type, start) === key;
};

const getPeriodBoundsUnchecked = (type: LeaderboardType, key: string) => {
  const match = PERIOD_KEY_PATTERNS[type].exec(key)!;
  const a = Number(match[1]);
  const b = Number(match[2]);
  let startWall: number;
  let endWall: number;
  if (type === "DAILY") {
    startWall = Date.UTC(a, b - 1, Number(match[3]));
    endWall = startWall + DAY_MS;
  } else if (type === "MONTHLY") {
    startWall = Date.UTC(a, b - 1, 1);
    endWall = Date.UTC(a, b, 1);
  } else {
    startWall = isoWeekOneMonday(a) + (b - 1) * 7 * DAY_MS;
    endWall = startWall + 7 * DAY_MS;
  }
  return {
    start: new Date(startWall - OFFSET_MS),
    end: new Date(endWall - OFFSET_MS),
  };
};

/** UTC instants bounding a Period: start inclusive, end exclusive. Throws on a malformed key. */
export const getPeriodBounds = (
  type: LeaderboardType,
  key: string,
): { start: Date; end: Date } => {
  if (!PERIOD_KEY_PATTERNS[type]?.test(key)) {
    throw new Error(`Invalid ${type} period key: ${key}`);
  }
  return getPeriodBoundsUnchecked(type, key);
};

/** When the Period containing `instant` ends (i.e. the next reset). */
export const getPeriodResetsAt = (type: LeaderboardType, instant: Date) =>
  getPeriodBounds(type, getPeriodKey(type, instant)).end;

/** The key of the Period immediately before the one containing `instant`. */
export const getPreviousPeriodKey = (type: LeaderboardType, instant: Date) => {
  const { start } = getPeriodBounds(type, getPeriodKey(type, instant));
  return getPeriodKey(type, new Date(start.getTime() - 1));
};

export const hasPeriodEnded = (
  type: LeaderboardType,
  key: string,
  now: Date,
) => now.getTime() >= getPeriodBounds(type, key).end.getTime();

/** "Priya Sharma" → "Priya S." — used wherever learners are shown to logged-out viewers. */
export const maskLearnerName = (name?: string | null): string => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "TBE Learner";
  const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return lastInitial ? `${first} ${lastInitial.toUpperCase()}.` : first;
};

/** Compact countdown like "2d 4h", "3h 12m" or "45m". */
export const formatResetCountdown = (msRemaining: number) => {
  const totalMinutes = Math.max(0, Math.floor(msRemaining / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const isLeaderboardType = (value: unknown): value is LeaderboardType =>
  value === "DAILY" || value === "WEEKLY" || value === "MONTHLY";
