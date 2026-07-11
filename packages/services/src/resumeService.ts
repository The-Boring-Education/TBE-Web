import { JOB_EXPERIENCE_LEVEL } from "@tbe/constants";
import type {
  ResumeEvaluationRequest,
  ResumeEvaluationResponse,
} from "@tbe/types";
import { sendRequest } from "@tbe/utils";

function parseExperienceLevel(level: string): { min: number; max: number } {
  const match = JOB_EXPERIENCE_LEVEL.find((e) => e.value === level);
  if (match) return { min: match.min, max: match.max };
  return { min: 0, max: 1 };
}

export const evaluateResume = async (
  payload: ResumeEvaluationRequest,
): Promise<ResumeEvaluationResponse> => {
  const experience = parseExperienceLevel(payload.experienceLevel);

  const response = await sendRequest({
    method: "POST",
    url: "/v1/unskilled/evaluation",
    body: {
      skills: payload.resumeSkills,
      domains: payload.domains,
      experience,
    },
  });

  if (!response.status || !response.data) {
    throw new Error(response.message || "Failed to evaluate resume");
  }

  const d = response.data;
  return {
    status: true,
    message: response.message || "Resume evaluation successfully",
    data: {
      resumeScore: d.resumeScore,
      skillsMatched: d.matchedSkills?.length ?? 0,
      skillsMissing: d.missingSkills?.length ?? 0,
      remoteJobs: d.remoteJobs ?? 0,
      jobsAnalyzed: d.totalJobsAnalyzed ?? 0,
      matchingSkills: (d.matchedSkills ?? []).map((s: any) => ({
        skill: s.skill,
        percentage: s.percentage,
        jobCount: s.frequency,
      })),
      missingSkills: (d.missingSkills ?? []).map((s: any) => ({
        skill: s.skill,
        percentage: s.percentage,
        jobCount: s.frequency,
      })),
      companyTypeDistribution: (d.companyTypeDistribution ?? []).map(
        (c: any) => ({
          type: c.name,
          percentage: c.percentage,
          jobCount: c.count,
        }),
      ),
    },
  };
};

export const resumeEvaluationService = {
  evaluateResume,
};
