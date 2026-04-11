import mongoose from "mongoose";

/**
 * Strict MongoDB ObjectId string check (rejects arbitrary 12-byte strings).
 */
export function isMongoObjectIdString(id: string): boolean {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
}
