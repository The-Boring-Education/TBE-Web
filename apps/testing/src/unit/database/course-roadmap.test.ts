/**
 * Guards the shared roadmap vocabulary used by the Shiksha Course schema.
 */
import { ROADMAPS } from "@api/lib/constants";
import Course from "@api/lib/database/models/Shiksha/Course";
import { describe, expect, it } from "vitest";

const buildCourse = (roadmap: string) =>
  new Course({
    name: "Full-stack AI Engineering",
    slug: "full-stack-ai-engineering",
    coverImageURL: "https://cdn.theboringeducation.com/course.png",
    liveOn: new Date(),
    roadmap,
    difficultyLevel: "Beginner",
  });

describe("Course roadmap vocabulary", () => {
  it("includes AI, Data and GTM", () => {
    expect(ROADMAPS).toEqual(expect.arrayContaining(["AI", "Data", "GTM"]));
  });

  it("keeps the existing roadmap values", () => {
    expect(ROADMAPS).toEqual(
      expect.arrayContaining(["Frontend", "Backend", "Fullstack", "Tech"]),
    );
  });

  it("accepts a course for every roadmap value", () => {
    ROADMAPS.forEach((roadmap) => {
      const error = buildCourse(roadmap).validateSync();

      expect(error?.errors?.roadmap).toBeUndefined();
    });
  });

  it("rejects a roadmap outside the vocabulary", () => {
    const error = buildCourse("Blockchain").validateSync();

    expect(error?.errors?.roadmap).toBeDefined();
  });
});
