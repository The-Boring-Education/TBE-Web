import { useCopyLink } from "@tbe/hooks";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("useCopyLink", () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    window.history.replaceState({}, "", "/interview-sheets/mock?question=test");

    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies current page URL when no link is provided", async () => {
    const onCopySuccess = vi.fn();
    const { result } = renderHook(() => useCopyLink({ onCopySuccess }));

    await act(async () => {
      const ok = await result.current.copyLink();
      expect(ok).toBe(true);
    });

    expect(writeTextMock).toHaveBeenCalledWith(window.location.href);
    expect(onCopySuccess).toHaveBeenCalledTimes(1);
    expect(result.current.copied).toBe(true);
  });

  it("copies the provided link", async () => {
    const { result } = renderHook(() => useCopyLink());

    await act(async () => {
      const ok = await result.current.copyLink("https://example.com/share");
      expect(ok).toBe(true);
    });

    expect(writeTextMock).toHaveBeenCalledWith("https://example.com/share");
  });

  it("resets copied state after configured timeout", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopyLink({ resetAfterMs: 500 }));

    await act(async () => {
      await result.current.copyLink("https://example.com/share");
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.copied).toBe(false);
  });

  it("returns false and calls onCopyError when copy fails", async () => {
    const failure = new Error("clipboard blocked");
    const onCopyError = vi.fn();

    writeTextMock = vi.fn().mockRejectedValue(failure);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useCopyLink({ onCopyError }));

    await act(async () => {
      const ok = await result.current.copyLink();
      expect(ok).toBe(false);
    });

    expect(onCopyError).toHaveBeenCalledWith(failure);
    expect(result.current.copied).toBe(false);
  });
});
