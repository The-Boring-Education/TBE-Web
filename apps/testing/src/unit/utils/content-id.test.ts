/**
 * @vitest-environment node
 */
import { applyContentIdOnCreate, needsContentId } from "@tbe/utils";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("needsContentId", () => {
  it("returns true for undefined, null, and empty string", () => {
    expect(needsContentId(undefined)).toBe(true);
    expect(needsContentId(null)).toBe(true);
    expect(needsContentId("")).toBe(true);
  });

  it("returns false for non-empty strings and other primitives", () => {
    expect(needsContentId("abc")).toBe(false);
    expect(needsContentId("0")).toBe(false);
    expect(needsContentId(0)).toBe(false);
    expect(needsContentId(false)).toBe(false);
  });
});

describe("applyContentIdOnCreate", () => {
  const modelName = "ContentIdUtilSchemaTest";

  beforeEach(() => {
    if (mongoose.models[modelName]) {
      mongoose.deleteModel(modelName);
    }
  });

  afterEach(() => {
    if (mongoose.models[modelName]) {
      mongoose.deleteModel(modelName);
    }
  });

  function makeModel() {
    const schema = new mongoose.Schema({
      title: { type: String, required: true },
      contentId: { type: String },
    });
    applyContentIdOnCreate(schema);
    return mongoose.model(modelName, schema);
  }

  it("assigns a UUID v4 on validate when contentId is missing", async () => {
    const Model = makeModel();
    const doc = new Model({ title: "hello" });
    await doc.validate();
    expect(doc.contentId).toBeDefined();
    expect(doc.contentId).toMatch(UUID_V4_RE);
  });

  it("does not overwrite an explicit contentId", async () => {
    const Model = makeModel();
    const existing = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const doc = new Model({ title: "x", contentId: existing });
    await doc.validate();
    expect(doc.contentId).toBe(existing);
  });

  it("does not assign when isNew is false", async () => {
    const Model = makeModel();
    const doc = new Model({ title: "nodb" });
    doc.isNew = false;
    await doc.validate();
    expect(doc.contentId).toBeUndefined();
  });

  it("assigns distinct contentIds for insertMany", async () => {
    const mongod = await MongoMemoryServer.create();
    const conn = await mongoose.createConnection(mongod.getUri()).asPromise();
    try {
      const schema = new mongoose.Schema({
        title: { type: String, required: true },
        contentId: { type: String },
      });
      applyContentIdOnCreate(schema);
      const M = conn.model("ContentIdInsertManyTest", schema);
      const created = await M.insertMany([{ title: "a" }, { title: "b" }], {
        ordered: true,
      });
      expect(created).toHaveLength(2);
      const [first, second] = created;
      expect(first.contentId).toMatch(UUID_V4_RE);
      expect(second.contentId).toMatch(UUID_V4_RE);
      expect(first.contentId).not.toBe(second.contentId);
    } finally {
      await conn.close();
      await mongod.stop();
    }
  }, 120_000);
});
