import { BetaAnalyticsDataClient } from "@google-analytics/data";

import {
  type Ga4Config,
  type Ga4DateRange,
  getGa4Config,
  periodToGa4DateRange,
} from "./ga4Config";
import {
  type ActivationAnalyticsData,
  type MauAnalyticsData,
  type RetentionAnalyticsData,
  transformActivationReport,
  transformMauReport,
  transformRetentionReport,
} from "./ga4Transforms";

let cachedClient: BetaAnalyticsDataClient | null = null;
let cachedConfigKey: string | null = null;

const getClient = (config: Ga4Config): BetaAnalyticsDataClient => {
  const key = config.propertyId;
  if (cachedClient && cachedConfigKey === key) {
    return cachedClient;
  }
  cachedClient = new BetaAnalyticsDataClient({
    credentials: config.credentials,
  });
  cachedConfigKey = key;
  return cachedClient;
};

const propertyPath = (propertyId: string): string => `properties/${propertyId}`;

export class Ga4NotConfiguredError extends Error {
  constructor() {
    super("GA4 analytics is not configured");
    this.name = "Ga4NotConfiguredError";
  }
}

export const fetchMauAnalytics = async (
  period = "30d",
): Promise<MauAnalyticsData> => {
  const config = getGa4Config();
  if (!config) throw new Ga4NotConfiguredError();

  const client = getClient(config);
  const dateRange = periodToGa4DateRange(period);

  const [dailyResponse] = await client.runReport({
    property: propertyPath(config.propertyId),
    dateRanges: [dateRange],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  const [mauResponse] = await client.runReport({
    property: propertyPath(config.propertyId),
    dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
    metrics: [{ name: "active28DayUsers" }],
  });

  return transformMauReport(dailyResponse, mauResponse, period);
};

export const fetchActivationAnalytics = async (
  period = "30d",
): Promise<ActivationAnalyticsData> => {
  const config = getGa4Config();
  if (!config) throw new Ga4NotConfiguredError();

  const client = getClient(config);
  const dateRange = periodToGa4DateRange(period);

  const [response] = await client.runReport({
    property: propertyPath(config.propertyId),
    dateRanges: [dateRange],
    dimensions: [{ name: "eventName" }, { name: "date" }],
    metrics: [{ name: "totalUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: ["signup_success", "user_activated"],
        },
      },
    },
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return transformActivationReport(response, period);
};

export const fetchRetentionAnalytics = async (
  period = "30d",
): Promise<RetentionAnalyticsData> => {
  const config = getGa4Config();
  if (!config) throw new Ga4NotConfiguredError();

  const client = getClient(config);
  const dateRange = periodToGa4DateRange(period);

  const [response] = await client.runReport({
    property: propertyPath(config.propertyId),
    dateRanges: [dateRange],
    dimensions: [{ name: "cohort" }, { name: "cohortNthDay" }],
    metrics: [{ name: "cohortActiveUsers" }],
    cohortSpec: {
      cohorts: [
        {
          name: "all_users",
          dimension: "firstSessionDate",
          dateRange,
        },
      ],
      cohortsRange: {
        endOffset: 30,
        granularity: "DAILY",
      },
    },
  });

  return transformRetentionReport(response, period);
};

export type { Ga4DateRange };
