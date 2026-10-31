/**
 * Chapter Key (integration): a chapter's key is required, kebab-case and unique
 * within its course, and must survive a re-title so learner progress stays
 * attached. Also covers the backfill of pre-existing chapters.
 */
import { Course } from "@api/lib/database/models";
import {
  addChapterToCourseInDB,
  DUPLICATE_CHAPTER_KEY_ERROR,
  INVALID_CHAPTER_KEY_ERROR,
  updateCourseChapterInDB,
} from "@api/lib/database/queries/shiksha";
import { backfillChapterKeys } from "@api/lib/migration/chapter-key-backfill";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const courseFixture = (slug = "react-basics") => ({
  name: "React Basics",
  slug,
  coverImageURL: "https://example.com/cover.png",
  liveOn: new Date(),
  roadmap: "Frontend",
  difficultyLevel: "Beginner",
  chapters: [],
});

describe("Chapter Key (integration)", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri("chapter_keys"));
  }, 180_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  }, 30_000);

  beforeEach(async () => {
    await Course.deleteMany({});
  });

  it("stores a kebab-case key on a new chapter and exposes it on read", async () => {
    const course = await Course.create(courseFixture());

    const { data, error } = await addChapterToCourseInDB(
      course._id.toString(),
      {
        key: "intro-to-react",
        name: "Intro to React",
        content: "## Hello",
      },
    );

    expect(error).toBeUndefined();
    expect(data!.chapters[0].key).toBe("intro-to-react");

    const read = await Course.findById(course._id);
    expect(read?.toObject().chapters[0].key).toBe("intro-to-react");
  });

  it("rejects a key that already exists in the same course", async () => {
    const course = await Course.create(courseFixture());
    const courseId = course._id.toString();

    await addChapterToCourseInDB(courseId, {
      key: "intro",
      name: "Intro",
      content: "a",
    });

    const { data, error } = await addChapterToCourseInDB(courseId, {
      key: "intro",
      name: "Another intro",
      content: "b",
    });

    expect(data).toBeUndefined();
    expect(error).toBe(DUPLICATE_CHAPTER_KEY_ERROR);

    const read = await Course.findById(courseId);
    expect(read?.chapters).toHaveLength(1);
  });

  it("allows the same key in a different course", async () => {
    const first = await Course.create(courseFixture("course-one"));
    const second = await Course.create(courseFixture("course-two"));
    const chapter = { key: "intro", name: "Intro", content: "a" };

    const firstResult = await addChapterToCourseInDB(
      first._id.toString(),
      chapter,
    );
    const secondResult = await addChapterToCourseInDB(
      second._id.toString(),
      chapter,
    );

    expect(firstResult.error).toBeUndefined();
    expect(secondResult.error).toBeUndefined();
  });

  it("rejects malformed keys", async () => {
    const course = await Course.create(courseFixture());
    const courseId = course._id.toString();

    for (const key of ["", "Intro Chapter", "intro_chapter", "-intro", "a/b"]) {
      const { error } = await addChapterToCourseInDB(courseId, {
        key,
        name: "Intro",
        content: "a",
      });
      expect(error).toBe(INVALID_CHAPTER_KEY_ERROR);
    }

    const read = await Course.findById(courseId);
    expect(read?.chapters).toHaveLength(0);
  });

  it("rejects a chapter saved without a key", async () => {
    const course = new Course({
      ...courseFixture(),
      chapters: [{ name: "Intro", content: "a" }],
    });

    await expect(course.save()).rejects.toThrow(/key is required/i);
  });

  it("keeps the key unchanged when the chapter title changes", async () => {
    const course = await Course.create(courseFixture());
    const courseId = course._id.toString();

    const { data: withChapter } = await addChapterToCourseInDB(courseId, {
      key: "intro-to-react",
      name: "Intro to React",
      content: "a",
    });
    const chapterId = withChapter!.chapters[0]._id.toString();

    const { data: updated } = await updateCourseChapterInDB(
      courseId,
      chapterId,
      { name: "Getting started with React" },
    );

    expect(updated!.chapters[0].name).toBe("Getting started with React");
    expect(updated!.chapters[0].key).toBe("intro-to-react");
    expect(updated!.chapters[0]._id.toString()).toBe(chapterId);
  });

  it("backfills existing chapters, resolving collisions deterministically", async () => {
    const collection = mongoose.connection.collection("courses");
    const { insertedId } = await collection.insertOne({
      ...courseFixture("legacy-course"),
      chapters: [
        { _id: new mongoose.Types.ObjectId(), name: "Intro", content: "a" },
        { _id: new mongoose.Types.ObjectId(), name: "Intro", content: "b" },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "State & Props",
          content: "c",
          key: "state-props",
        },
        { _id: new mongoose.Types.ObjectId(), name: "***", content: "d" },
      ],
    });

    const result = await backfillChapterKeys(mongoose.connection);
    expect(result.coursesUpdated).toBe(1);
    expect(result.chaptersUpdated).toBe(3);

    const keysOf = async () => {
      const doc = await collection.findOne({ _id: insertedId });
      return (doc?.chapters as Array<{ key: string }>).map((c) => c.key);
    };

    const expectedKeys = ["intro", "intro-2", "state-props", "chapter"];
    expect(await keysOf()).toEqual(expectedKeys);

    // Idempotent: a second run leaves every key alone.
    const second = await backfillChapterKeys(mongoose.connection);
    expect(second.chaptersUpdated).toBe(0);
    expect(await keysOf()).toEqual(expectedKeys);
  });
});
