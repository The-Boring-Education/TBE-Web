import { queryKeys } from "@tbe/query";
import { describe, expect, it } from "vitest";

describe("queryKeys", () => {
  describe("interviewPrep", () => {
    it("all returns base key", () => {
      expect(queryKeys.interviewPrep.all).toEqual(["interview-prep"]);
    });

    it("lists() extends all", () => {
      const key = queryKeys.interviewPrep.lists();
      expect(key).toEqual(["interview-prep", "list"]);
      expect(key.slice(0, 1)).toEqual(queryKeys.interviewPrep.all);
    });

    it("list(filters) appends filters", () => {
      const filters = { roadmap: "Frontend", topic: "React" };
      expect(queryKeys.interviewPrep.list(filters)).toEqual([
        "interview-prep",
        "list",
        filters,
      ]);
    });

    it("detail(slug) appends slug", () => {
      expect(queryKeys.interviewPrep.detail("js-basics")).toEqual([
        "interview-prep",
        "detail",
        "js-basics",
      ]);
    });

    it("sheet(slug, userId) appends both", () => {
      expect(queryKeys.interviewPrep.sheet("js-basics", "user-1")).toEqual([
        "interview-prep",
        "sheet",
        "js-basics",
        "user-1",
      ]);
    });
  });

  describe("aptitude", () => {
    it("topics() returns correct key", () => {
      expect(queryKeys.aptitude.topics()).toEqual(["aptitude", "topics"]);
    });

    it("questions(topic) includes topic and user placeholder", () => {
      expect(queryKeys.aptitude.questions("probability")).toEqual([
        "aptitude",
        "questions",
        "probability",
        "__no_user__",
      ]);
    });

    it("questions(topic, userId) scopes cache per user", () => {
      expect(queryKeys.aptitude.questions("probability", "u1")).toEqual([
        "aptitude",
        "questions",
        "probability",
        "u1",
      ]);
    });

    it("studyGuide(topic) includes topic", () => {
      expect(queryKeys.aptitude.studyGuide("algebra")).toEqual([
        "aptitude",
        "study-guide",
        "algebra",
      ]);
    });

    it("different topics produce different keys", () => {
      expect(queryKeys.aptitude.questions("algebra")).not.toEqual(
        queryKeys.aptitude.questions("probability"),
      );
    });
  });

  describe("dsa", () => {
    it("sheets() returns correct key", () => {
      expect(queryKeys.dsa.sheets()).toEqual(["dsa", "sheets"]);
    });

    it("questions(filters) appends filters", () => {
      expect(queryKeys.dsa.questions({ limit: 100 })).toEqual([
        "dsa",
        "questions",
        { limit: 100 },
      ]);
    });

    it("completedQuestions(userId) includes userId", () => {
      expect(queryKeys.dsa.completedQuestions("u1")).toEqual([
        "dsa",
        "completed",
        "u1",
      ]);
    });
  });

  describe("shiksha", () => {
    it("lists() returns correct key", () => {
      expect(queryKeys.shiksha.lists()).toEqual(["shiksha", "list"]);
    });

    it("detail(slug) includes slug", () => {
      expect(queryKeys.shiksha.detail("react-101")).toEqual([
        "shiksha",
        "detail",
        "react-101",
      ]);
    });
  });

  describe("projects", () => {
    it("lists() returns correct key", () => {
      expect(queryKeys.projects.lists()).toEqual(["projects", "list"]);
    });

    it("detail(slug) includes slug", () => {
      expect(queryKeys.projects.detail("todo-app")).toEqual([
        "projects",
        "detail",
        "todo-app",
      ]);
    });
  });

  describe("quiz", () => {
    it("categories() returns correct key", () => {
      expect(queryKeys.quiz.categories()).toEqual(["quiz", "categories"]);
    });

    it("performance(userId, timeRange) includes both params", () => {
      expect(queryKeys.quiz.performance("u1", "weekly")).toEqual([
        "quiz",
        "performance",
        "u1",
        "weekly",
      ]);
    });

    it("leaderboard(limit) includes limit", () => {
      expect(queryKeys.quiz.leaderboard(10)).toEqual([
        "quiz",
        "leaderboard",
        10,
      ]);
    });
  });

  describe("user", () => {
    it("current() returns correct key", () => {
      expect(queryKeys.user.current()).toEqual(["user", "current"]);
    });

    it("profile(id) includes id", () => {
      expect(queryKeys.user.profile("u1")).toEqual(["user", "profile", "u1"]);
    });
  });

  describe("gamification", () => {
    it("points(userId) includes userId", () => {
      expect(queryKeys.gamification.points("u1")).toEqual([
        "gamification",
        "points",
        "u1",
      ]);
    });

    it("leaderboard() returns correct key", () => {
      expect(queryKeys.gamification.leaderboard()).toEqual([
        "gamification",
        "leaderboard",
      ]);
    });
  });

  describe("prepYatra", () => {
    it("logs(userId) includes userId", () => {
      expect(queryKeys.prepYatra.logs("u1")).toEqual([
        "prep-yatra",
        "logs",
        "u1",
      ]);
    });

    it("stats(userId) includes userId", () => {
      expect(queryKeys.prepYatra.stats("u1")).toEqual([
        "prep-yatra",
        "stats",
        "u1",
      ]);
    });
  });

  describe("challenges", () => {
    it("lists() returns correct key", () => {
      expect(queryKeys.challenges.lists()).toEqual(["challenges", "list"]);
    });

    it("progress(userId) includes userId", () => {
      expect(queryKeys.challenges.progress("u1")).toEqual([
        "challenges",
        "progress",
        "u1",
      ]);
    });
  });

  describe("payment", () => {
    it("status(userId, productId) includes both", () => {
      expect(queryKeys.payment.status("u1", "product-1")).toEqual([
        "payment",
        "status",
        "u1",
        "product-1",
      ]);
    });
  });

  describe("onboarding", () => {
    it("status(userId) includes userId", () => {
      expect(queryKeys.onboarding.status("u1")).toEqual([
        "onboarding",
        "status",
        "u1",
      ]);
    });
  });

  describe("key hierarchy guarantees", () => {
    it("all domain.all keys are unique", () => {
      const allKeys = [
        queryKeys.interviewPrep.all,
        queryKeys.aptitude.all,
        queryKeys.dsa.all,
        queryKeys.shiksha.all,
        queryKeys.projects.all,
        queryKeys.quiz.all,
        queryKeys.user.all,
        queryKeys.gamification.all,
        queryKeys.prepYatra.all,
        queryKeys.resume.all,
        queryKeys.youfocus.all,
        queryKeys.payment.all,
        queryKeys.challenges.all,
        queryKeys.onboarding.all,
      ];
      const serialized = allKeys.map((k) => JSON.stringify(k));
      expect(new Set(serialized).size).toBe(serialized.length);
    });

    it("list keys start with their domain all key", () => {
      expect(queryKeys.shiksha.lists()[0]).toBe(queryKeys.shiksha.all[0]);
      expect(queryKeys.projects.lists()[0]).toBe(queryKeys.projects.all[0]);
      expect(queryKeys.challenges.lists()[0]).toBe(queryKeys.challenges.all[0]);
    });
  });
});
