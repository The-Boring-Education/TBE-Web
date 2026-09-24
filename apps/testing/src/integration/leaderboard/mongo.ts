import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

/** Connects the default mongoose connection (used by the API models) to an in-memory MongoDB. */
export const startMongo = async (dbName: string) => {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(`${mongod.getUri()}${dbName}`);
  // Unique indexes are part of the behaviour under test (once-per-item, one counter per Period).
  const leaderboardModels = [
    "Gamification",
    "LearningCredit",
    "PeriodScore",
    "PointEvent",
    "PeriodClose",
  ];
  await Promise.all(
    leaderboardModels
      .map((name) => mongoose.models[name])
      .filter(Boolean)
      .map((model) => model!.syncIndexes()),
  );
  return async () => {
    await mongoose.disconnect();
    await mongod.stop();
  };
};

export const clearCollections = async () => {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
};

/** Build a UTC instant from an IST wall-clock time. */
export const ist = (iso: string) => new Date(`${iso}+05:30`);

export const oid = () => new mongoose.Types.ObjectId();

export const minutesLater = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000);
