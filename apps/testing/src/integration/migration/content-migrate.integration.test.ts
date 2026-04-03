/**
 * Integration tests for content migration by `contentId` (in-memory MongoDB).
 */
import {
  ENTITY_MAP,
  migrateCollectionByContentId,
} from "@api/lib/migration/content-migrate-entity";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("migrateCollectionByContentId (integration)", () => {
  let mongod: MongoMemoryServer;
  let sourceConn: mongoose.Connection;
  let targetConn: mongoose.Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const baseUri = mongod.getUri();
    sourceConn = await mongoose
      .createConnection(`${baseUri}migrate_src`)
      .asPromise();
    targetConn = await mongoose
      .createConnection(`${baseUri}migrate_tgt`)
      .asPromise();
  }, 180_000);

  afterAll(async () => {
    await sourceConn?.close();
    await targetConn?.close();
    await mongod?.stop();
  }, 30_000);

  it("inserts new DSA-style docs on target by contentId (fresh content)", async () => {
    const coll = ENTITY_MAP.dsaQuestions;
    const src = sourceConn.collection(coll);
    const tgt = targetConn.collection(coll);
    await src.deleteMany({});
    await tgt.deleteMany({});

    await src.insertOne({
      contentId: "11111111-1111-1111-1111-111111111111",
      title: "Two Sum",
      answer: "hash map",
    });

    const result = await migrateCollectionByContentId(
      sourceConn,
      targetConn,
      "dsaQuestions",
      coll,
      { dryRun: false, verbose: false },
    );

    expect(result.inserted).toBe(1);
    expect(result.updated).toBe(0);
    const onTarget = await tgt.findOne({
      contentId: "11111111-1111-1111-1111-111111111111",
    });
    expect(onTarget?.title).toBe("Two Sum");
    expect(String(onTarget?._id)).not.toBeUndefined();
  });

  it("updates target when source document body changes (incremental edit)", async () => {
    const coll = ENTITY_MAP.interviewSheets;
    const src = sourceConn.collection(coll);
    const tgt = targetConn.collection(coll);
    await src.deleteMany({});
    await tgt.deleteMany({});

    const cid = "22222222-2222-2222-2222-222222222222";
    await src.insertOne({
      contentId: cid,
      slug: "test-sheet",
      questions: [{ title: "Q1", answer: "A1" }],
    });

    await migrateCollectionByContentId(
      sourceConn,
      targetConn,
      "interviewSheets",
      coll,
      { dryRun: false, verbose: false },
    );

    await src.updateOne(
      { contentId: cid },
      {
        $set: {
          questions: [
            { title: "Q1", answer: "A1" },
            { title: "Q2", answer: "A2" },
          ],
        },
      },
    );

    const r2 = await migrateCollectionByContentId(
      sourceConn,
      targetConn,
      "interviewSheets",
      coll,
      { dryRun: false, verbose: false },
    );

    expect(r2.updated).toBe(1);
    const onTarget = await tgt.findOne({ contentId: cid });
    expect((onTarget?.questions as unknown[]).length).toBe(2);
  });

  it("skips documents without contentId", async () => {
    const coll = ENTITY_MAP.quizzes;
    const src = sourceConn.collection(coll);
    const tgt = targetConn.collection(coll);
    await src.deleteMany({});
    await tgt.deleteMany({});

    await src.insertOne({ categoryName: "cat", noContentId: true });

    const result = await migrateCollectionByContentId(
      sourceConn,
      targetConn,
      "quizzes",
      coll,
      { dryRun: false, verbose: false },
    );

    expect(result.skipped).toBe(1);
    expect(await tgt.countDocuments()).toBe(0);
  });

  it("migrates aptitude topics (aptitudetopics collection)", async () => {
    const coll = ENTITY_MAP.aptitudeTopics;
    const src = sourceConn.collection(coll);
    const tgt = targetConn.collection(coll);
    await src.deleteMany({});
    await tgt.deleteMany({});

    await src.insertOne({
      contentId: "55555555-5555-5555-5555-555555555555",
      title: "Percentages",
      slug: "percentages",
    });

    const result = await migrateCollectionByContentId(
      sourceConn,
      targetConn,
      "aptitudeTopics",
      coll,
      { dryRun: false, verbose: false },
    );

    expect(result.inserted).toBe(1);
    const onTarget = await tgt.findOne({
      contentId: "55555555-5555-5555-5555-555555555555",
    });
    expect(onTarget?.title).toBe("Percentages");
    expect(onTarget?.slug).toBe("percentages");
  });

  it("migrates DSA study guides (studyguides collection)", async () => {
    const coll = ENTITY_MAP.studyGuides;
    const src = sourceConn.collection(coll);
    const tgt = targetConn.collection(coll);
    await src.deleteMany({});
    await tgt.deleteMany({});

    await src.insertOne({
      contentId: "44444444-4444-4444-4444-444444444444",
      topicId: "ARRAY",
      title: "Arrays",
      hasGuide: true,
      sortOrder: 1,
      sections: [],
    });

    const result = await migrateCollectionByContentId(
      sourceConn,
      targetConn,
      "studyGuides",
      coll,
      { dryRun: false, verbose: false },
    );

    expect(result.inserted).toBe(1);
    const onTarget = await tgt.findOne({
      contentId: "44444444-4444-4444-4444-444444444444",
    });
    expect(onTarget?.topicId).toBe("ARRAY");
    expect(onTarget?.title).toBe("Arrays");
  });

  it("dry-run does not write to target", async () => {
    const coll = ENTITY_MAP.courses;
    const src = sourceConn.collection(coll);
    const tgt = targetConn.collection(coll);
    await src.deleteMany({});
    await tgt.deleteMany({});

    await src.insertOne({
      contentId: "33333333-3333-3333-3333-333333333333",
      name: "Course A",
    });

    await migrateCollectionByContentId(
      sourceConn,
      targetConn,
      "courses",
      coll,
      { dryRun: true, verbose: false },
    );

    expect(await tgt.countDocuments()).toBe(0);
  });
});
