import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockToPng = vi.fn();
vi.mock("html-to-image", () => ({
  toPng: (...args: unknown[]) => mockToPng(...args),
}));

const mockUseUser = vi.fn();
vi.mock("@tbe/hooks/useUser", () => ({
  default: () => mockUseUser(),
}));

const mockTrackEvent = vi.fn();
vi.mock("@tbe/hooks/useAnalytics", () => ({
  default: () => ({ trackEvent: mockTrackEvent }),
}));

import useCertificate from "@tbe/hooks/useCertificate";

describe("useCertificate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when there is no logged-in user", async () => {
    mockUseUser.mockReturnValue({ user: null });
    const { result } = renderHook(() => useCertificate());

    await act(async () => {
      await result.current.handleDownload("dsa-sheet");
    });

    expect(mockToPng).not.toHaveBeenCalled();
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it("does nothing when the certificate ref is not attached", async () => {
    mockUseUser.mockReturnValue({ user: { name: "Ada Lovelace" } });
    const { result } = renderHook(() => useCertificate());

    // certificateRef.current is null until a component attaches it.
    await act(async () => {
      await result.current.handleDownload("dsa-sheet");
    });

    expect(mockToPng).not.toHaveBeenCalled();
  });

  it("tracks a download event and triggers a link click when the ref is attached", async () => {
    mockUseUser.mockReturnValue({ user: { name: "Ada Lovelace" } });
    mockToPng.mockResolvedValue("data:image/png;base64,xyz");

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useCertificate());
    Object.defineProperty(result.current.certificateRef, "current", {
      value: document.createElement("div"),
      writable: true,
    });

    await act(async () => {
      await result.current.handleDownload("dsa-sheet");
    });

    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CERTIFICATE_DOWNLOAD",
        category: "User",
        value: expect.objectContaining({
          user: "Ada Lovelace",
          certificate: "dsa-sheet",
        }),
      }),
    );
    expect(mockToPng).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it("throws a friendly error when image generation fails", async () => {
    mockUseUser.mockReturnValue({ user: { name: "Ada Lovelace" } });
    mockToPng.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useCertificate());
    Object.defineProperty(result.current.certificateRef, "current", {
      value: document.createElement("div"),
      writable: true,
    });

    await expect(result.current.handleDownload("dsa-sheet")).rejects.toThrow(
      "Failed to generate certificate. Please try again.",
    );
  });
});
