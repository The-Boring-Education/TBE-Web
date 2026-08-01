import { useInstallPrompt } from "@tbe/hooks/useInstallPrompt";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("useInstallPrompt", () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    vi.stubGlobal("matchMedia", matchMediaMock);
    delete (window as any).deferredBeforeInstallPrompt;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as any).deferredBeforeInstallPrompt;
  });

  it("is not installable by default", () => {
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.deferredPrompt).toBeNull();
  });

  it("stays uninstallable when already running standalone", () => {
    matchMediaMock.mockReturnValue({ matches: true });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstallable).toBe(false);
  });

  it("becomes installable on beforeinstallprompt and caches the event globally", () => {
    const { result } = renderHook(() => useInstallPrompt());

    const promptEvent = new Event("beforeinstallprompt");
    const preventDefaultSpy = vi.spyOn(promptEvent, "preventDefault");

    act(() => {
      window.dispatchEvent(promptEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(true);
    expect(result.current.deferredPrompt).toBe(promptEvent);
    expect((window as any).deferredBeforeInstallPrompt).toBe(promptEvent);
  });

  it("picks up an already-cached beforeinstallprompt event on mount", () => {
    const cachedEvent = new Event("beforeinstallprompt");
    (window as any).deferredBeforeInstallPrompt = cachedEvent;

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isInstallable).toBe(true);
    expect(result.current.deferredPrompt).toBe(cachedEvent);
  });

  it("resets state and clears the cached event on appinstalled", () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(new Event("beforeinstallprompt"));
    });
    expect(result.current.isInstallable).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.deferredPrompt).toBeNull();
    expect((window as any).deferredBeforeInstallPrompt).toBeUndefined();
  });
});
