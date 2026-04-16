import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/constants", () => ({
  envConfig: {
    UNSKILLED_API_URL: "https://unskilled.test.com",
  },
  TOPIC_LABELS: {},
}));

global.fetch = vi.fn();

import { resumeEvaluationService } from "@tbe/services";

describe("resumeEvaluationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("evaluateResume", () => {
    it("returns evaluation on success", async () => {
      const mockResponse = {
        score: 85,
        feedback: ["Good experience"],
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      const result = await resumeEvaluationService.evaluateResume({
        resume: "resume text",
        jobDescription: "job desc",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://unskilled.test.com/resume/evaluate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: "resume text",
            jobDescription: "job desc",
          }),
        },
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
          resume: "resume",
          jobDescription: "job",
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
          resume: "resume",
          jobDescription: "job",
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
          resume: "resume",
          jobDescription: "job",
        }),
      ).rejects.toThrow("Failed to evaluate resume");
    });

    it("throws on network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error"),
      );

      await expect(
        resumeEvaluationService.evaluateResume({
          resume: "resume",
          jobDescription: "job",
        }),
      ).rejects.toThrow("Network error");
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

    it("throws on network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Connection refused"),
      );

      await expect(resumeEvaluationService.checkHealth()).rejects.toThrow(
        "Connection refused",
      );
    });
  });
});
