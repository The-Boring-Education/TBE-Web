import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  trackPageView,
  trackEvent,
  trackQuizStart,
  trackQuizAnswer,
  trackQuizComplete,
  trackQuizScore,
  trackCourseView,
  trackEnrollClick,
  trackLoginSuccess,
  trackSignupSuccess,
  trackLogout,
} from "@tbe/utils/analytics";

describe("Analytics Utilities", () => {
  let mockGtag: any;
  let originalWindow: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    // Mock window object with gtag
    originalWindow = global.window;
    mockGtag = vi.fn();

    global.window = {
      ...originalWindow,
      gtag: mockGtag,
    } as any;

    // Suppress console.log for analytics tracking
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  describe("trackPageView", () => {
    it("should track page view", () => {
      trackPageView("/test-page");

      expect(mockGtag).toHaveBeenCalledWith("config", "G-SR3M17B588", {
        page_path: "/test-page",
      });
    });

    it("should not track if gtag is not available", () => {
      delete (global.window as any).gtag;

      trackPageView("/test-page");

      // Should not throw error
      expect(true).toBe(true);
    });

    it("should not track in server environment", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      trackPageView("/test-page");

      // Should not throw error
      expect(true).toBe(true);

      global.window = originalWindow;
    });
  });

  describe("trackEvent", () => {
    it("should track event with name and params", () => {
      trackEvent("button_click", { button_id: "test-btn" });

      expect(mockGtag).toHaveBeenCalledWith("event", "button_click", {
        button_id: "test-btn",
      });
    });

    it("should track event with empty params", () => {
      trackEvent("custom_event");

      expect(mockGtag).toHaveBeenCalledWith("event", "custom_event", {});
    });

    it("should not track if gtag is not available", () => {
      delete (global.window as any).gtag;

      trackEvent("test_event");

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe("Quiz Events", () => {
    it("should track quiz start", () => {
      trackQuizStart("quiz-123");

      expect(mockGtag).toHaveBeenCalledWith("event", "quiz_start", {
        quiz_id: "quiz-123",
      });
    });

    it("should track quiz answer", () => {
      trackQuizAnswer("quiz-123", "question-456", true);

      expect(mockGtag).toHaveBeenCalledWith("event", "quiz_question_answered", {
        quiz_id: "quiz-123",
        question_id: "question-456",
        correct: true,
      });
    });

    it("should track quiz complete", () => {
      trackQuizComplete("quiz-123");

      expect(mockGtag).toHaveBeenCalledWith("event", "quiz_complete", {
        quiz_id: "quiz-123",
      });
    });

    it("should track quiz score", () => {
      trackQuizScore("quiz-123", 85);

      expect(mockGtag).toHaveBeenCalledWith("event", "quiz_score", {
        quiz_id: "quiz-123",
        score: 85,
      });
    });
  });

  describe("Course Events", () => {
    it("should track course view", () => {
      trackCourseView("course-123");

      expect(mockGtag).toHaveBeenCalledWith("event", "course_view", {
        course_id: "course-123",
      });
    });

    it("should track enroll click", () => {
      trackEnrollClick("course-123");

      expect(mockGtag).toHaveBeenCalledWith("event", "enroll_click", {
        course_id: "course-123",
      });
    });
  });

  describe("User Events", () => {
    it("should track login success", () => {
      trackLoginSuccess("user-123");

      expect(mockGtag).toHaveBeenCalledWith("event", "login_success", {
        user_id: "user-123",
      });
    });

    it("should track signup success", () => {
      trackSignupSuccess("user-123");

      expect(mockGtag).toHaveBeenCalledWith("event", "signup_success", {
        user_id: "user-123",
      });
    });

    it("should track logout", () => {
      trackLogout("user-123");

      expect(mockGtag).toHaveBeenCalledWith("event", "logout", {
        user_id: "user-123",
      });
    });
  });
});
