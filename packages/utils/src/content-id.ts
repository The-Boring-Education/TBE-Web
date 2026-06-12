import type { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/** True when `contentId` should be auto-assigned (missing or empty). */
export function needsContentId(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * Assigns UUID v4 `contentId` when a new document is created without one.
 * Uses `pre("validate")` so `save`, `create`, and `insertMany` all get the same
 * behavior (insertMany does not run `save` middleware).
 *
 * Also register the model's MongoDB collection in
 * `apps/api/src/lib/migration/content-entity-map.ts` so backfill/migrate CLIs
 * stay in sync (see `content-entity-map.test.ts`).
 */
export function applyContentIdOnCreate(schema: Schema): void {
  schema.pre("validate", function (next) {
    if (this.isNew && needsContentId(this.get("contentId"))) {
      this.set("contentId", uuidv4());
    }
    next();
  });
}
