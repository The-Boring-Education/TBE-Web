import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

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

import { resumeEvaluationService } from "@tbe/services";
import { sendRequest } from "@tbe/utils";

describe("resumeEvaluationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("evaluateResume", () => {
    it("returns mapped evaluation on success", async () => {
      (sendRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: true,
        message: "Resume evaluation successfully",
        data: {
          resumeScore: 72,
          matchedSkills: [{ skill: "react", frequency: 40, percentage: 80 }],
          missingSkills: [{ skill: "docker", frequency: 20, percentage: 40 }],
          totalJobsAnalyzed: 50,
          remoteJobs: 12,
          companyTypeDistribution: [
            { name: "Startup", count: 15, percentage: 30 },
          ],
        },
      });

      const result = await resumeEvaluationService.evaluateResume({
        resumeSkills: ["react"],
        domains: ["Frontend Development"],
        experienceLevel: "Fresher (0 yrs)",
      });

      expect(sendRequest).toHaveBeenCalledWith({
        method: "POST",
        url: "/v1/unskilled/evaluation",
        body: {
          skills: ["react"],
          domains: ["Frontend Development"],
          experience: { min: 0, max: 1 },
        },
      });

      expect(result.data.resumeScore).toBe(72);
      expect(result.data.skillsMatched).toBe(1);
      expect(result.data.skillsMissing).toBe(1);
      expect(result.data.jobsAnalyzed).toBe(50);
      expect(result.data.remoteJobs).toBe(12);
      expect(result.data.matchingSkills[0].jobCount).toBe(40);
      expect(result.data.companyTypeDistribution[0].type).toBe("Startup");
    });

    it("falls back to default experience range for unknown level", async () => {
      (sendRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: true,
        data: {
          resumeScore: 0,
          matchedSkills: [],
          missingSkills: [],
          totalJobsAnalyzed: 0,
          remoteJobs: 0,
          companyTypeDistribution: [],
        },
      });

      await resumeEvaluationService.evaluateResume({
        resumeSkills: [],
        domains: [],
        experienceLevel: "Unknown Level",
      });

      expect(sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            experience: { min: 0, max: 1 },
          }),
        }),
      );
    });

    it("throws on API error response", async () => {
      (sendRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: false,
        message: "Missing required fields",
      });

      await expect(
        resumeEvaluationService.evaluateResume({
          resumeSkills: [],
          domains: [],
          experienceLevel: "Fresher (0 yrs)",
        }),
      ).rejects.toThrow("Missing required fields");
    });

    it("throws on network error", async () => {
      (sendRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error"),
      );

      await expect(
        resumeEvaluationService.evaluateResume({
          resumeSkills: [],
          domains: [],
          experienceLevel: "Fresher (0 yrs)",
        }),
      ).rejects.toThrow("Network error");
    });
  });
});
