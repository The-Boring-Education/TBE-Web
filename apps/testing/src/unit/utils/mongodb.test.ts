/**
 * @vitest-environment node
 */
import {
  connectToDatabase,
  createObjectId,
  disconnectFromDatabase,
  getAllDocumentsFromModel,
  getTotalCountFromModel,
} from "@tbe/utils/mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("mongodb utils", () => {
  describe("connectToDatabase / disconnectFromDatabase", () => {
    let mongod: MongoMemoryServer;

    beforeEach(() => {
      vi.restoreAllMocks();
      delete process.env.MONGODB_URI;
      delete process.env.MONGO_URI;
    });

    afterEach(async () => {
      await disconnectFromDatabase();
      if (mongod) await mongod.stop();
    });

    it("throws when no MONGODB_URI/MONGO_URI is configured", async () => {
      await expect(connectToDatabase()).rejects.toThrow(
        "MONGODB_URI or MONGO_URI environment variable is required",
      );
    });

    it("connects successfully when MONGODB_URI is set", async () => {
      mongod = await MongoMemoryServer.create();
      process.env.MONGODB_URI = mongod.getUri();
      vi.spyOn(console, "log").mockImplementation(() => {});

      await expect(connectToDatabase()).resolves.toBeUndefined();
      expect(mongoose.connection.readyState).toBe(1);
    });

    it("is a no-op when already connected", async () => {
      mongod = await MongoMemoryServer.create();
      process.env.MONGODB_URI = mongod.getUri();
      vi.spyOn(console, "log").mockImplementation(() => {});
      const connectSpy = vi.spyOn(mongoose, "connect");

      await connectToDatabase();
      await connectToDatabase();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it("disconnectFromDatabase is a no-op when not connected", async () => {
      await expect(disconnectFromDatabase()).resolves.toBeUndefined();
    });
  });

  describe("createObjectId", () => {
    it("creates a new ObjectId when no id is given", () => {
      const id = createObjectId();
      expect(mongoose.isValidObjectId(id)).toBe(true);
    });

    it("wraps a given id string as an ObjectId", () => {
      const raw = new mongoose.Types.ObjectId().toString();
      const id = createObjectId(raw);
      expect(id.toString()).toBe(raw);
    });
  });

  describe("getTotalCountFromModel / getAllDocumentsFromModel", () => {
    let mongod: MongoMemoryServer;
    let conn: mongoose.Connection;
    const modelName = "MongodbUtilTestModel";

    beforeEach(async () => {
      mongod = await MongoMemoryServer.create();
      conn = await mongoose.createConnection(mongod.getUri()).asPromise();
    });

    afterEach(async () => {
      await conn.close();
      await mongod.stop();
    });

    function makeModel() {
      const schema = new mongoose.Schema({ name: String });
      return conn.model(modelName, schema);
    }

    it("getTotalCountFromModel returns the document count", async () => {
      const Model = makeModel();
      await Model.create([{ name: "a" }, { name: "b" }]);

      const result = await getTotalCountFromModel(Model);

      expect(result.data).toBe(2);
      expect(result.error).toBeUndefined();
    });

    it("getTotalCountFromModel returns an error object on failure", async () => {
      const Model = makeModel();
      vi.spyOn(Model, "countDocuments").mockImplementation(() => {
        throw new Error("boom");
      });

      const result = await getTotalCountFromModel(Model);

      expect(result.error).toBe("Error while counting documents");
    });

    it("getAllDocumentsFromModel returns paginated documents", async () => {
      const Model = makeModel();
      await Model.create([{ name: "a" }, { name: "b" }, { name: "c" }]);

      const result = await getAllDocumentsFromModel(Model, 1, 2);

      expect(result.data).toHaveLength(2);
    });

    it("getAllDocumentsFromModel returns an error object on failure", async () => {
      const Model = makeModel();
      vi.spyOn(Model, "find").mockImplementation(() => {
        throw new Error("boom");
      });

      const result = await getAllDocumentsFromModel(Model);

      expect(result.error).toBe("Error while fetching documents");
    });
  });
});
