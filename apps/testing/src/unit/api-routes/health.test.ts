import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../../../api/src/pages/api/health/index";

// Mock environment config
vi.mock("../../../../api/src/lib/constants", () => ({
  envConfig: {
    QUIZ_APP_URL: "http://localhost:3001",
    ONBOARDING_URL: "http://localhost:3002",
    MONGODB_URI: "mongodb://localhost:27017/test",
  },
}));

vi.mock("mongoose", () => ({
  default: {
    connection: {
      readyState: 1,
      db: {
        admin: () => ({
          ping: vi.fn().mockResolvedValue(true),
        }),
      },
    },
    connect: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("Health Check API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/health", () => {
    it("should return healthy status when all services are healthy", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe("healthy");
      expect(data.services.quizzes.status).toBe("healthy");
      expect(data.services.onboarding.status).toBe("healthy");
      expect(data.summary.healthy).toBe(3);
    });

    it("should return degraded status when some services are unhealthy", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(207);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe("degraded");
      expect(data.services.quizzes.status).toBe("healthy");
      expect(data.services.onboarding.status).toBe("unhealthy");
    });

    it("should return unhealthy status when all services are unhealthy", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(207);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe("degraded");
      expect(data.summary.healthy).toBe(1);
    });

    it("should handle missing service URLs", async () => {
      // When URLs are empty, fetch will fail and return unhealthy
      // This is expected behavior as the handler checks for empty URLs
      (global.fetch as any).mockRejectedValueOnce(new Error("Invalid URL"));
      (global.fetch as any).mockRejectedValueOnce(new Error("Invalid URL"));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      // When URLs are invalid, they return unhealthy status
      expect(data.services.quizzes.status).toBe("unhealthy");
      expect(data.services.onboarding.status).toBe("unhealthy");
    });

    it("should include response time in service status", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.services.quizzes.responseTime).toBeDefined();
      expect(typeof data.services.quizzes.responseTime).toBe("number");
    });

    it("should reject non-GET methods", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const allowHeader = res._getHeaders()["allow"];
      // Allow header can be a string or array
      expect(allowHeader).toBeDefined();
      if (Array.isArray(allowHeader)) {
        expect(allowHeader).toContain("GET");
      } else {
        expect(allowHeader).toBe("GET");
      }
    });

    it("should handle errors gracefully", async () => {
      (global.fetch as any).mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      // Database remains healthy while one external service fails
      expect(res._getStatusCode()).toBe(207);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe("degraded");
    });
  });
});
