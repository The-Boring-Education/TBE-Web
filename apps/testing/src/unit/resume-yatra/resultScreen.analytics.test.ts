import { ANALYTICS_EVENTS } from "@tbe/constants";
import { trackEvent } from "@tbe/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/utils")>();
  return {
    ...actual,
    trackEvent: vi.fn(),
  };
});

/** Mirrors resume-yatra ResultScreen analytics contract. */
const trackResumeBuilderComplete = (score: number) => {
  trackEvent(ANALYTICS_EVENTS.RESUME_BUILDER_COMPLETE, { score });
};

const trackResumeShare = (score: number) => {
  trackEvent(ANALYTICS_EVENTS.RESUME_SHARE, { score });
};

describe("resume-yatra ResultScreen analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fires resume_builder_complete with score on result mount", () => {
    trackResumeBuilderComplete(85);

    expect(trackEvent).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.RESUME_BUILDER_COMPLETE,
      { score: 85 },
    );
  });

  it("fires resume_share with score when sharing", () => {
    trackResumeShare(85);

    expect(trackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.RESUME_SHARE, {
      score: 85,
    });
  });
});
