import { describe, expect, it } from "vitest";

import type { CourseBundle } from "@tbe/types";
import { validateCourseBundle } from "@tbe/utils/courseBundle";

const validBundle = () => ({
  schemaVersion: "shiksha-course@1",
  course: {
    slug: "learn-react",
    title: "Learn React",
    description: "A course on React fundamentals",
    coverImageURL: "https://cdn.theboringeducation.com/react.png",
    roadmap: "Frontend",
    difficulty: "Beginner",
    isPremium: false,
    features: ["Hands-on projects"],
    credits: [
      {
        githubHandle: "imsks",
        displayName: "Sachin",
        role: "AUTHOR",
      },
    ],
  },
  chapters: [
    {
      chapterKey: "introduction",
      title: "Introduction",
      content: "# Introduction\n\nWelcome.",
      isOptional: false,
      credits: [
        {
          githubHandle: "imsks",
          displayName: "Sachin",
          role: "EDITOR",
        },
      ],
    },
    {
      chapterKey: "components",
      title: "Components",
      content: "# Components",
      isOptional: true,
      credits: [
        {
          githubHandle: "imsks",
          displayName: "Sachin",
          role: "REVIEWER",
        },
      ],
    },
  ],
});

const errorFields = (input: unknown) => {
  const result = validateCourseBundle(input);
  if (result.valid) throw new Error("Expected bundle to be invalid");
  return result.errors.map((error) => error.field);
};

describe("validateCourseBundle", () => {
  it("accepts a valid bundle and returns it typed", () => {
    const bundle = validBundle();
    const result = validateCourseBundle(bundle);

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.bundle.course.slug).toBe("learn-react");
    expect(result.bundle.chapters).toHaveLength(2);
  });

  it("rejects non-object input", () => {
    expect(errorFields("not-a-bundle")).toEqual(["root"]);
    expect(errorFields(null)).toEqual(["root"]);
    expect(errorFields([])).toEqual(["root"]);
  });

  it("rejects a missing schema version", () => {
    const bundle = validBundle();
    delete (bundle as Record<string, unknown>).schemaVersion;

    expect(errorFields(bundle)).toContain("schemaVersion");
  });

  it("rejects an unknown schema version", () => {
    const bundle = { ...validBundle(), schemaVersion: "shiksha-course@2" };

    expect(errorFields(bundle)).toEqual(["schemaVersion"]);
  });

  it("names every missing required field", () => {
    const fields = errorFields({
      schemaVersion: "shiksha-course@1",
      course: {},
      chapters: [{}],
    });

    expect(fields).toEqual(
      expect.arrayContaining([
        "course.slug",
        "course.title",
        "course.description",
        "course.coverImageURL",
        "course.roadmap",
        "course.difficulty",
        "chapters[0].chapterKey",
        "chapters[0].title",
        "chapters[0].content",
      ]),
    );
  });

  it("rejects a malformed course slug", () => {
    const bundle = validBundle();
    bundle.course.slug = "Learn React!";

    expect(errorFields(bundle)).toEqual(["course.slug"]);
  });

  it("rejects a malformed chapter key", () => {
    const bundle = validBundle();
    bundle.chapters[0].chapterKey = "Intro Chapter";

    expect(errorFields(bundle)).toEqual(["chapters[0].chapterKey"]);
  });

  it("rejects duplicate chapter keys within one bundle", () => {
    const bundle = validBundle();
    bundle.chapters[1].chapterKey = bundle.chapters[0].chapterKey;

    const result = validateCourseBundle(bundle);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors).toEqual([
      {
        field: "chapters[1].chapterKey",
        message:
          'chapters[1].chapterKey "introduction" is duplicated in this bundle',
      },
    ]);
  });

  it("rejects a bundle with no chapters", () => {
    const bundle = { ...validBundle(), chapters: [] };

    expect(errorFields(bundle)).toEqual(["chapters"]);
  });

  it("rejects a missing chapters array", () => {
    const bundle = validBundle();
    delete (bundle as Record<string, unknown>).chapters;

    expect(errorFields(bundle)).toEqual(["chapters"]);
  });

  it("rejects an unknown roadmap", () => {
    const bundle = validBundle();
    bundle.course.roadmap = "Blockchain";

    expect(errorFields(bundle)).toEqual(["course.roadmap"]);
  });

  it("rejects an unknown difficulty", () => {
    const bundle = validBundle();
    bundle.course.difficulty = "Expert";

    expect(errorFields(bundle)).toEqual(["course.difficulty"]);
  });

  it("rejects an unknown credit role", () => {
    const bundle = validBundle();
    bundle.course.credits[0].role = "MAINTAINER";

    expect(errorFields(bundle)).toEqual(["course.credits[0].role"]);
  });

  it("rejects an invalid github handle on a chapter credit", () => {
    const bundle = validBundle();
    bundle.chapters[0].credits[0].githubHandle = "not a handle";

    expect(errorFields(bundle)).toEqual([
      "chapters[0].credits[0].githubHandle",
    ]);
  });

  it("rejects a premium course with no price", () => {
    const bundle = validBundle();
    bundle.course.isPremium = true;

    expect(errorFields(bundle)).toEqual(["course.price"]);
  });

  it("rejects a premium course priced at zero", () => {
    const bundle = { ...validBundle() };
    bundle.course = { ...bundle.course, isPremium: true, price: 0 } as never;

    expect(errorFields(bundle)).toEqual(["course.price"]);
  });

  it("accepts a premium course with a positive price", () => {
    const bundle = { ...validBundle() };
    bundle.course = { ...bundle.course, isPremium: true, price: 499 } as never;

    expect(validateCourseBundle(bundle).valid).toBe(true);
  });

  it("reports multiple independent problems in a single call", () => {
    const fields = errorFields({
      schemaVersion: "shiksha-course@9",
      course: {
        slug: "Bad Slug",
        title: "Course",
        description: "Description",
        coverImageURL: "https://cdn.example.com/cover.png",
        roadmap: "Blockchain",
        difficulty: "Expert",
        isPremium: true,
        credits: [{ githubHandle: "imsks", displayName: "S", role: "OWNER" }],
      },
      chapters: [
        { chapterKey: "intro", title: "Intro", content: "a" },
        { chapterKey: "intro", title: "Dup", content: "b" },
        { chapterKey: "Bad Key", content: "c" },
      ],
    });

    expect(fields).toEqual(
      expect.arrayContaining([
        "schemaVersion",
        "course.slug",
        "course.roadmap",
        "course.difficulty",
        "course.price",
        "course.credits[0].role",
        "chapters[1].chapterKey",
        "chapters[2].chapterKey",
        "chapters[2].title",
      ]),
    );
    expect(fields.length).toBeGreaterThanOrEqual(9);
  });

  it("does not model lifecycle status on the bundle type", () => {
    type CourseHasStatus = "status" extends keyof CourseBundle["course"]
      ? true
      : false;
    type CourseHasLifecycleStatus =
      "lifecycleStatus" extends keyof CourseBundle["course"] ? true : false;

    const courseHasStatus: CourseHasStatus = false;
    const courseHasLifecycleStatus: CourseHasLifecycleStatus = false;

    expect(courseHasStatus).toBe(false);
    expect(courseHasLifecycleStatus).toBe(false);
  });
});
