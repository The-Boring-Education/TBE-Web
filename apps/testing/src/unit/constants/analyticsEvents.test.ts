import {
  ANALYTICS_EVENTS,
  GROWTH_ANALYTICS_ACTIVATION_EVENTS,
  LEGACY_ANALYTICS_ACTIONS,
} from "@tbe/constants";
import { describe, expect, it } from "vitest";

describe("ANALYTICS_EVENTS registry", () => {
  it("has unique event name values", () => {
    const values = Object.values(ANALYTICS_EVENTS);
    expect(new Set(values).size).toBe(values.length);
  });

  it("uses snake_case for modern events", () => {
    expect(ANALYTICS_EVENTS.LOGIN_SUCCESS).toBe("LOGIN_SUCCESS");
    expect(ANALYTICS_EVENTS.USER_ACTIVATED).toBe("USER_ACTIVATED");
    expect(ANALYTICS_EVENTS.DSA_QUESTION_VIEW).toBe("DSA_QUESTION_VIEW");
    expect(ANALYTICS_EVENTS.RESUME_BUILDER_COMPLETE).toBe(
      "RESUME_BUILDER_COMPLETE",
    );
  });

  it("retains legacy SCREAMING_SNAKE actions for GA continuity", () => {
    expect(ANALYTICS_EVENTS.COURSE_ENROLL).toBe("COURSE_ENROLL");
    expect(ANALYTICS_EVENTS.LEVEL_UP).toBe("LEVEL_UP");
  });

  it("maps growth analytics activation events to signup and activation", () => {
    expect(GROWTH_ANALYTICS_ACTIVATION_EVENTS).toEqual([
      ANALYTICS_EVENTS.SIGNUP_SUCCESS,
      ANALYTICS_EVENTS.USER_ACTIVATED,
    ]);
  });

  it("includes all legacy actions in LEGACY_ANALYTICS_ACTIONS", () => {
    expect(LEGACY_ANALYTICS_ACTIONS).toContain(ANALYTICS_EVENTS.USER_LOGIN);
    expect(LEGACY_ANALYTICS_ACTIONS).toContain(
      ANALYTICS_EVENTS.EXTERNAL_LINK_CLICK,
    );
    expect(LEGACY_ANALYTICS_ACTIONS.length).toBeGreaterThanOrEqual(30);
  });
});
