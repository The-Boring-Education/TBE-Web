/**
 * Resume Evaluation Service
 * Handles API calls to Unskilled backend for resume evaluation
 * Follows same pattern as graph API calls
 */

import { envConfig } from "@tbe/constants";
import type {
  ResumeEvaluationRequest,
  ResumeEvaluationResponse,
} from "@tbe/types";

/**
 * Evaluate resume against job market
 * Calls Unskilled backend directly (like graph API)
 */
export const evaluateResume = async (
  payload: ResumeEvaluationRequest
): Promise<ResumeEvaluationResponse> => {
  try {
    const apiUrl = `${envConfig.UNSKILLED_API_URL}/evaluate`;
    console.log("Calling resume evaluation API:", apiUrl);
    console.log("Payload:", payload);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    // Check content type before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Non-JSON response:", textResponse);
      throw new Error(
        `Server returned ${response.status}: ${textResponse.substring(0, 200)}`
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to evaluate resume");
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
      `${envConfig.UNSKILLED_API_URL}/evaluate/health`
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
