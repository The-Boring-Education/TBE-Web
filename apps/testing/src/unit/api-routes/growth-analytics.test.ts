import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (handler: unknown) => handler,
}));

vi.mock("@/middleware/admin", () => ({
  withVerifiedAdminAuth: (handler: unknown) => handler,
}));

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (obj: Record<string, unknown>) => obj,
}));

const {
  fetchMauAnalytics,
  fetchActivationAnalytics,
  fetchRetentionAnalytics,
  Ga4NotConfiguredError,
} = vi.hoisted(() => {
  class Ga4NotConfiguredError extends Error {
    constructor() {
      super("GA4 analytics is not configured");
      this.name = "Ga4NotConfiguredError";
    }
  }

  return {
    fetchMauAnalytics: vi.fn(),
    fetchActivationAnalytics: vi.fn(),
    fetchRetentionAnalytics: vi.fn(),
    Ga4NotConfiguredError,
  };
});

vi.mock("@/lib/analytics/ga4Client", () => ({
  fetchMauAnalytics,
  fetchActivationAnalytics,
  fetchRetentionAnalytics,
  Ga4NotConfiguredError,
}));

import growthAnalyticsHandler from "../../../../api/src/pages/api/v1/admin/growth-analytics";

describe("Admin growth-analytics route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMauAnalytics.mockResolvedValue({
      mau: 100,
      dauTimeSeries: [],
      period: "30d",
    });
    fetchActivationAnalytics.mockResolvedValue({
      signups: 10,
      activated: 4,
      activationRate: 40,
      cohorts: [],
      period: "30d",
    });
    fetchRetentionAnalytics.mockResolvedValue({
      cohorts: [],
      averageRetentionCurve: [],
      period: "30d",
    });
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await growthAnalyticsHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("returns 400 for invalid type", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "invalid" },
    });

    await growthAnalyticsHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("fetches MAU analytics by default", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await growthAnalyticsHandler(req, res);

    expect(fetchMauAnalytics).toHaveBeenCalledWith("30d");
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      status: true,
      data: { mau: 100 },
    });
  });

  it("fetches activation analytics when type=activation", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "activation", period: "7d" },
    });

    await growthAnalyticsHandler(req, res);

    expect(fetchActivationAnalytics).toHaveBeenCalledWith("7d");
    expect(res._getStatusCode()).toBe(200);
  });

  it("returns 503 when GA4 is not configured", async () => {
    fetchRetentionAnalytics.mockRejectedValue(new Ga4NotConfiguredError());

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "retention" },
    });

    await growthAnalyticsHandler(req, res);

    expect(res._getStatusCode()).toBe(503);
    expect(res._getJSONData()).toMatchObject({
      status: false,
      message: expect.stringContaining("GA4 analytics is not configured"),
    });
  });
});
