// hooks/useResumeEvaluation.ts
import { routes } from "@tbe/constants";
import { useApi, usePDFFile } from "@tbe/hooks";
import { useState } from "react";

// FIXME: REFACTOR - Updated to match new API response structure
const DUMMY_EVALUATION_DATA = {
  resumeScore: 86,
  skillsMatched: 12,
  skillsMissing: 3,
  jobsAnalyzed: 1030,
  remoteJobs: 89,
  matchingSkills: [
    {
      skill: "javascript",
      jobCount: 467,
      percentage: 45,
    },
    {
      skill: "mysql",
      jobCount: 291,
      percentage: 28,
    },
    {
      skill: "react",
      jobCount: 276,
      percentage: 27,
    },
    {
      skill: "html",
      jobCount: 242,
      percentage: 23,
    },
    {
      skill: "java",
      jobCount: 193,
      percentage: 19,
    },
    {
      skill: "nodejs",
      jobCount: 172,
      percentage: 17,
    },
    {
      skill: "css",
      jobCount: 165,
      percentage: 16,
    },
    {
      skill: "python",
      jobCount: 143,
      percentage: 14,
    },
    {
      skill: "git",
      jobCount: 136,
      percentage: 13,
    },
    {
      skill: "php",
      jobCount: 133,
      percentage: 13,
    },
    {
      skill: "mongodb",
      jobCount: 101,
      percentage: 10,
    },
    {
      skill: "postgresql",
      jobCount: 88,
      percentage: 9,
    },
  ],
  missingSkills: [
    {
      skill: "jquery",
      jobCount: 180,
      percentage: 17,
    },
    {
      skill: "angular",
      jobCount: 122,
      percentage: 12,
    },
    {
      skill: "spring boot",
      jobCount: 87,
      percentage: 8,
    },
  ],
  companyTypeDistribution: [
    {
      type: "MNC",
      jobCount: 59,
      percentage: 6,
    },
    {
      type: "Mid-Size",
      jobCount: 27,
      percentage: 3,
    },
    {
      type: "Startup",
      jobCount: 944,
      percentage: 92,
    },
  ],
};
      frequency: 136,
      percentage: 13,
    },
    {
      skill: "php",
      frequency: 133,
      percentage: 13,
    },
    {
      skill: "mongodb",
      frequency: 101,
      percentage: 10,
    },
    {
      skill: "postgresql",
      frequency: 88,
      percentage: 9,
    },
  ],
  missingSkills: [
    {
      skill: "jquery",
      frequency: 180,
      percentage: 17,
    },
    {
      skill: "angular",
      frequency: 122,
      percentage: 12,
    },
    {
      skill: "spring boot",
      frequency: 87,
      percentage: 8,
    },
  ],
  resumeScore: 86,
  totalJobsAnalyzed: 1030,
  companyTypeDistribution: [
    {
      name: "MNC",
      count: 59,
      percentage: 6,
    },
    {
      name: "Mid-Size",
      count: 27,
      percentage: 3,
    },
    {
      name: "Startup",
      count: 944,
      percentage: 92,
    },
  ],
  remoteJobs: 89,
};

const useResumeEvaluation = () => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [evaluationData, setEvaluationData] = useState<any>(
    DUMMY_EVALUATION_DATA
  );
  const [error, setError] = useState<string>("");

  const { extractedSkills, file, handleFileUpload, isExtracting } =
    usePDFFile();

  const { makeRequest, loading: isEvaluating } = useApi("evaluateResume");

  const handleResumeEvaluation = async () => {
    setError("");

    if (!file || selectedDomains.length === 0 || !selectedExperience) {
      setError("Please upload resume, select domain and experience");
      return;
    }

    if (extractedSkills.length === 0) {
      setError(
        "No skills found in your resume. Please upload a valid resume with programming skills."
      );
      console.warn("⚠️ No skills extracted from PDF");
      return;
    }

    console.log("🚀 Starting evaluation with:", {
      resumeSkills: extractedSkills,
      domains: selectedDomains,
      experienceLevel: selectedExperience,
    });

    try {
      const response = await makeRequest({
        method: "POST",
        url: `${routes.api.unskilledEvaluation}`,
        body: {
          resumeSkills: extractedSkills.map(s => s.toLowerCase().trim()),
          domains: selectedDomains,
          experienceLevel: selectedExperience,
        },
      });

      // New API returns data wrapped in response.data.data
      setEvaluationData(response.data?.data || response.data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Evaluation failed. Please try again.";
      setError(errorMessage);
      console.error("❌ Evaluation error:", err);
    }
  };

  return {
    file,
    handleFileUpload,
    selectedDomains,
    setSelectedDomains,
    selectedExperience,
    setSelectedExperience,
    isEvaluating,
    isExtracting,
    evaluationData,
    handleResumeEvaluation,
    error,
    extractedSkills, // Expose for debugging
  };
};

export default useResumeEvaluation;
