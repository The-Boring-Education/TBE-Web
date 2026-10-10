/**
 * Backfill for Chapter Keys on existing courses.
 *
 * Every embedded chapter gets a stable, kebab-case `key` derived from its
 * title. Keys already present and well-formed are kept as-is; collisions within
 * the same course are resolved deterministically (`-2`, `-3`, …) in chapter
 * order, so re-running the backfill is idempotent.
 *
 * Used by `scripts/backfill-chapter-keys.ts`.
 */
import { assignChapterKeys } from "@tbe/utils";
import type { Connection } from "mongoose";

import { CONTENT_ENTITY_MAP } from "./content-entity-map";

export const COURSES_COLLECTION = CONTENT_ENTITY_MAP.courses;

export interface ChapterKeyBackfillResult {
  /** Courses inspected. */
  coursesScanned: number;
  /** Courses whose chapters array was rewritten. */
  coursesUpdated: number;
  /** Chapters that received a new key. */
  chaptersUpdated: number;
}

interface RawChapter {
  name?: string | null;
  key?: unknown;
  [field: string]: unknown;
}

/** Assigns keys to every chapter of every course missing a valid one. */
export async function backfillChapterKeys(
  conn: Connection,
  onProgress?: (result: ChapterKeyBackfillResult) => void,
): Promise<ChapterKeyBackfillResult> {
  const collection = conn.collection(COURSES_COLLECTION);
  const result: ChapterKeyBackfillResult = {
    coursesScanned: 0,
    coursesUpdated: 0,
    chaptersUpdated: 0,
  };

  const cursor = collection.find<{ _id: unknown; chapters?: RawChapter[] }>({});

  for await (const course of cursor) {
    result.coursesScanned++;

    const chapters = Array.isArray(course.chapters) ? course.chapters : [];
    if (!chapters.length) continue;

    const keys = assignChapterKeys(chapters);
    const changed = chapters.filter(
      (chapter, index) => chapter?.key !== keys[index],
    ).length;

    if (!changed) continue;

    await collection.updateOne(
      { _id: course._id as never },
      {
        $set: {
          chapters: chapters.map((chapter, index) => ({
            ...chapter,
            key: keys[index],
          })),
        },
      },
    );

    result.coursesUpdated++;
    result.chaptersUpdated += changed;
    onProgress?.(result);
  }

  return result;
}
