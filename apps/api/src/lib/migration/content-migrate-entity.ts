import chalk from "chalk";
import type mongoose from "mongoose";

import {
  CONTENT_ENTITY_MAP,
  ENTITY_MAP,
  type EntityMapKey,
} from "./content-entity-map";

export { CONTENT_ENTITY_MAP, ENTITY_MAP, type EntityMapKey };

/**
 * Shared migration logic used by `scripts/migrate-content.ts`.
 *
 * Behavior:
 * - Matches documents by `contentId` on the target (never copies `_id` from source).
 * - `$set` applies the **entire** source document body (minus `_id`) to the matched target doc.
 *   Embedded arrays/objects (e.g. interview `questions`, course `chapters`, quiz `questions`)
 *   are replaced with the source snapshot — incremental edits on source migrate as a full
 *   document sync to target.
 * - **Cross-collection ObjectId refs** (e.g. InterviewSheet `dsaQuestions[]` pointing at
 *   `dsaquestions` `_id`s) still hold **source** IDs after migrate. If target DB already had
 *   different `_id`s for the same `contentId`, those refs can be invalid until IDs align.
 *   Migrate `dsaQuestions` (and any similar collections) to the same target **before** or
 *   ensure apps resolve by `contentId` where possible.
 */

export interface MigrateEntityResult {
  entity: string;
  collection: string;
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  errors: number;
}

export interface MigrateEntityOptions {
  dryRun: boolean;
  /** When false, skip chalk console output (for tests). Default true. */
  verbose?: boolean;
}

/**
 * Copy all documents from source collection to target, keyed by `contentId`.
 */
export async function migrateCollectionByContentId(
  sourceConn: mongoose.Connection,
  targetConn: mongoose.Connection,
  entityName: string,
  collectionName: string,
  options: MigrateEntityOptions,
): Promise<MigrateEntityResult> {
  const { dryRun, verbose = true } = options;
  const sourceCollection = sourceConn.collection(collectionName);
  const targetCollection = targetConn.collection(collectionName);

  const sourceDocs = await sourceCollection.find({}).toArray();
  const result: MigrateEntityResult = {
    entity: entityName,
    collection: collectionName,
    inserted: 0,
    updated: 0,
    skipped: 0,
    total: sourceDocs.length,
    errors: 0,
  };

  if (verbose) {
    console.log(
      chalk.blue(
        `  [${entityName}] Found ${sourceDocs.length} documents in source`,
      ),
    );
  }

  for (const doc of sourceDocs) {
    if (!doc.contentId) {
      if (verbose) {
        console.log(
          chalk.yellow(
            `  [${entityName}] SKIP: document ${doc._id} has no contentId`,
          ),
        );
      }
      result.skipped++;
      continue;
    }

    const { _id: _unused, ...docWithoutId } = doc;

    if (dryRun) {
      const existing = await targetCollection.findOne({
        contentId: doc.contentId,
      });
      if (verbose) {
        if (existing) {
          console.log(
            chalk.blue(
              `  [${entityName}] DRY-RUN would update: contentId=${doc.contentId}`,
            ),
          );
        } else {
          console.log(
            chalk.green(
              `  [${entityName}] DRY-RUN would insert: contentId=${doc.contentId}`,
            ),
          );
        }
      }
      if (existing) {
        result.updated++;
      } else {
        result.inserted++;
      }
      continue;
    }

    try {
      const writeResult = await targetCollection.updateOne(
        { contentId: doc.contentId },
        { $set: docWithoutId },
        { upsert: true },
      );

      if (writeResult.upsertedCount && writeResult.upsertedCount > 0) {
        result.inserted++;
      } else if (writeResult.modifiedCount > 0) {
        result.updated++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (verbose) {
        console.error(
          chalk.red(
            `  [${entityName}] ERROR on contentId=${doc.contentId}: ${msg}`,
          ),
        );
      }
      result.errors++;
    }
  }

  if (verbose) {
    const modeLabel = dryRun ? "DRY-RUN" : "DONE";
    console.log(
      chalk.green(
        `  [${entityName}] ${modeLabel}: ${result.inserted} inserted, ` +
          `${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`,
      ),
    );
  }

  return result;
}
