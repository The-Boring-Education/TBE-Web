/**
 * Resume Evaluation Service
 * Handles API calls to Unskilled backend for resume evaluation
 * Falls back to internal TBE API when the external service is unreachable
 */

import { envConfig, JOB_EXPERIENCE_LEVEL } from "@tbe/constants";
import type {
  ResumeEvaluationRequest,
  ResumeEvaluationResponse,
} from "@tbe/types";

const EVALUATION_TIMEOUT_MS = 30_000;

const isNetworkError = (error: unknown): boolean =>
  error instanceof TypeError && /failed to fetch/i.test(error.message);

const mapExperienceLevel = (level: string): { min: number; max: number } => {
  const match = JOB_EXPERIENCE_LEVEL.find((e) => e.value === level);
  return match ? { min: match.min, max: match.max } : { min: 0, max: 1 };
};

const evaluateViaExternalApi = async (
  payload: ResumeEvaluationRequest,
  signal: AbortSignal,
): Promise<ResumeEvaluationResponse> => {
  const apiUrl = `${envConfig.UNSKILLED_API_URL}/resume/evaluate`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const textResponse = await response.text();
    throw new Error(
      `Server returned ${response.status}: ${textResponse.substring(0, 200)}`,
    );
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to evaluate resume");
  }

  return await response.json();
};

const evaluateViaInternalApi = async (
  payload: ResumeEvaluationRequest,
  signal: AbortSignal,
): Promise<ResumeEvaluationResponse> => {
  const apiUrl = `${envConfig.API_URL}/v1/unskilled/evaluation`;
  const experience = mapExperienceLevel(payload.experienceLevel);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skills: payload.resumeSkills,
      domains: payload.domains,
      experience,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as any).message || "Failed to evaluate resume");
  }

  const result = await response.json();
  const d = result.data;

  return {
    status: true,
    message: result.message || "Resume evaluation successfully",
    data: {
      resumeScore: d.resumeScore,
      skillsMatched: d.matchedSkills?.length ?? 0,
      skillsMissing: d.missingSkills?.length ?? 0,
      remoteJobs: d.remoteJobs ?? 0,
      jobsAnalyzed: d.totalJobsAnalyzed ?? 0,
      matchingSkills: (d.matchedSkills ?? []).map(
        (s: { skill: string; percentage: number; frequency: number }) => ({
          skill: s.skill,
          percentage: s.percentage,
          jobCount: s.frequency,
        }),
      ),
      missingSkills: (d.missingSkills ?? []).map(
        (s: { skill: string; percentage: number; frequency: number }) => ({
          skill: s.skill,
          percentage: s.percentage,
          jobCount: s.frequency,
        }),
      ),
      companyTypeDistribution: (d.companyTypeDistribution ?? []).map(
        (c: { name: string; count: number; percentage: number }) => ({
          type: c.name,
          percentage: c.percentage,
          jobCount: c.count,
        }),
      ),
    },
  };
};

export const evaluateResume = async (
  payload: ResumeEvaluationRequest,
): Promise<ResumeEvaluationResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EVALUATION_TIMEOUT_MS);

  try {
    if (envConfig.UNSKILLED_API_URL) {
      try {
        return await evaluateViaExternalApi(payload, controller.signal);
      } catch (externalError) {
        if (
          isNetworkError(externalError) ||
          (externalError instanceof DOMException &&
            externalError.name === "AbortError")
        ) {
          console.warn(
            "External evaluation service unreachable, falling back to internal API",
          );
        } else {
          throw externalError;
        }
      }
    }

    if (envConfig.API_URL) {
      return await evaluateViaInternalApi(payload, controller.signal);
    }

    throw new Error(
      "Resume evaluation service is temporarily unavailable. Please try again later.",
    );
  } catch (error: any) {
    if (isNetworkError(error)) {
      throw new Error(
        "Unable to reach the evaluation service. Please check your internet connection and try again.",
      );
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Evaluation request timed out. Please try again later.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const checkResumeServiceHealth = async (): Promise<{
  status: boolean;
  message: string;
  jobsAvailable: number;
}> => {
  if (!envConfig.UNSKILLED_API_URL) {
    throw new Error("Service health check not available");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(
      `${envConfig.UNSKILLED_API_URL}/evaluate/health`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      throw new Error("Service health check failed");
    }

    return await response.json();
  } catch (error: any) {
    if (isNetworkError(error)) {
      throw new Error("Evaluation service is temporarily unavailable.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Resume evaluation service object
 */
export const resumeEvaluationService = {
  evaluateResume,
  checkHealth: checkResumeServiceHealth,
};
