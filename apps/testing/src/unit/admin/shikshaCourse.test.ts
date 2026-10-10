import { describe, expect, it } from "vitest";

import { shikshaCoursePaths } from "../../../../admin/src/api/shikshaCoursePaths";
import {
  COURSE_LIFECYCLE_STATUSES,
  extractCourseStatusErrorMessage,
  filterCoursesByStatus,
  formatLastUpdated,
  getChapterCount,
  getCourseStatus,
} from "../../../../admin/src/utils/shikshaCourse";

const buildCourse = (overrides: Record<string, unknown> = {}) =>
  ({
    _id: "course_1",
    name: "Course One",
    slug: "course-one",
    status: "PUBLISHED",
    roadmap: "Frontend",
    chapters: [{ _id: "chapter_1" }],
    updatedAt: "2024-05-01T10:00:00.000Z",
    ...overrides,
  }) as any;

describe("shikshaCoursePaths", () => {
  it("points at the shiksha course collection", () => {
    expect(shikshaCoursePaths.collection).toBe("/shiksha");
  });

  it("builds the course status route", () => {
    expect(shikshaCoursePaths.status("course_1")).toBe(
      "/shiksha/course_1/status",
    );
  });
});

describe("getCourseStatus", () => {
  it("returns the stored lifecycle status", () => {
    expect(getCourseStatus(buildCourse({ status: "DRAFT" }))).toBe("DRAFT");
  });

  it("treats a course without a status as published", () => {
    expect(getCourseStatus(buildCourse({ status: undefined }))).toBe(
      "PUBLISHED",
    );
  });
});

describe("getChapterCount", () => {
  it("counts the projected chapters", () => {
    expect(
      getChapterCount(buildCourse({ chapters: [{ _id: "a" }, { _id: "b" }] })),
    ).toBe(2);
  });

  it("returns zero when chapters are missing", () => {
    expect(getChapterCount(buildCourse({ chapters: undefined }))).toBe(0);
  });
});

describe("filterCoursesByStatus", () => {
  const courses = [
    buildCourse({ _id: "a", status: "DRAFT" }),
    buildCourse({ _id: "b", status: "PUBLISHED" }),
    buildCourse({ _id: "c", status: "ARCHIVED" }),
    buildCourse({ _id: "d", status: undefined }),
  ];

  it("returns every course for the all filter", () => {
    expect(filterCoursesByStatus(courses, "all")).toHaveLength(4);
  });

  it.each(COURSE_LIFECYCLE_STATUSES)("filters to %s courses", (status) => {
    const filtered = filterCoursesByStatus(courses, status);

    expect(filtered.every((course) => getCourseStatus(course) === status)).toBe(
      true,
    );
  });

  it("includes status-less courses under the published filter", () => {
    expect(
      filterCoursesByStatus(courses, "PUBLISHED").map((course) => course._id),
    ).toEqual(["b", "d"]);
  });
});

describe("formatLastUpdated", () => {
  it("falls back when the timestamp is missing", () => {
    expect(formatLastUpdated(undefined)).toBe("—");
  });

  it("falls back when the timestamp is unparsable", () => {
    expect(formatLastUpdated("not-a-date")).toBe("—");
  });

  it("formats a valid timestamp", () => {
    expect(formatLastUpdated("2024-05-01T10:00:00.000Z")).toBe(
      new Date("2024-05-01T10:00:00.000Z").toLocaleString(),
    );
  });
});

describe("extractCourseStatusErrorMessage", () => {
  it("surfaces the API rejection reason", () => {
    const error = {
      response: {
        data: { message: "Cannot publish a course with no chapters" },
      },
    };

    expect(extractCourseStatusErrorMessage(error, "Failed")).toBe(
      "Cannot publish a course with no chapters",
    );
  });

  it("falls back to the error field when no message is sent", () => {
    const error = { response: { data: { error: "Course not found" } } };

    expect(extractCourseStatusErrorMessage(error, "Failed")).toBe(
      "Course not found",
    );
  });

  it("falls back to the generic message", () => {
    expect(extractCourseStatusErrorMessage({}, "Failed to publish")).toBe(
      "Failed to publish",
    );
  });
});
