import {
  buildDelegatedInteractiveAnalyticsDOMProps,
  TBE_ANALYTICS_ATTR_ID,
  TBE_ANALYTICS_ATTR_LABEL,
  TBE_ANALYTICS_ATTR_MARKER,
  TBE_ANALYTICS_ATTR_SKIP_GLOBAL,
  TBE_ANALYTICS_ATTR_SURFACE,
} from "@tbe/utils";
import { describe, expect, it } from "vitest";

describe("buildDelegatedInteractiveAnalyticsDOMProps", () => {
  it("returns empty object when nothing set", () => {
    expect(buildDelegatedInteractiveAnalyticsDOMProps({})).toEqual({});
  });

  it("maps suppressed clicks", () => {
    expect(
      buildDelegatedInteractiveAnalyticsDOMProps({
        suppressGlobalUiClick: true,
      }),
    ).toEqual({ [TBE_ANALYTICS_ATTR_SKIP_GLOBAL]: "" });
  });

  it("maps id, label, surface, marker", () => {
    expect(
      buildDelegatedInteractiveAnalyticsDOMProps({
        analyticsId: "  hero_primary  ",
        analyticsLabel: "  Get started  ",
        analyticsSurface: " course_hero ",
        analyticsMarker: true,
      }),
    ).toEqual({
      [TBE_ANALYTICS_ATTR_ID]: "hero_primary",
      [TBE_ANALYTICS_ATTR_LABEL]: "Get started",
      [TBE_ANALYTICS_ATTR_SURFACE]: "course_hero",
      [TBE_ANALYTICS_ATTR_MARKER]: "",
    });
  });

  it("truncates long strings at 120 characters plus ellipsis suffix", () => {
    const longLabel = "x".repeat(125);
    const result = buildDelegatedInteractiveAnalyticsDOMProps({
      analyticsLabel: longLabel,
    });
    expect(result[TBE_ANALYTICS_ATTR_LABEL]).toHaveLength(121);
    expect(result[TBE_ANALYTICS_ATTR_LABEL]).toContain("…");
  });
});
