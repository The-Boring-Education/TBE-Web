import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUserCourseFind = vi.fn();

vi.mock("../../../../api/src/lib/database/models", () => ({
  Course: {
    findById: vi.fn(),
    find: vi.fn(),
  },
  UserCourse: {
    find: (...args: unknown[]) => mockUserCourseFind(...args),
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../../../api/src/lib/database/queries/gamification", () => ({
  updateUserPointsInDB: vi.fn(),
}));

import { getAllEnrolledCoursesFromDB } from "../../../../api/src/lib/database/queries/shiksha";

describe("getAllEnrolledCoursesFromDB", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates progress correctly against current course chapters", async () => {
    const courseMock = {
      _id: "course-123",
      name: "React Mastery",
      slug: "react-mastery",
      chapters: [
        { _id: "ch-1" },
        { _id: "ch-2" },
        { _id: "ch-3" },
        { _id: "ch-4" },
      ],
      toObject: () => ({
        _id: "course-123",
        name: "React Mastery",
        slug: "react-mastery",
      }),
    };

    const userCourseMock = {
      userId: "user-1",
      courseId: "course-123",
      course: courseMock,
      chapters: [
        { chapterId: "ch-1", isCompleted: true },
        { chapterId: "ch-2", isCompleted: true },
        { chapterId: "ch-3", isCompleted: false },
        { chapterId: "ch-4", isCompleted: false },
      ],
    };

    const mockExec = vi.fn().mockResolvedValue([userCourseMock]);
    const mockPopulate = vi.fn().mockReturnValue({ exec: mockExec });
    mockUserCourseFind.mockReturnValue({ populate: mockPopulate });

    const result = await getAllEnrolledCoursesFromDB("user-1");

    expect(result.error).toBeUndefined();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      _id: "course-123",
      name: "React Mastery",
      title: "React Mastery",
      isEnrolled: true,
      progress: {
        completed: 2,
        total: 4,
        percentage: 50,
      },
    });
  });

  it("ignores deleted chapters from completion counts and total", async () => {
    const courseMock = {
      _id: "course-123",
      name: "JS Basics",
      slug: "js-basics",
      chapters: [{ _id: "ch-1" }, { _id: "ch-2" }],
      toObject: () => ({
        _id: "course-123",
        name: "JS Basics",
        slug: "js-basics",
      }),
    };

    const userCourseMock = {
      userId: "user-1",
      courseId: "course-123",
      course: courseMock,
      chapters: [
        { chapterId: "ch-1", isCompleted: true },
        { chapterId: "ch-deleted", isCompleted: true },
      ],
    };

    const mockExec = vi.fn().mockResolvedValue([userCourseMock]);
    const mockPopulate = vi.fn().mockReturnValue({ exec: mockExec });
    mockUserCourseFind.mockReturnValue({ populate: mockPopulate });

    const result = await getAllEnrolledCoursesFromDB("user-1");

    expect(result.data[0].progress).toEqual({
      completed: 1,
      total: 2,
      percentage: 50,
    });
  });

  it("handles courses with newly added chapters without showing 100%", async () => {
    const courseMock = {
      _id: "course-123",
      name: "Node Mastery",
      slug: "node-mastery",
      chapters: [{ _id: "ch-1" }, { _id: "ch-2" }, { _id: "ch-3" }],
      toObject: () => ({
        _id: "course-123",
        name: "Node Mastery",
        slug: "node-mastery",
      }),
    };

    const userCourseMock = {
      userId: "user-1",
      courseId: "course-123",
      course: courseMock,
      chapters: [
        { chapterId: "ch-1", isCompleted: true },
        { chapterId: "ch-2", isCompleted: true },
      ],
    };

    const mockExec = vi.fn().mockResolvedValue([userCourseMock]);
    const mockPopulate = vi.fn().mockReturnValue({ exec: mockExec });
    mockUserCourseFind.mockReturnValue({ populate: mockPopulate });

    const result = await getAllEnrolledCoursesFromDB("user-1");

    expect(result.data[0].progress).toEqual({
      completed: 2,
      total: 3,
      percentage: 67,
    });
  });

  it("handles course with 0 chapters safely", async () => {
    const courseMock = {
      _id: "course-empty",
      name: "Empty Course",
      slug: "empty-course",
      chapters: [],
      toObject: () => ({
        _id: "course-empty",
        name: "Empty Course",
        slug: "empty-course",
      }),
    };

    const userCourseMock = {
      userId: "user-1",
      courseId: "course-empty",
      course: courseMock,
      chapters: [],
    };

    const mockExec = vi.fn().mockResolvedValue([userCourseMock]);
    const mockPopulate = vi.fn().mockReturnValue({ exec: mockExec });
    mockUserCourseFind.mockReturnValue({ populate: mockPopulate });

    const result = await getAllEnrolledCoursesFromDB("user-1");

    expect(result.data[0].progress).toEqual({
      completed: 0,
      total: 0,
      percentage: 0,
    });
  });

  it("filters out deleted course where userCourse.course is null", async () => {
    const userCourseMock = {
      userId: "user-1",
      courseId: "deleted-course-id",
      course: null,
      chapters: [],
    };

    const mockExec = vi.fn().mockResolvedValue([userCourseMock]);
    const mockPopulate = vi.fn().mockReturnValue({ exec: mockExec });
    mockUserCourseFind.mockReturnValue({ populate: mockPopulate });

    const result = await getAllEnrolledCoursesFromDB("user-1");

    expect(result.data).toEqual([]);
  });
});
