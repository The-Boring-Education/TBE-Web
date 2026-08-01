import useResumeParser from "@tbe/hooks/usePDFFile";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

function createFile(
  name: string,
  type: string,
  sizeBytes: number = 1024,
): File {
  const file = new File(["a".repeat(sizeBytes)], name, { type });
  return file;
}

function createChangeEvent(file: File | null) {
  return {
    target: { files: file ? [file] : [] },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("useResumeParser (usePDFFile)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("starts with no file and no error", () => {
    const { result } = renderHook(() => useResumeParser());

    expect(result.current.file).toBeNull();
    expect(result.current.extractedSkills).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("does nothing when no file is selected", async () => {
    const { result } = renderHook(() => useResumeParser());

    await act(async () => {
      await result.current.handleFileUpload(createChangeEvent(null));
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.file).toBeNull();
  });

  it("rejects invalid file types", async () => {
    const { result } = renderHook(() => useResumeParser());
    const file = createFile("resume.png", "image/png");

    await act(async () => {
      await result.current.handleFileUpload(createChangeEvent(file));
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toBe(
      "Invalid file type. Please upload PDF or DOCX file.",
    );
  });

  it("rejects files larger than 5MB", async () => {
    const { result } = renderHook(() => useResumeParser());
    const file = createFile("resume.pdf", "application/pdf", 6 * 1024 * 1024);

    await act(async () => {
      await result.current.handleFileUpload(createChangeEvent(file));
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toBe("File too large. Maximum size is 5MB.");
  });

  it("parses a valid resume and extracts skills", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: { skills: ["React", "TypeScript"] },
      }),
    } as Response);

    const { result } = renderHook(() => useResumeParser());
    const file = createFile("resume.pdf", "application/pdf");

    await act(async () => {
      await result.current.handleFileUpload(createChangeEvent(file));
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/resume/parse",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.current.file).toBe(file);
    expect(result.current.extractedSkills).toEqual(["React", "TypeScript"]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error message when parsing fails (non-OK response)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Could not parse resume" }),
    } as Response);

    const { result } = renderHook(() => useResumeParser());
    const file = createFile("resume.pdf", "application/pdf");

    await act(async () => {
      await expect(result.current.parseResume(file)).rejects.toThrow(
        "Could not parse resume",
      );
    });

    expect(result.current.error).toBe("Could not parse resume");
    expect(result.current.isLoading).toBe(false);
  });

  it("reset() clears file, skills, and error state", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: { skills: ["React"] },
      }),
    } as Response);

    const { result } = renderHook(() => useResumeParser());
    const file = createFile("resume.pdf", "application/pdf");

    await act(async () => {
      await result.current.parseResume(file);
    });
    expect(result.current.file).toBe(file);

    act(() => {
      result.current.reset();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.extractedSkills).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
