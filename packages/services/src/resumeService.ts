/**
 * Resume Evaluation Service
 * Handles API calls to the local API backend for resume evaluation
 */

import { JOB_EXPERIENCE_LEVEL } from "@tbe/constants";
import type {
  ResumeEvaluationRequest,
  ResumeEvaluationResponse,
} from "@tbe/types";

const getExperienceRange = (
  experienceLevel: string,
): { min: number; max: number } => {
  const found = JOB_EXPERIENCE_LEVEL.find((e) => e.value === experienceLevel);
  return found ? { min: found.min, max: found.max } : { min: 0, max: 100 };
};

/**
 * Evaluate resume against job market via the local API
 */
export const evaluateResume = async (
  payload: ResumeEvaluationRequest,
): Promise<ResumeEvaluationResponse> => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/unskilled/evaluation`;

    const requestBody = {
      skills: payload.resumeSkills,
      domains: payload.domains,
      experience: getExperienceRange(payload.experienceLevel),
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
      throw new Error(errorData.message || "Failed to evaluate resume");
    }

    const result: ResumeEvaluationResponse = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error evaluating resume:", error);
    throw error;
  }
};

/**
 * Check resume evaluation service health
 */
export const checkResumeServiceHealth = async (): Promise<{
  status: boolean;
  message: string;
  jobsAvailable: number;
}> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/unskilled/evaluation/health`,
    );

    if (!response.ok) {
      throw new Error("Service health check failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error checking service health:", error);
    throw error;
  }
};

/**
 * Resume evaluation service object
 */
export const resumeEvaluationService = {
  evaluateResume,
  checkHealth: checkResumeServiceHealth,
};
