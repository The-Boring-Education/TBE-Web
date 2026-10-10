/**
 * Course Bundle Import / Export (integration).
 *
 * Import is identity-preserving: chapters are reconciled by Chapter Key and
 * updated in place so learner progress — which references the embedded
 * chapter `_id` — survives a re-import. Import never deletes a chapter and
 * never touches an existing course's lifecycle status. A dry run produces the
 * identical report without writing anything.
 */
import { Course, UserCourse } from "@api/lib/database/models";
import {
  exportCourseBundleFromDB,
  importCourseBundleToDB,
} from "@api/lib/database/queries/courseBundle";
import type { CourseBundle, CourseBundleImportReport } from "@tbe/types";
import { validateCourseBundle } from "@tbe/utils";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const SLUG = "react-basics";

const bundleFixture = (
  overrides: Partial<CourseBundle["course"]> = {},
  chapters?: CourseBundle["chapters"],
): CourseBundle => ({
  schemaVersion: "shiksha-course@1",
  course: {
    slug: SLUG,
    title: "React Basics",
    description: "Learn React from scratch",
    coverImageURL: "https://example.com/cover.png",
    roadmap: "Frontend",
    difficulty: "Beginner",
    ...overrides,
  },
  chapters: chapters ?? [
    { chapterKey: "intro", title: "Intro", content: "## Intro" },
    { chapterKey: "jsx", title: "JSX", content: "## JSX" },
  ],
});

const importBundle = async (bundle: CourseBundle, dryRun = false) => {
  const { data, error } = await importCourseBundleToDB({ bundle, dryRun });
  expect(error).toBeUndefined();
  return data as CourseBundleImportReport;
};

const chapterIdsByKey = async () => {
  const course = await Course.findOne({ slug: SLUG });
  return new Map(
    (course?.chapters ?? []).map((chapter) => [
      chapter.key,
      chapter._id.toString(),
    ]),
  );
};

describe("Course Bundle Import / Export (integration)", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri("course_bundle"));
  }, 180_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  }, 30_000);

  beforeEach(async () => {
    await Course.deleteMany({});
    await UserCourse.deleteMany({});
  });

  it("creates an unknown slug as a Draft", async () => {
    const report = await importBundle(bundleFixture());

    expect(report.course).toBe("CREATED");
    expect(report.chaptersAdded).toEqual(["intro", "jsx"]);
    expect(report.chaptersUpdated).toEqual([]);
    expect(report.chaptersOrphaned).toEqual([]);

    const course = await Course.findOne({ slug: SLUG });
    expect(course?.status).toBe("DRAFT");
    expect(course?.chapters.map((chapter) => chapter.key)).toEqual([
      "intro",
      "jsx",
    ]);
  });

  it("writes nothing and reports no changes when re-importing an unchanged bundle", async () => {
    await importBundle(bundleFixture());

    const before = await Course.findOne({ slug: SLUG });
    const updatedAtBefore = before?.updatedAt;

    const report = await importBundle(bundleFixture());

    expect(report.course).toBe("UNCHANGED");
    expect(report.chaptersAdded).toEqual([]);
    expect(report.chaptersUpdated).toEqual([]);
    expect(report.chaptersReordered).toEqual([]);

    const after = await Course.findOne({ slug: SLUG });
    expect(after?.updatedAt).toEqual(updatedAtBefore);
  });

  it("preserves a chapter's storage id when its title and content change", async () => {
    await importBundle(bundleFixture());
    const idsBefore = await chapterIdsByKey();

    const report = await importBundle(
      bundleFixture({}, [
        { chapterKey: "intro", title: "Introduction", content: "## New" },
        { chapterKey: "jsx", title: "JSX", content: "## JSX" },
      ]),
    );

    expect(report.chaptersUpdated).toEqual(["intro"]);

    const idsAfter = await chapterIdsByKey();
    expect(idsAfter.get("intro")).toBe(idsBefore.get("intro"));
    expect(idsAfter.get("jsx")).toBe(idsBefore.get("jsx"));

    const course = await Course.findOne({ slug: SLUG });
    const intro = course?.chapters.find((chapter) => chapter.key === "intro");
    expect(intro?.name).toBe("Introduction");
    expect(intro?.content).toBe("## New");
  });

  it("keeps a learner's completions, including the course-level flag, after a re-import", async () => {
    await importBundle(bundleFixture());

    const course = await Course.findOne({ slug: SLUG });
    const userId = new mongoose.Types.ObjectId();

    await UserCourse.create({
      userId,
      courseId: course!._id,
      chapters: course!.chapters.map((chapter) => ({
        chapterId: chapter._id,
        isCompleted: true,
      })),
      isCompleted: true,
      certificateId: "cert-1",
    });

    await importBundle(
      bundleFixture({ title: "React Basics v2" }, [
        { chapterKey: "intro", title: "Introduction", content: "## Rewritten" },
        { chapterKey: "jsx", title: "JSX", content: "## JSX" },
        { chapterKey: "hooks", title: "Hooks", content: "## Hooks" },
      ]),
    );

    const reloaded = await Course.findOne({ slug: SLUG });
    const progress = await UserCourse.findOne({ userId });

    const completedIds = new Set(
      (progress?.chapters ?? [])
        .filter((chapter) => chapter.isCompleted)
        .map((chapter) => chapter.chapterId.toString()),
    );

    for (const key of ["intro", "jsx"]) {
      const chapter = reloaded?.chapters.find((item) => item.key === key);
      expect(completedIds.has(chapter!._id.toString())).toBe(true);
    }

    expect(progress?.isCompleted).toBe(true);
    expect(progress?.certificateId).toBe("cert-1");
  });

  it("appends a new chapter key without disturbing existing chapters", async () => {
    await importBundle(bundleFixture());
    const idsBefore = await chapterIdsByKey();

    const report = await importBundle(
      bundleFixture({}, [
        { chapterKey: "intro", title: "Intro", content: "## Intro" },
        { chapterKey: "jsx", title: "JSX", content: "## JSX" },
        { chapterKey: "hooks", title: "Hooks", content: "## Hooks" },
      ]),
    );

    expect(report.chaptersAdded).toEqual(["hooks"]);
    expect(report.chaptersUpdated).toEqual([]);
    expect(report.chaptersReordered).toEqual([]);

    const idsAfter = await chapterIdsByKey();
    expect(idsAfter.get("intro")).toBe(idsBefore.get("intro"));
    expect(idsAfter.get("jsx")).toBe(idsBefore.get("jsx"));
    expect(idsAfter.get("hooks")).toBeDefined();
  });

  it("reports a chapter missing from the bundle as orphaned and keeps it", async () => {
    await importBundle(bundleFixture());

    const report = await importBundle(
      bundleFixture({}, [
        { chapterKey: "intro", title: "Intro", content: "## Intro" },
      ]),
    );

    expect(report.chaptersOrphaned).toEqual(["jsx"]);

    const course = await Course.findOne({ slug: SLUG });
    expect(course?.chapters.map((chapter) => chapter.key)).toContain("jsx");
  });

  it("reorders chapters without re-creating them", async () => {
    await importBundle(bundleFixture());
    const idsBefore = await chapterIdsByKey();

    const report = await importBundle(
      bundleFixture({}, [
        { chapterKey: "jsx", title: "JSX", content: "## JSX" },
        { chapterKey: "intro", title: "Intro", content: "## Intro" },
      ]),
    );

    expect(report.chaptersReordered).toEqual(["jsx", "intro"]);
    expect(report.chaptersUpdated).toEqual([]);

    const course = await Course.findOne({ slug: SLUG });
    expect(course?.chapters.map((chapter) => chapter.key)).toEqual([
      "jsx",
      "intro",
    ]);

    const idsAfter = await chapterIdsByKey();
    expect(idsAfter.get("intro")).toBe(idsBefore.get("intro"));
    expect(idsAfter.get("jsx")).toBe(idsBefore.get("jsx"));
  });

  it("returns the same report as the real run and writes nothing on a dry run", async () => {
    await importBundle(bundleFixture());

    const changed = bundleFixture({ title: "React Basics v2" }, [
      { chapterKey: "jsx", title: "JSX", content: "## JSX" },
      { chapterKey: "hooks", title: "Hooks", content: "## Hooks" },
    ]);

    const dryReport = await importBundle(changed, true);

    const untouched = await Course.findOne({ slug: SLUG });
    expect(untouched?.name).toBe("React Basics");
    expect(untouched?.chapters.map((chapter) => chapter.key)).toEqual([
      "intro",
      "jsx",
    ]);

    const realReport = await importBundle(changed);

    expect({ ...dryReport, dryRun: false }).toEqual(realReport);
  });

  it("returns a create dry run without writing the course", async () => {
    const report = await importBundle(bundleFixture(), true);

    expect(report.course).toBe("CREATED");
    expect(report.courseId).toBeNull();
    expect(await Course.countDocuments({ slug: SLUG })).toBe(0);
  });

  it("never changes an existing course's lifecycle status", async () => {
    await importBundle(bundleFixture());
    await Course.updateOne({ slug: SLUG }, { status: "PUBLISHED" });

    await importBundle(bundleFixture({ title: "React Basics v2" }));

    const course = await Course.findOne({ slug: SLUG });
    expect(course?.status).toBe("PUBLISHED");
  });

  it("exports a course as a valid bundle that re-imports as a no-op", async () => {
    await importBundle(
      bundleFixture({
        meta: "React course",
        isPremium: true,
        price: 499,
        features: ["Certificate"],
      }),
    );

    const { data: exported, error } = await exportCourseBundleFromDB(SLUG);
    expect(error).toBeUndefined();

    const validation = validateCourseBundle(exported);
    expect(validation.valid).toBe(true);

    const report = await importBundle(exported as CourseBundle);

    expect(report.course).toBe("UNCHANGED");
    expect(report.chaptersAdded).toEqual([]);
    expect(report.chaptersUpdated).toEqual([]);
    expect(report.chaptersReordered).toEqual([]);
    expect(report.chaptersOrphaned).toEqual([]);
  });

  it("reports a missing course on export", async () => {
    const { data, error } = await exportCourseBundleFromDB("unknown-course");

    expect(data).toBeUndefined();
    expect(error).toBe("Course not found");
  });
});
