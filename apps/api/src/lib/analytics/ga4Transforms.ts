import type { protos } from "@google-analytics/data";
import { ANALYTICS_EVENTS } from "@tbe/constants";

import { formatGa4Date } from "./ga4Config";

type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

export interface MauAnalyticsData {
  mau: number;
  dauTimeSeries: Array<{ date: string; activeUsers: number }>;
  period: string;
}

export interface ActivationCohortRow {
  date: string;
  signups: number;
  activated: number;
  rate: number;
}

export interface ActivationAnalyticsData {
  signups: number;
  activated: number;
  activationRate: number;
  cohorts: ActivationCohortRow[];
  period: string;
}

export interface RetentionCohortRow {
  cohortDate: string;
  size: number;
  retentionByDay: Array<{ day: number; activeUsers: number; rate: number }>;
}

export interface RetentionAnalyticsData {
  cohorts: RetentionCohortRow[];
  averageRetentionCurve: Array<{ day: number; rate: number }>;
  period: string;
}

const readMetric = (
  row: protos.google.analytics.data.v1beta.IRow,
  index = 0,
): number => {
  const value = row.metricValues?.[index]?.value;
  return value ? Number(value) : 0;
};

const readDimension = (
  row: protos.google.analytics.data.v1beta.IRow,
  index = 0,
): string => row.dimensionValues?.[index]?.value ?? "";

export const transformMauReport = (
  dailyResponse: RunReportResponse,
  mauResponse: RunReportResponse,
  period: string,
): MauAnalyticsData => {
  const dauTimeSeries = (dailyResponse.rows ?? []).map((row) => ({
    date: formatGa4Date(readDimension(row, 0)),
    activeUsers: readMetric(row, 0),
  }));

  const mauRow = mauResponse.rows?.[0];
  const mau = mauRow ? readMetric(mauRow, 0) : 0;

  return { mau, dauTimeSeries, period };
};

export const transformActivationReport = (
  response: RunReportResponse,
  period: string,
): ActivationAnalyticsData => {
  const cohortMap = new Map<string, { signups: number; activated: number }>();

  for (const row of response.rows ?? []) {
    const eventName = readDimension(row, 0);
    const date = formatGa4Date(readDimension(row, 1));
    const users = readMetric(row, 0);

    const entry = cohortMap.get(date) ?? { signups: 0, activated: 0 };
    if (eventName === ANALYTICS_EVENTS.SIGNUP_SUCCESS) {
      entry.signups += users;
    } else if (eventName === ANALYTICS_EVENTS.USER_ACTIVATED) {
      entry.activated += users;
    }
    cohortMap.set(date, entry);
  }

  const cohorts: ActivationCohortRow[] = Array.from(cohortMap.entries())
    .map(([date, values]) => ({
      date,
      signups: values.signups,
      activated: values.activated,
      rate:
        values.signups > 0
          ? Math.round((values.activated / values.signups) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const signups = cohorts.reduce((sum, row) => sum + row.signups, 0);
  const activated = cohorts.reduce((sum, row) => sum + row.activated, 0);
  const activationRate =
    signups > 0 ? Math.round((activated / signups) * 1000) / 10 : 0;

  return { signups, activated, activationRate, cohorts, period };
};

export const transformRetentionReport = (
  response: RunReportResponse,
  period: string,
): RetentionAnalyticsData => {
  const cohortMap = new Map<
    string,
    { size: number; days: Map<number, number> }
  >();

  for (const row of response.rows ?? []) {
    const cohortRaw = readDimension(row, 0);
    const nthDay = Number(readDimension(row, 1));
    const activeUsers = readMetric(row, 0);

    const cohortDate = formatGa4Date(cohortRaw.replace(/^cohort_/, ""));
    const entry = cohortMap.get(cohortDate) ?? {
      size: 0,
      days: new Map<number, number>(),
    };

    if (nthDay === 0) {
      entry.size = activeUsers;
    }
    entry.days.set(nthDay, activeUsers);
    cohortMap.set(cohortDate, entry);
  }

  const cohorts: RetentionCohortRow[] = Array.from(cohortMap.entries())
    .map(([cohortDate, entry]) => {
      const baseSize = entry.size || entry.days.get(0) || 0;
      const retentionByDay = Array.from(entry.days.entries())
        .map(([day, activeUsers]) => ({
          day,
          activeUsers,
          rate:
            baseSize > 0 ? Math.round((activeUsers / baseSize) * 1000) / 10 : 0,
        }))
        .sort((a, b) => a.day - b.day);

      return { cohortDate, size: baseSize, retentionByDay };
    })
    .sort((a, b) => a.cohortDate.localeCompare(b.cohortDate));

  const dayTotals = new Map<number, { active: number; base: number }>();
  for (const cohort of cohorts) {
    for (const point of cohort.retentionByDay) {
      const current = dayTotals.get(point.day) ?? { active: 0, base: 0 };
      current.active += point.activeUsers;
      if (point.day === 0) {
        current.base += cohort.size;
      }
      dayTotals.set(point.day, current);
    }
  }

  const baseTotal = cohorts.reduce((sum, cohort) => sum + cohort.size, 0);
  const averageRetentionCurve = Array.from(dayTotals.entries())
    .map(([day, totals]) => ({
      day,
      rate:
        baseTotal > 0 ? Math.round((totals.active / baseTotal) * 1000) / 10 : 0,
    }))
    .filter((point) => point.day >= 0 && point.day <= 30)
    .sort((a, b) => a.day - b.day);

  return { cohorts, averageRetentionCurve, period };
};
