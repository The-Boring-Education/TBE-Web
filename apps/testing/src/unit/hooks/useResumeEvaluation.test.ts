import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockHandleFileUpload = vi.fn();
let mockParserState = {
  file: null as File | null,
  extractedSkills: [] as string[],
  handleFileUpload: mockHandleFileUpload,
  isLoading: false,
};

vi.mock("@tbe/hooks/usePDFFile", () => ({
  default: () => mockParserState,
}));

const mockEvaluateResume = vi.fn();
vi.mock("@tbe/services", () => ({
  resumeEvaluationService: {
    evaluateResume: (...args: unknown[]) => mockEvaluateResume(...args),
  },
}));

import useResumeEvaluation from "@tbe/hooks/useResumeEvaluation";

describe("useResumeEvaluation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParserState = {
      file: null,
      extractedSkills: [],
      handleFileUpload: mockHandleFileUpload,
      isLoading: false,
    };
  });

  it("requires a resume file before evaluating", async () => {
    const { result } = renderHook(() => useResumeEvaluation());

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(result.current.error).toBe("Please upload your resume");
    expect(mockEvaluateResume).not.toHaveBeenCalled();
  });

  it("requires at least one domain", async () => {
    mockParserState.file = new File(["a"], "resume.pdf");
    mockParserState.extractedSkills = ["React"];

    const { result } = renderHook(() => useResumeEvaluation());

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(result.current.error).toBe("Please select at least one domain");
  });

  it("rejects more than 2 selected domains", async () => {
    mockParserState.file = new File(["a"], "resume.pdf");
    mockParserState.extractedSkills = ["React"];

    const { result } = renderHook(() => useResumeEvaluation());

    act(() => {
      result.current.setSelectedDomains(["Frontend", "Backend", "DevOps"]);
    });

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(result.current.error).toBe("Please select maximum 2 domains");
  });

  it("requires an experience level", async () => {
    mockParserState.file = new File(["a"], "resume.pdf");
    mockParserState.extractedSkills = ["React"];

    const { result } = renderHook(() => useResumeEvaluation());

    act(() => {
      result.current.setSelectedDomains(["Frontend"]);
    });

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(result.current.error).toBe("Please select your experience level");
  });

  it("requires extracted skills from the resume", async () => {
    mockParserState.file = new File(["a"], "resume.pdf");
    mockParserState.extractedSkills = [];

    const { result } = renderHook(() => useResumeEvaluation());

    act(() => {
      result.current.setSelectedDomains(["Frontend"]);
      result.current.setSelectedExperience("0-2");
    });

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(result.current.error).toBe(
      "No skills found in resume. Please upload a valid resume.",
    );
  });

  it("evaluates the resume and stores the returned data on success", async () => {
    mockParserState.file = new File(["a"], "resume.pdf");
    mockParserState.extractedSkills = ["React", "Node"];
    mockEvaluateResume.mockResolvedValue({
      status: true,
      data: { score: 88, recommendations: [] },
    });

    const { result } = renderHook(() => useResumeEvaluation());

    act(() => {
      result.current.setSelectedDomains(["Frontend"]);
      result.current.setSelectedExperience("0-2");
    });

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(mockEvaluateResume).toHaveBeenCalledWith({
      resumeSkills: ["React", "Node"],
      domains: ["Frontend"],
      experienceLevel: "0-2",
    });
    expect(result.current.evaluationData).toEqual({
      score: 88,
      recommendations: [],
    });
    expect(result.current.error).toBe("");
    expect(result.current.isEvaluating).toBe(false);
  });

  it("surfaces the service error message when evaluation fails", async () => {
    mockParserState.file = new File(["a"], "resume.pdf");
    mockParserState.extractedSkills = ["React"];
    mockEvaluateResume.mockResolvedValue({
      status: false,
      message: "Evaluation service unavailable",
    });

    const { result } = renderHook(() => useResumeEvaluation());

    act(() => {
      result.current.setSelectedDomains(["Frontend"]);
      result.current.setSelectedExperience("0-2");
    });

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(result.current.error).toBe("Evaluation service unavailable");
    expect(result.current.evaluationData).toBeNull();
  });

  it("surfaces a thrown error's message", async () => {
    mockParserState.file = new File(["a"], "resume.pdf");
    mockParserState.extractedSkills = ["React"];
    mockEvaluateResume.mockRejectedValue(new Error("Network down"));

    const { result } = renderHook(() => useResumeEvaluation());

    act(() => {
      result.current.setSelectedDomains(["Frontend"]);
      result.current.setSelectedExperience("0-2");
    });

    await act(async () => {
      await result.current.handleResumeEvaluation();
    });

    expect(result.current.error).toBe("Network down");
    expect(result.current.isEvaluating).toBe(false);
  });
});
