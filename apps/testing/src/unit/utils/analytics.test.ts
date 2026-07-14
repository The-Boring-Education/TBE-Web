import { ANALYTICS_EVENTS } from "@tbe/constants";
import {
  clearAnalyticsUser,
  GA_TRACKING_ID,
  installGlobalAnalyticsListeners,
  readTbeAppIdFromEnv,
  resetDelegatedAnalyticsListenersForTesting,
  setAnalyticsUser,
  trackCourseView,
  trackEnrollClick,
  trackEvent,
  trackLoginSuccess,
  trackLogout,
  trackPageView,
  trackQuizAnswer,
  trackQuizComplete,
  trackQuizScore,
  trackQuizStart,
  trackSignupSuccess,
  trackUserActivated,
} from "@tbe/utils/analytics";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Analytics Utilities", () => {
  let mockGtag: ReturnType<typeof vi.fn>;
  let originalWindow: typeof global.window;

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_TBE_APP_ID", "test-suite-app");

    originalWindow = global.window;
    mockGtag = vi.fn();

    global.window = Object.assign(originalWindow, {
      gtag: mockGtag,
      location: {
        ...originalWindow.location,
        pathname: "/unit-test",
        search: "",
        host: "localhost",
        href: "http://localhost/unit-test",
      },
    }) as typeof global.window;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetDelegatedAnalyticsListenersForTesting();
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  describe("readTbeAppIdFromEnv", () => {
    it("reads NEXT_PUBLIC_TBE_APP_ID", () => {
      expect(readTbeAppIdFromEnv()).toBe("test-suite-app");
    });
  });

  describe("trackPageView", () => {
    it("no-ops when measurement id env is unavailable (Vitest stubs process.env)", () => {
      trackPageView("/test-page");

      if (GA_TRACKING_ID.trim() !== "") {
        expect(mockGtag).toHaveBeenCalledWith("config", GA_TRACKING_ID, {
          page_path: "/test-page",
        });
      } else {
        expect(mockGtag).not.toHaveBeenCalled();
      }
    });

    it("should not track if gtag is not available", () => {
      delete (global.window as { gtag?: unknown }).gtag;

      trackPageView("/test-page");

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it("should not track in server environment", () => {
      const restored = global.window;
      delete (global as { window?: unknown }).window;

      trackPageView("/test-page");

      expect(mockGtag).not.toHaveBeenCalled();

      global.window = restored;
    });
  });

  describe("trackEvent", () => {
    it("should track event with enrichment (page_path, app_id)", () => {
      trackEvent(ANALYTICS_EVENTS.UI_CLICK, {
        element_id: "hero-cta",
        click_label: "Start",
      });

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "UI_CLICK",
        expect.objectContaining({
          click_label: "Start",
          element_id: "hero-cta",
          app_id: "test-suite-app",
          page_path: "/unit-test",
        }),
      );
    });

    it("supports omit_auto_context for raw payloads", () => {
      trackEvent("minimal", { omit_auto_context: true, k: "v" });

      expect(mockGtag).toHaveBeenCalledWith("event", "minimal", {
        k: "v",
      });
    });

    it("should track empty user params with enrichment defaults", () => {
      trackEvent("custom_event");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "custom_event",
        expect.objectContaining({
          app_id: "test-suite-app",
          page_path: "/unit-test",
        }),
      );
    });

    it("should not track if gtag is not available", () => {
      delete (global.window as { gtag?: unknown }).gtag;

      trackEvent("test_event");

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe("Quiz Events", () => {
    it("should track quiz start", () => {
      trackQuizStart("quiz-123");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "QUIZ_START",
        expect.objectContaining({
          quiz_id: "quiz-123",
          app_id: "test-suite-app",
          page_path: "/unit-test",
        }),
      );
    });

    it("should track quiz answer", () => {
      trackQuizAnswer("quiz-123", "question-456", true);

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "QUIZ_QUESTION_ANSWERED",
        expect.objectContaining({
          quiz_id: "quiz-123",
          question_id: "question-456",
          correct: true,
        }),
      );
    });

    it("should track quiz complete", () => {
      trackQuizComplete("quiz-123");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "QUIZ_COMPLETE",
        expect.objectContaining({
          quiz_id: "quiz-123",
        }),
      );
    });

    it("should track quiz score", () => {
      trackQuizScore("quiz-123", 85);

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "QUIZ_SCORE",
        expect.objectContaining({
          quiz_id: "quiz-123",
          score: 85,
        }),
      );
    });
  });

  describe("Course Events", () => {
    it("should track course view", () => {
      trackCourseView("course-123");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "COURSE_VIEW",
        expect.objectContaining({
          course_id: "course-123",
        }),
      );
    });

    it("should track enroll click", () => {
      trackEnrollClick("course-123");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "ENROLL_CLICK",
        expect.objectContaining({
          course_id: "course-123",
        }),
      );
    });
  });

  describe("User Events", () => {
    it("should track login success", () => {
      trackLoginSuccess("user-123");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "LOGIN_SUCCESS",
        expect.objectContaining({
          user_id: "user-123",
        }),
      );
    });

    it("should track signup success", () => {
      trackSignupSuccess("user-123");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "SIGNUP_SUCCESS",
        expect.objectContaining({
          user_id: "user-123",
        }),
      );
    });

    it("should track logout", () => {
      trackLogout("user-123");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "LOGOUT",
        expect.objectContaining({
          user_id: "user-123",
        }),
      );
    });

    it("should track user activated", () => {
      trackUserActivated("user-123", "platform");

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "USER_ACTIVATED",
        expect.objectContaining({
          user_id: "user-123",
          product_id: "platform",
        }),
      );
    });
  });

  describe("User identity", () => {
    it("setAnalyticsUser configures GA4 user_id", () => {
      setAnalyticsUser("user-123");

      if (GA_TRACKING_ID.trim() !== "") {
        expect(mockGtag).toHaveBeenCalledWith("config", GA_TRACKING_ID, {
          user_id: "user-123",
        });
      }
    });

    it("clearAnalyticsUser clears GA4 user_id", () => {
      clearAnalyticsUser();

      if (GA_TRACKING_ID.trim() !== "") {
        expect(mockGtag).toHaveBeenCalledWith("config", GA_TRACKING_ID, {
          user_id: undefined,
        });
      }
    });
  });

  describe("installGlobalAnalyticsListeners (delegated ui_click)", () => {
    afterEach(() => {
      resetDelegatedAnalyticsListenersForTesting();
      document.body.replaceChildren();
    });

    beforeEach(() => {
      mockGtag.mockClear();
      resetDelegatedAnalyticsListenersForTesting();
      installGlobalAnalyticsListeners({ appId: "delegated-demo" });
    });

    const dispatchInnerButtonClick = (btn: HTMLElement) => {
      const inner = btn.querySelector("span");
      expect(inner).toBeTruthy();
      inner!.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    };

    it("resolves BUTTON from child element (delegated nearest interactive)", () => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "save-profile";
      btn.innerHTML = "<span>Save</span>";
      document.body.appendChild(btn);

      dispatchInnerButtonClick(btn);

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "UI_CLICK",
        expect.objectContaining({
          element_tag: "button",
          element_id: "save-profile",
          click_label: "Save",
          app_id: "delegated-demo",
        }),
      );
    });

    it("honours data-tbe-analytics-skip-global", () => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-tbe-analytics-skip-global", "");
      btn.innerHTML = "<span>Skip me</span>";
      document.body.appendChild(btn);

      dispatchInnerButtonClick(btn);

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it("is idempotent across repeated installs (no stacked listeners)", () => {
      installGlobalAnalyticsListeners({ appId: "delegated-demo" });

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Once";
      document.body.appendChild(btn);

      btn.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );

      expect(mockGtag).toHaveBeenCalledTimes(1);
    });

    it("emits ui_form_submit on delegated form submit capture", () => {
      mockGtag.mockClear();
      const form = document.createElement("form");
      form.setAttribute("name", "signup");
      form.innerHTML = '<input type="text" /><button type="submit">Go</button>';
      document.body.appendChild(form);

      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "UI_FORM_SUBMIT",
        expect.objectContaining({
          form_name: "signup",
          interaction_type: "form_submit",
        }),
      );
    });
  });
});
