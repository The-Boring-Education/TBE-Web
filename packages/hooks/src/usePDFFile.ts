/**
 * useResumeParser Hook
 * Handles resume file upload and parsing - extracts skills only
 * Follows TBE pattern with proper error handling and loading states
 */

import type { ParseResumeResponse, ResumeFileState } from "@tbe/types";
import { useState } from "react";

const useResumeParser = () => {
  const [state, setState] = useState<ResumeFileState>({
    file: null,
    extractedSkills: [],
    isLoading: false,
    error: null,
  });

  /**
   * Parse resume file using Next.js API route
   */
  const parseResume = async (file: File): Promise<string[]> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const result: ParseResumeResponse = await response.json();

      // Check HTTP status first
      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to parse resume",
        );
      }

      if (!result.status || !result.data) {
        throw new Error(result.message || "Failed to parse resume");
      }

      const { skills } = result.data;

      setState({
        file,
        extractedSkills: skills,
        isLoading: false,
        error: null,
      });

      return skills;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to parse resume";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  /**
   * Handle file upload from input
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setState((prev) => ({
        ...prev,
        error: "Invalid file type. Please upload PDF or DOCX file.",
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setState((prev) => ({
        ...prev,
        error: "File too large. Maximum size is 5MB.",
      }));
      return;
    }

    await parseResume(file);
  };

  /**
   * Reset state
   */
  const reset = () => {
    setState({
      file: null,
      extractedSkills: [],
      isLoading: false,
      error: null,
    });
  };

  return {
    file: state.file,
    extractedSkills: state.extractedSkills,
    isLoading: state.isLoading,
    error: state.error,
    handleFileUpload,
    parseResume,
    reset,
  };
};

export default useResumeParser;
