import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration test: Course lifecycle status — covers each read path for each
 * status (public vs admin), the publish preconditions and the published-slug
 * lock, all through the query layer with a mocked Mongoose model.
 */

/* ------------------------------------------------------------------ */
/*  Hoisted Mocks (must be hoisted above vi.mock)                      */
/* ------------------------------------------------------------------ */

const { mockFind, mockFindOne, mockFindById, mockFindByIdAndUpdate, models } =
  vi.hoisted(() => {
    const mockFindInner = vi.fn();
    const mockFindOneInner = vi.fn();
    const mockFindByIdInner = vi.fn();
    const mockFindByIdAndUpdateInner = vi.fn();

    (mockFindInner as any)._result = [];
    (mockFindOneInner as any)._result = null;
    (mockFindByIdInner as any)._result = null;
    (mockFindByIdAndUpdateInner as any)._result = null;

    const MockCourse = {
      find: (...args: any[]) => {
        mockFindInner(...args);
        return {
          select: () => ({
            exec: async () => (mockFindInner as any)._result,
          }),
        };
      },
      findOne: (...args: any[]) => {
        mockFindOneInner(...args);
        return (mockFindOneInner as any)._result;
      },
      findById: (...args: any[]) => {
        mockFindByIdInner(...args);
        return (mockFindByIdInner as any)._result;
      },
      findByIdAndUpdate: (...args: any[]) => {
        mockFindByIdAndUpdateInner(...args);
        return (mockFindByIdAndUpdateInner as any)._result;
      },
    };

    const MockUserCourse = {
      findOne: vi.fn().mockResolvedValue(null),
    };

    return {
      mockFind: mockFindInner,
      mockFindOne: mockFindOneInner,
      mockFindById: mockFindByIdInner,
      mockFindByIdAndUpdate: mockFindByIdAndUpdateInner,
      models: { Course: MockCourse, UserCourse: MockUserCourse },
    };
  });

vi.mock("@/lib/database/models", () => ({
  Course: models.Course,
  UserCourse: models.UserCourse,
}));

vi.mock("@/lib/database/queries/gamification", () => ({
  updateUserPointsInDB: vi.fn(),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import {
  getAllCourseFromDB,
  getCourseBySlugFromDB,
  getCourseBySlugWithUserFromDB,
  updateACourseInDB,
  updateCourseStatusInDB,
} from "@/lib/database/queries/shiksha";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const buildCourseDoc = (overrides: Record<string, any> = {}) => {
  const doc: any = {
    _id: "course_1",
    name: "Course One",
    slug: "course-one",
    description: "A course",
    coverImageURL: "https://cdn.tbe/cover.png",
    liveOn: new Date("2024-01-01"),
    roadmap: "Frontend",
    difficultyLevel: "Beginner",
    status: "PUBLISHED",
    chapters: [{ _id: "chapter_1", name: "Intro", content: "..." }],
    save: vi.fn(async () => doc),
    toObject: () => ({ ...doc }),
    ...overrides,
  };

  doc.chapters = (doc.chapters ?? []).map((chapter: any) => ({
    ...chapter,
    toObject: () => ({ ...chapter }),
  }));

  return doc;
};

/* ================================================================== */
/*  Tests                                                              */
/* ================================================================== */

describe("Course Lifecycle Status Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockFind as any)._result = [];
    (mockFindOne as any)._result = null;
    (mockFindById as any)._result = null;
    (mockFindByIdAndUpdate as any)._result = null;
  });

  describe("course list read path", () => {
    it("public read filters to PUBLISHED courses only", async () => {
      await getAllCourseFromDB();

      expect(mockFind).toHaveBeenCalledWith({ status: "PUBLISHED" });
    });

    it("admin read returns courses in every status", async () => {
      await getAllCourseFromDB({ includeAllStatuses: true });

      expect(mockFind).toHaveBeenCalledWith({});
    });
  });

  describe("slug read path", () => {
    it("public slug lookup filters to PUBLISHED", async () => {
      (mockFindOne as any)._result = Promise.resolve(buildCourseDoc());

      const { data } = await getCourseBySlugFromDB("course-one");

      expect(mockFindOne).toHaveBeenCalledWith({
        slug: "course-one",
        status: "PUBLISHED",
      });
      expect(data.slug).toBe("course-one");
    });

    it.each(["DRAFT", "ARCHIVED"])(
      "public slug lookup returns nothing for a %s course",
      async () => {
        // A non-PUBLISHED course does not match the public filter.
        (mockFindOne as any)._result = Promise.resolve(null);

        const { data, error } = await getCourseBySlugFromDB("course-one");

        expect(data).toBeUndefined();
        expect(error).toBe("Course not found");
      },
    );

    it("admin slug lookup is not status filtered", async () => {
      (mockFindOne as any)._result = Promise.resolve(
        buildCourseDoc({ status: "DRAFT" }),
      );

      const { data } = await getCourseBySlugFromDB("course-one", {
        includeAllStatuses: true,
      });

      expect(mockFindOne).toHaveBeenCalledWith({ slug: "course-one" });
      expect(data.status).toBe("DRAFT");
    });

    it("slug lookup with user data filters to PUBLISHED for public reads", async () => {
      (mockFindOne as any)._result = Promise.resolve(buildCourseDoc());

      await getCourseBySlugWithUserFromDB("course-one");

      expect(mockFindOne).toHaveBeenCalledWith({
        slug: "course-one",
        status: "PUBLISHED",
      });
    });

    it("slug lookup with user data returns every status for admin reads", async () => {
      (mockFindOne as any)._result = Promise.resolve(
        buildCourseDoc({ status: "ARCHIVED" }),
      );

      const { data } = await getCourseBySlugWithUserFromDB(
        "course-one",
        undefined,
        { includeAllStatuses: true },
      );

      expect(mockFindOne).toHaveBeenCalledWith({ slug: "course-one" });
      expect(data.status).toBe("ARCHIVED");
    });
  });

  describe("status transitions", () => {
    it("rejects an unknown status", async () => {
      const { error } = await updateCourseStatusInDB(
        "course_1",
        "LIVE" as never,
      );

      expect(error).toContain("Invalid course status");
      expect(mockFindById).not.toHaveBeenCalled();
    });

    it("rejects publishing a course with no chapters", async () => {
      (mockFindById as any)._result = Promise.resolve(
        buildCourseDoc({ status: "DRAFT", chapters: [] }),
      );

      const { error } = await updateCourseStatusInDB("course_1", "PUBLISHED");

      expect(error).toBe("Cannot publish a course with no chapters");
    });

    it("rejects publishing a course missing a required field, naming the field", async () => {
      (mockFindById as any)._result = Promise.resolve(
        buildCourseDoc({ status: "DRAFT", coverImageURL: "" }),
      );

      const { error } = await updateCourseStatusInDB("course_1", "PUBLISHED");

      expect(error).toBe("Cannot publish a course without coverImageURL");
    });

    it("publishes a course that satisfies every precondition", async () => {
      const course = buildCourseDoc({ status: "DRAFT" });
      (mockFindById as any)._result = Promise.resolve(course);

      const { data, error } = await updateCourseStatusInDB(
        "course_1",
        "PUBLISHED",
      );

      expect(error).toBeUndefined();
      expect(data.status).toBe("PUBLISHED");
      expect(course.save).toHaveBeenCalled();
    });

    it("archives a published course without publish preconditions", async () => {
      const course = buildCourseDoc({ chapters: [] });
      (mockFindById as any)._result = Promise.resolve(course);

      const { data, error } = await updateCourseStatusInDB(
        "course_1",
        "ARCHIVED",
      );

      expect(error).toBeUndefined();
      expect(data.status).toBe("ARCHIVED");
    });

    it("returns not found for a missing course", async () => {
      (mockFindById as any)._result = Promise.resolve(null);

      const { error } = await updateCourseStatusInDB("missing", "ARCHIVED");

      expect(error).toBe("Course not found");
    });
  });

  describe("slug lock", () => {
    it("rejects a slug change on a published course", async () => {
      (mockFindById as any)._result = Promise.resolve(buildCourseDoc());

      const { error } = await updateACourseInDB({
        courseId: "course_1",
        updatedData: { slug: "new-slug" } as never,
      });

      expect(error).toBe("Slug cannot be changed once the course is published");
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("allows other updates on a published course", async () => {
      const course = buildCourseDoc();
      (mockFindById as any)._result = Promise.resolve(course);
      (mockFindByIdAndUpdate as any)._result = Promise.resolve(course);

      const { error } = await updateACourseInDB({
        courseId: "course_1",
        updatedData: { description: "Updated" } as never,
      });

      expect(error).toBeUndefined();
      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
    });

    it("allows a slug change while the course is still a draft", async () => {
      const course = buildCourseDoc({ status: "DRAFT" });
      (mockFindById as any)._result = Promise.resolve(course);
      (mockFindByIdAndUpdate as any)._result = Promise.resolve(course);

      const { error } = await updateACourseInDB({
        courseId: "course_1",
        updatedData: { slug: "new-slug" } as never,
      });

      expect(error).toBeUndefined();
      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
