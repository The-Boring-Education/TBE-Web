import {
  Course,
  InterviewSheet,
  Project,
  UserCourse,
  UserProject,
  UserSheet,
} from "@api/lib/database/models";
import { reorderContentInDB } from "@api/lib/database/queries/contentOrder";
import { getASheetForUserFromDB } from "@api/lib/database/queries/interview-prep";
import { getAProjectForUserFromDB } from "@api/lib/database/queries/project";
import { getCourseBySlugWithUserFromDB } from "@api/lib/database/queries/shiksha";
import type { ContentOrderType } from "@tbe/types";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const common = {
  name: "Ordering",
  slug: "ordering",
  description: "Ordering fixture",
  coverImageURL: "https://example.com/cover.png",
  roadmap: "Frontend",
  difficultyLevel: "Beginner",
  liveOn: new Date(),
};

describe("Content ordering persistence", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri("content_order"));
  }, 180_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  }, 30_000);

  beforeEach(async () => {
    await Promise.all([
      Course.deleteMany({}),
      InterviewSheet.deleteMany({}),
      Project.deleteMany({}),
      UserCourse.deleteMany({}),
      UserSheet.deleteMany({}),
      UserProject.deleteMany({}),
    ]);
  });

  const fixture = async (contentType: ContentOrderType) => {
    if (contentType === "course-chapters") {
      const doc = await Course.create({
        ...common,
        status: "PUBLISHED",
        chapters: ["intro", "basics", "advanced"].map((key) => ({
          key,
          name: key,
          content: `# ${key}`,
          isOptional: key === "advanced",
        })),
      });
      return {
        parentId: doc._id.toString(),
        ids: doc.chapters.map((chapter) => chapter._id.toString()),
        collection: Course.collection,
        field: "chapters",
      };
    }
    if (contentType === "interview-questions") {
      const doc = await InterviewSheet.create({
        ...common,
        questions: ["First", "Second", "Third"].map((title) => ({
          title,
          question: title,
          answer: `Answer ${title}`,
          frequency: "Most Asked",
          resources: { blogURL: "https://example.com/resource" },
        })),
      });
      return {
        parentId: doc._id.toString(),
        ids: doc.questions.map((question) => question._id.toString()),
        collection: InterviewSheet.collection,
        field: "questions",
      };
    }
    const doc = await Project.create({
      ...common,
      requiredSkills: [],
      sections: ["first", "second", "third"].map((sectionId) => ({
        sectionId,
        sectionName: sectionId,
        chapters: [
          {
            chapterId: `${sectionId}-chapter`,
            chapterName: "Chapter",
            content: "# Content",
          },
        ],
      })),
    });
    return {
      parentId: doc._id.toString(),
      ids: doc.sections.map((section) => section.sectionId),
      collection: Project.collection,
      field: "sections",
    };
  };

  it.each<ContentOrderType>([
    "course-chapters",
    "interview-questions",
    "project-sections",
  ])(
    "persists %s without changing child data, IDs or metadata",
    async (contentType) => {
      const { parentId, ids, collection, field } = await fixture(contentType);
      const before = await collection.findOne({
        _id: new Types.ObjectId(parentId),
      });
      const orderedIds = [ids[2], ids[0], ids[1]];
      expect(
        await reorderContentInDB({
          contentType,
          parentId,
          previousIds: ids,
          orderedIds,
        }),
      ).toEqual({ data: { orderedIds } });
      const after = await collection.findOne({
        _id: new Types.ObjectId(parentId),
      });
      expect(after![field]).toEqual([
        before![field][2],
        before![field][0],
        before![field][1],
      ]);
      expect(after!.name).toBe(before!.name);
      expect(after!.slug).toBe(before!.slug);
      expect(after!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before!.updatedAt.getTime(),
      );
    },
  );

  it("rejects stale reorders, incomplete lists and foreign IDs without writing", async () => {
    const { parentId, ids } = await fixture("course-chapters");
    const payload = {
      contentType: "course-chapters" as const,
      parentId,
      previousIds: ids,
      orderedIds: [...ids].reverse(),
    };
    await reorderContentInDB(payload);
    expect((await reorderContentInDB(payload)).statusCode).toBe(409);
    expect(
      (
        await reorderContentInDB({
          ...payload,
          previousIds: [ids[0]],
          orderedIds: [ids[0]],
        })
      ).statusCode,
    ).toBe(409);
    expect(
      (
        await reorderContentInDB({
          ...payload,
          orderedIds: [ids[0], ids[1], new Types.ObjectId().toString()],
        })
      ).statusCode,
    ).toBe(400);
    const read = await Course.findById(parentId);
    expect(read!.chapters.map((chapter) => chapter._id.toString())).toEqual(
      [...ids].reverse(),
    );
  });

  it("preserves text edits made after the list was loaded", async () => {
    const { parentId, ids } = await fixture("course-chapters");
    await Course.updateOne(
      { _id: parentId },
      { $set: { "chapters.0.content": "New content" } },
    );
    await reorderContentInDB({
      contentType: "course-chapters",
      parentId,
      previousIds: ids,
      orderedIds: [...ids].reverse(),
    });
    const read = await Course.findById(parentId);
    expect(read!.chapters[2].content).toBe("New content");
  });

  it("rejects a stale list after a chapter is added or deleted", async () => {
    const { parentId, ids } = await fixture("course-chapters");
    const payload = {
      contentType: "course-chapters" as const,
      parentId,
      previousIds: ids,
      orderedIds: [...ids].reverse(),
    };
    await Course.updateOne(
      { _id: parentId },
      {
        $push: {
          chapters: { key: "new", name: "New", content: "New content" },
        },
      },
    );
    expect((await reorderContentInDB(payload)).statusCode).toBe(409);
    await Course.updateOne(
      { _id: parentId },
      { $pull: { chapters: { _id: ids[0] } } },
    );
    expect((await reorderContentInDB(payload)).statusCode).toBe(409);
    const read = await Course.findById(parentId);
    expect(read!.chapters.map((chapter) => chapter.key)).toEqual([
      "basics",
      "advanced",
      "new",
    ]);
  });

  it("reports missing parents and allows empty and unchanged orders", async () => {
    expect(
      (
        await reorderContentInDB({
          contentType: "course-chapters",
          parentId: new Types.ObjectId().toString(),
          previousIds: [],
          orderedIds: [],
        })
      ).statusCode,
    ).toBe(404);
    const course = await Course.create({ ...common, chapters: [] });
    expect(
      (
        await reorderContentInDB({
          contentType: "course-chapters",
          parentId: course._id.toString(),
          previousIds: [],
          orderedIds: [],
        })
      ).error,
    ).toBeUndefined();
  });

  it("shows enrolled learners the new chapter and question order without losing progress", async () => {
    const course = await fixture("course-chapters");
    const sheet = await fixture("interview-questions");
    const userId = new Types.ObjectId();
    await UserCourse.create({
      userId,
      courseId: course.parentId,
      chapters: [{ chapterId: course.ids[0], isCompleted: true }],
    });
    await UserSheet.create({
      userId,
      sheetId: sheet.parentId,
      questions: [
        {
          questionId: sheet.ids[0],
          isCompleted: true,
          isStarred: true,
          notes: "Keep me",
        },
      ],
    });
    for (const [contentType, item] of [
      ["course-chapters", course],
      ["interview-questions", sheet],
    ] as const) {
      await reorderContentInDB({
        contentType,
        parentId: item.parentId,
        previousIds: item.ids,
        orderedIds: [...item.ids].reverse(),
      });
    }
    const { data: courseRead } = await getCourseBySlugWithUserFromDB(
      common.slug,
      userId.toString(),
    );
    expect(
      courseRead.chapters.map((chapter: { _id: Types.ObjectId }) =>
        chapter._id.toString(),
      ),
    ).toEqual([...course.ids].reverse());
    expect(courseRead.chapters[2].isCompleted).toBe(true);
    const { data: sheetRead } = await getASheetForUserFromDB(
      userId.toString(),
      sheet.parentId,
    );
    expect(
      sheetRead.questions.map((question: { _id: Types.ObjectId }) =>
        question._id.toString(),
      ),
    ).toEqual([...sheet.ids].reverse());
    expect(sheetRead.questions[2]).toMatchObject({
      isCompleted: true,
      isStarred: true,
    });
    expect((await UserSheet.findOne({ userId }))!.questions[0].notes).toBe(
      "Keep me",
    );
  });

  it("uses live project section order for existing enrollments and preserves completion", async () => {
    const { parentId, ids } = await fixture("project-sections");
    const userId = new Types.ObjectId();
    await UserProject.create({
      userId,
      projectId: parentId,
      sections: ids.map((sectionId) => ({
        sectionId,
        chapters: [
          {
            chapterId: `${sectionId}-chapter`,
            isCompleted: sectionId === ids[0],
          },
        ],
      })),
    });
    await reorderContentInDB({
      contentType: "project-sections",
      parentId,
      previousIds: ids,
      orderedIds: [...ids].reverse(),
    });
    const { data, error } = await getAProjectForUserFromDB(
      userId.toString(),
      parentId,
    );
    expect(error).toBeUndefined();
    expect(
      data.sections.map((section: { sectionId: string }) => section.sectionId),
    ).toEqual([...ids].reverse());
    expect(data.sections[2].chapters[0].isCompleted).toBe(true);
    expect(data.sections[0].chapters[0].isCompleted).toBe(false);
  });

  it("preserves the enrolled section set while applying the live order", async () => {
    const { parentId, ids } = await fixture("project-sections");
    const userId = new Types.ObjectId();
    await UserProject.create({
      userId,
      projectId: parentId,
      sections: [ids[0], ids[2]].map((sectionId) => ({
        sectionId,
        chapters: [],
      })),
    });
    await reorderContentInDB({
      contentType: "project-sections",
      parentId,
      previousIds: ids,
      orderedIds: [...ids].reverse(),
    });
    const { data } = await getAProjectForUserFromDB(
      userId.toString(),
      parentId,
    );
    expect(
      data.sections.map((section: { sectionId: string }) => section.sectionId),
    ).toEqual([ids[2], ids[0]]);
  });
});
