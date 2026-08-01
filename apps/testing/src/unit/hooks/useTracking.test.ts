import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const routeChangeListeners = new Map<string, (url: string) => void>();
const mockRouterOn = vi.fn((event: string, listener: (url: string) => void) => {
  routeChangeListeners.set(event, listener);
});
const mockRouterOff = vi.fn((event: string) => {
  routeChangeListeners.delete(event);
});

vi.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/current-path",
    push: mockPush,
    events: {
      on: mockRouterOn,
      off: mockRouterOff,
    },
  }),
}));

const mockInitGA = vi.fn();
const mockInstallGlobalAnalyticsListeners = vi.fn();
const mockTrackEvent = vi.fn();
const mockTrackPageview = vi.fn();

vi.mock("@tbe/utils", () => ({
  initGA: (...args: unknown[]) => mockInitGA(...args),
  installGlobalAnalyticsListeners: (...args: unknown[]) =>
    mockInstallGlobalAnalyticsListeners(...args),
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  trackPageview: (...args: unknown[]) => mockTrackPageview(...args),
}));

vi.mock("@tbe/hooks/useAuthAnalytics", () => ({
  default: vi.fn(),
}));

import useTracking from "@tbe/hooks/useTracking";

describe("useTracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeChangeListeners.clear();
  });

  it("initializes GA and global listeners, and tracks the initial page view", () => {
    renderHook(() => useTracking());

    expect(mockInitGA).toHaveBeenCalledTimes(1);
    expect(mockInstallGlobalAnalyticsListeners).toHaveBeenCalledTimes(1);
    expect(mockTrackPageview).toHaveBeenCalledWith("/current-path");
  });

  it("subscribes to routeChangeComplete and tracks subsequent page views", () => {
    renderHook(() => useTracking());
    mockTrackPageview.mockClear();

    const listener = routeChangeListeners.get("routeChangeComplete");
    expect(listener).toBeDefined();
    listener?.("/new-page");

    expect(mockTrackPageview).toHaveBeenCalledWith("/new-page");
  });

  it("unsubscribes from routeChangeComplete on unmount", () => {
    const { unmount } = renderHook(() => useTracking());

    unmount();

    expect(mockRouterOff).toHaveBeenCalledWith(
      "routeChangeComplete",
      expect.any(Function),
    );
  });

  it("trackEvent forwards action/category/label/value to the GA helper", () => {
    const { result } = renderHook(() => useTracking());

    result.current.trackEvent({
      action: "CLICK",
      category: "Button",
      label: "Submit",
      value: 1,
    });

    expect(mockTrackEvent).toHaveBeenCalledWith("CLICK", {
      category: "Button",
      label: "Submit",
      value: 1,
    });
  });

  it("trackEvent omits undefined category/label/value and forwards extra props", () => {
    const { result } = renderHook(() => useTracking());

    result.current.trackEvent({ action: "PAGE_VIEW", extra: "meta" });

    expect(mockTrackEvent).toHaveBeenCalledWith("PAGE_VIEW", {
      extra: "meta",
    });
  });
});
