import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/constants")>();
  return {
    ...actual,
    envConfig: {
      ...actual.envConfig,
      UNSKILLED_API_URL: "https://unskilled.test.com",
      API_URL: "https://api.test.com",
    },
  };
});

global.fetch = vi.fn();

import { resumeEvaluationService } from "@tbe/services";

describe("resumeEvaluationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("evaluateResume", () => {
    it("returns evaluation on success", async () => {
      const mockResponse = {
        status: true,
        message: "OK",
        data: { resumeScore: 85 },
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      const result = await resumeEvaluationService.evaluateResume({
        resumeSkills: ["javascript"],
        domains: ["Backend Development"],
        experienceLevel: "Fresher (0 yrs)",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://unskilled.test.com/resume/evaluate",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("throws on non-JSON content-type with truncated message", async () => {
      const longText = "x".repeat(300);
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "text/plain" }),
        text: async () => longText,
      });

      await expect(
        resumeEvaluationService.evaluateResume({
          resumeSkills: ["js"],
          domains: ["Backend Development"],
          experienceLevel: "Fresher (0 yrs)",
        }),
      ).rejects.toThrow(`Server returned 500: ${longText.substring(0, 200)}`);
    });

    it("throws on HTTP error with detail", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Invalid resume format" }),
      });

      await expect(
        resumeEvaluationService.evaluateResume({
          resumeSkills: ["js"],
          domains: ["Backend Development"],
          experienceLevel: "Fresher (0 yrs)",
        }),
      ).rejects.toThrow("Invalid resume format");
    });

    it("throws on HTTP error without detail", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      });

      await expect(
        resumeEvaluationService.evaluateResume({
          resumeSkills: ["js"],
          domains: ["Backend Development"],
          experienceLevel: "Fresher (0 yrs)",
        }),
      ).rejects.toThrow("Failed to evaluate resume");
    });

    it("falls back to internal API on network error", async () => {
      const internalResponse = {
        status: true,
        message: "Resume evaluation successfully",
        data: {
          matchedSkills: [
            { skill: "javascript", frequency: 10, percentage: 50 },
          ],
          missingSkills: [
            { skill: "typescript", frequency: 8, percentage: 40 },
          ],
          resumeScore: 60,
          totalJobsAnalyzed: 20,
          companyTypeDistribution: [
            { name: "Startup", count: 5, percentage: 25 },
          ],
          remoteJobs: 3,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => internalResponse,
        });

      const result = await resumeEvaluationService.evaluateResume({
        resumeSkills: ["javascript"],
        domains: ["Backend Development"],
        experienceLevel: "Fresher (0 yrs)",
      });

      expect(result.status).toBe(true);
      expect(result.data.resumeScore).toBe(60);
      expect(result.data.skillsMatched).toBe(1);
      expect(result.data.skillsMissing).toBe(1);
      expect(result.data.matchingSkills[0].jobCount).toBe(10);
      expect(result.data.companyTypeDistribution[0].type).toBe("Startup");

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "https://api.test.com/v1/unskilled/evaluation",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("shows user-friendly message when both services fail with network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new TypeError("Failed to fetch"),
      );

      await expect(
        resumeEvaluationService.evaluateResume({
          resumeSkills: ["js"],
          domains: ["Backend Development"],
          experienceLevel: "Fresher (0 yrs)",
        }),
      ).rejects.toThrow(
        "Unable to reach the evaluation service. Please check your internet connection and try again.",
      );
    });
  });

  describe("checkHealth", () => {
    it("returns health on success", async () => {
      const mockHealth = {
        status: true,
        message: "OK",
        jobsAvailable: 5,
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await resumeEvaluationService.checkHealth();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://unskilled.test.com/evaluate/health",
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(result).toEqual(mockHealth);
    });

    it("throws on non-OK response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      await expect(resumeEvaluationService.checkHealth()).rejects.toThrow(
        "Service health check failed",
      );
    });

    it("throws user-friendly message on network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new TypeError("Failed to fetch"),
      );

      await expect(resumeEvaluationService.checkHealth()).rejects.toThrow(
        "Evaluation service is temporarily unavailable.",
      );
    });
  });
});
