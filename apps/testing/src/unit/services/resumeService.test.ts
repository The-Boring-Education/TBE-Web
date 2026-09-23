import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/constants")>();
  return {
    ...actual,
    JOB_EXPERIENCE_LEVEL: [
      { label: "Fresher (0 yrs)", value: "Fresher (0 yrs)", min: 0, max: 1 },
      {
        label: "Mid-Level (2-4 yrs)",
        value: "Mid-Level (2-4 yrs)",
        min: 2,
        max: 4,
      },
    ],
  };
});

global.fetch = vi.fn();

// Stub the env var used by the service
process.env.NEXT_PUBLIC_API_URL = "https://api.test.com/api/v1";

import { resumeEvaluationService } from "@tbe/services";

const BASE = "https://api.test.com/api/v1";

describe("resumeEvaluationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("evaluateResume", () => {
    const payload = {
      resumeSkills: ["react", "typescript"],
      domains: ["Frontend"],
      experienceLevel: "Mid-Level (2-4 yrs)",
    };

    it("calls the correct URL with mapped request body", async () => {
      const mockResponse = { status: true, message: "ok", data: {} };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      await resumeEvaluationService.evaluateResume(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/unskilled/evaluation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: ["react", "typescript"],
            domains: ["Frontend"],
            experience: { min: 2, max: 4 },
          }),
        },
      );
    });

    it("returns the parsed response on success", async () => {
      const mockResponse = {
        status: true,
        message: "ok",
        data: { resumeScore: 80 },
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      const result = await resumeEvaluationService.evaluateResume(payload);
      expect(result).toEqual(mockResponse);
    });

    it("falls back to { min:0, max:100 } for unknown experience level", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      });

      await resumeEvaluationService.evaluateResume({
        ...payload,
        experienceLevel: "Unknown Level",
      });

      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(body.experience).toEqual({ min: 0, max: 100 });
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
        resumeEvaluationService.evaluateResume(payload),
      ).rejects.toThrow(`Server returned 500: ${longText.substring(0, 200)}`);
    });

    it("throws on HTTP error using message field", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Invalid resume format" }),
      });

      await expect(
        resumeEvaluationService.evaluateResume(payload),
      ).rejects.toThrow("Invalid resume format");
    });

    it("throws default message on HTTP error without message field", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      });

      await expect(
        resumeEvaluationService.evaluateResume(payload),
      ).rejects.toThrow("Failed to evaluate resume");
    });

    it("throws on network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error"),
      );

      await expect(
        resumeEvaluationService.evaluateResume(payload),
      ).rejects.toThrow("Network error");
    });
  });

  describe("checkHealth", () => {
    it("calls the correct health URL and returns response", async () => {
      const mockHealth = { status: true, message: "OK", jobsAvailable: 5 };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await resumeEvaluationService.checkHealth();

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/unskilled/evaluation/health`,
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
