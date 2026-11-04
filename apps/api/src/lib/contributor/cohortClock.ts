/**
 * Cohort clock — a lead's cohort runs for four *calendar* months, not
 * 120 days. A Jan-15 start ends on May-15; a start on a day the target
 * month does not have snaps to that month's last day (Oct-31 → Feb-28,
 * or Feb-29 in a leap year).
 *
 * All arithmetic is done in UTC so the result does not drift with the
 * server's timezone or DST.
 */

export const COHORT_LENGTH_IN_MONTHS = 4;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type CohortClock = {
  endsAt: Date;
  daysRemaining: number;
  inCohort: boolean;
  graduatedAt: Date | null;
};

const daysInUtcMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

export const addCalendarMonths = (date: Date, months: number): Date => {
  const targetMonthStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const year = targetMonthStart.getUTCFullYear();
  const month = targetMonthStart.getUTCMonth();
  const day = Math.min(date.getUTCDate(), daysInUtcMonth(year, month));

  return new Date(
    Date.UTC(
      year,
      month,
      day,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
};

export const cohortClock = (startedAt: Date, now: Date): CohortClock => {
  const endsAt = addCalendarMonths(startedAt, COHORT_LENGTH_IN_MONTHS);
  const daysRemaining = Math.max(
    0,
    Math.floor((endsAt.getTime() - now.getTime()) / MS_PER_DAY),
  );
  const inCohort = now.getTime() < endsAt.getTime();

  return {
    endsAt,
    daysRemaining,
    inCohort,
    graduatedAt: inCohort ? null : endsAt,
  };
};
