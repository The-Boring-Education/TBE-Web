import { describe, expect, it } from "vitest";

import {
  classifyPointAction,
  isLearningAction,
  POINT_ACTION_CLASS,
  POINTS_RULES,
} from "@tbe/constants";

describe("Action Classification", () => {
  it("classifies every points rule exactly once", () => {
    expect(Object.keys(POINT_ACTION_CLASS).sort()).toEqual(
      Object.keys(POINTS_RULES).sort(),
    );
  });

  it("treats question/chapter/quiz completion as BASE learning", () => {
    expect(classifyPointAction("COMPLETE_QUESTION")).toBe("BASE");
    expect(classifyPointAction("COMPLETE_COURSE_CHAPTER")).toBe("BASE");
    expect(classifyPointAction("COMPLETE_QUIZ")).toBe("BASE");
  });

  it("treats derived completions as BONUS learning", () => {
    expect(classifyPointAction("QUIZ_PERFECT_SCORE")).toBe("BONUS");
    expect(classifyPointAction("COMPLETE_INTERVIEW_SHEET")).toBe("BONUS");
    expect(classifyPointAction("COMPLETE_PROJECT")).toBe("BONUS");
  });

  it("keeps enrolments, visits and streak bonuses off the leaderboard", () => {
    for (const action of [
      "ENROLL_COURSE",
      "DAILY_VISIT",
      "FIRST_LOGIN",
      "PREPLOG_STREAK_7",
      "QUIZ_STREAK",
      "SOCIAL_SHARE",
    ]) {
      expect(isLearningAction(action)).toBe(false);
    }
  });

  it("never lets an unknown action type reach a leaderboard", () => {
    expect(classifyPointAction("SOMETHING_NEW")).toBe("ENGAGEMENT");
  });
});
