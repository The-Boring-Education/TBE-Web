import {
  formatGa4Date,
  periodToGa4DateRange,
} from "@api/lib/analytics/ga4Config";
import {
  transformActivationReport,
  transformMauReport,
  transformRetentionReport,
} from "@api/lib/analytics/ga4Transforms";
import { ANALYTICS_EVENTS } from "@tbe/constants";
import { describe, expect, it } from "vitest";

describe("ga4Config", () => {
  it("maps period strings to GA4 date ranges", () => {
    expect(periodToGa4DateRange("7d")).toEqual({
      startDate: "7daysAgo",
      endDate: "today",
    });
    expect(periodToGa4DateRange("30d")).toEqual({
      startDate: "30daysAgo",
      endDate: "today",
    });
  });

  it("formats GA4 YYYYMMDD dates", () => {
    expect(formatGa4Date("20260702")).toBe("2026-07-02");
  });
});

describe("ga4Transforms", () => {
  it("transformMauReport maps daily users and MAU headline", () => {
    const result = transformMauReport(
      {
        rows: [
          {
            dimensionValues: [{ value: "20260701" }],
            metricValues: [{ value: "120" }],
          },
          {
            dimensionValues: [{ value: "20260702" }],
            metricValues: [{ value: "150" }],
          },
        ],
      },
      {
        rows: [{ metricValues: [{ value: "4200" }] }],
      },
      "30d",
    );

    expect(result.mau).toBe(4200);
    expect(result.dauTimeSeries).toEqual([
      { date: "2026-07-01", activeUsers: 120 },
      { date: "2026-07-02", activeUsers: 150 },
    ]);
  });

  it("transformActivationReport uses registry event names", () => {
    const result = transformActivationReport(
      {
        rows: [
          {
            dimensionValues: [
              { value: ANALYTICS_EVENTS.SIGNUP_SUCCESS },
              { value: "20260701" },
            ],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [
              { value: ANALYTICS_EVENTS.USER_ACTIVATED },
              { value: "20260701" },
            ],
            metricValues: [{ value: "40" }],
          },
        ],
      },
      "30d",
    );

    expect(result.signups).toBe(100);
    expect(result.activated).toBe(40);
    expect(result.activationRate).toBe(40);
  });

  it("transformActivationReport computes activation rate with legacy fixture shape", () => {
    const result = transformActivationReport(
      {
        rows: [
          {
            dimensionValues: [
              { value: "signup_success" },
              { value: "20260701" },
            ],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [
              { value: "user_activated" },
              { value: "20260701" },
            ],
            metricValues: [{ value: "40" }],
          },
        ],
      },
      "30d",
    );

    expect(result.signups).toBe(100);
    expect(result.activated).toBe(40);
    expect(result.activationRate).toBe(40);
  });

  it("transformRetentionReport builds average retention curve", () => {
    const result = transformRetentionReport(
      {
        rows: [
          {
            dimensionValues: [{ value: "20260701" }, { value: "0" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20260701" }, { value: "1" }],
            metricValues: [{ value: "50" }],
          },
        ],
      },
      "30d",
    );

    expect(result.cohorts).toHaveLength(1);
    expect(result.cohorts[0].size).toBe(100);
    expect(result.averageRetentionCurve.find((p) => p.day === 1)?.rate).toBe(
      50,
    );
  });
});
