import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockTrackEvent = vi.fn();

vi.mock("@tbe/hooks/useTracking", () => ({
  default: () => ({ trackEvent: mockTrackEvent }),
}));

import useAnalytics from "@tbe/hooks/useAnalytics";

describe("useAnalytics (deprecated alias for useTracking)", () => {
  it("re-exports useTracking's return value", () => {
    const { result } = renderHook(() => useAnalytics());

    expect(result.current.trackEvent).toBe(mockTrackEvent);
  });
});
