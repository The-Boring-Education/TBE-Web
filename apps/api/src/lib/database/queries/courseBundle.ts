/**
 * Course Bundle Import and Export.
 *
 * Import resolves the Course by slug and reconciles chapters by Chapter Key,
 * updating matched chapters *in place* so the embedded chapter `_id` — which
 * every learner progress document references — never changes. Chapters only
 * present in the database are reported as orphaned and left untouched: Import
 * never deletes a chapter, so a typo in a Bundle can never erase progress.
 *
 * A dry run computes the identical report without writing anything, which is
 * what powers the Admin importer's pre-flight confirmation.
 */

import type {
  CourseBundle,
  CourseBundleChapter,
  CourseBundleImportReport,
} from "@tbe/types";

import { COURSE_STATUS_DEFAULT } from "@/lib/constants";
import type {
  CourseChapterModel,
  CourseModel,
  DatabaseQueryResponseType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Course } from "../models";

type ImportCourseBundleOptions = {
  bundle: CourseBundle;
  /** Compute the report without writing anything. */
  dryRun?: boolean;
};

/** Stored shape of one chapter, with identity fields kept intact. */
type StoredChapter = Record<string, unknown> & {
  _id?: unknown;
  key: string;
  name: string;
  content: string;
  isOptional?: boolean;
};

const normalizeOptional = (value: unknown): boolean => value === true;

const normalizeText = (value: unknown): string =>
  typeof value === "string" ? value : "";

const normalizeFeatures = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((feature): feature is string => typeof feature === "string")
    : [];

const normalizePrice = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/** Course fields the Bundle owns. Lifecycle status is deliberately absent. */
const courseFieldsFromBundle = (bundle: CourseBundle) => ({
  name: bundle.course.title,
  slug: bundle.course.slug,
  description: bundle.course.description,
  coverImageURL: bundle.course.coverImageURL,
  meta: normalizeText(bundle.course.meta),
  roadmap: bundle.course.roadmap,
  difficultyLevel: bundle.course.difficulty,
  isPremium: normalizeOptional(bundle.course.isPremium),
  price: normalizePrice(bundle.course.price),
  features: normalizeFeatures(bundle.course.features),
});

const courseMetadataChanged = (
  course: CourseModel,
  bundle: CourseBundle,
): boolean => {
  const next = courseFieldsFromBundle(bundle);

  return (
    normalizeText(course.name) !== normalizeText(next.name) ||
    normalizeText(course.description) !== normalizeText(next.description) ||
    normalizeText(course.coverImageURL) !== normalizeText(next.coverImageURL) ||
    normalizeText(course.meta) !== next.meta ||
    course.roadmap !== next.roadmap ||
    course.difficultyLevel !== next.difficultyLevel ||
    normalizeOptional(course.isPremium) !== next.isPremium ||
    normalizePrice(course.price) !== next.price ||
    normalizeFeatures(course.features).join("\u0000") !==
      next.features.join("\u0000")
  );
};

const chapterChanged = (
  stored: CourseChapterModel,
  bundleChapter: CourseBundleChapter,
): boolean =>
  normalizeText(stored.name) !== normalizeText(bundleChapter.title) ||
  normalizeText(stored.content) !== normalizeText(bundleChapter.content) ||
  normalizeOptional(stored.isOptional) !==
    normalizeOptional(bundleChapter.isOptional);

/** Plain object for a brand new chapter — Mongoose assigns its `_id`. */
const newStoredChapter = (chapter: CourseBundleChapter): StoredChapter => ({
  key: chapter.chapterKey,
  name: chapter.title,
  content: chapter.content,
  isOptional: normalizeOptional(chapter.isOptional),
});

/** The stored chapter as a plain object, `_id` and timestamps included. */
const storedChapterAsIs = (stored: CourseChapterModel): StoredChapter =>
  ((
    stored as unknown as { toObject?: () => Record<string, unknown> }
  ).toObject?.() ??
    (stored as unknown as Record<string, unknown>)) as StoredChapter;

/**
 * Carries the whole stored chapter forward — including `_id` and timestamps —
 * and only overwrites the fields the Bundle owns.
 */
const mergedStoredChapter = (
  stored: CourseChapterModel,
  chapter: CourseBundleChapter,
): StoredChapter => ({
  ...storedChapterAsIs(stored),
  key: stored.key,
  name: chapter.title,
  content: chapter.content,
  isOptional: normalizeOptional(chapter.isOptional),
});

/**
 * Keys whose position relative to the other keys present on both sides moved.
 * Appending or orphaning a chapter therefore never reports a false reorder.
 */
const reorderedKeys = (
  storedKeys: string[],
  bundleKeys: string[],
): string[] => {
  const bundleKeySet = new Set(bundleKeys);
  const storedKeySet = new Set(storedKeys);

  const sharedStored = storedKeys.filter((key) => bundleKeySet.has(key));
  const sharedBundle = bundleKeys.filter((key) => storedKeySet.has(key));

  return sharedBundle.filter((key, index) => sharedStored[index] !== key);
};

const importCourseBundleToDB = async ({
  bundle,
  dryRun = false,
}: ImportCourseBundleOptions): Promise<DatabaseQueryResponseType> => {
  try {
    const slug = bundle.course.slug;
    const course = await Course.findOne({ slug });

    const bundleKeys = bundle.chapters.map((chapter) => chapter.chapterKey);

    /* ---------------------------------------------------------------- */
    /*  No course for this slug: Import creates it as a Draft.           */
    /* ---------------------------------------------------------------- */
    if (!course) {
      const report: CourseBundleImportReport = {
        dryRun,
        slug,
        courseId: null,
        course: "CREATED",
        chaptersAdded: bundleKeys,
        chaptersUpdated: [],
        chaptersReordered: [],
        chaptersOrphaned: [],
      };

      if (dryRun) return { data: report };

      const created = await Course.create({
        ...courseFieldsFromBundle(bundle),
        price: normalizePrice(bundle.course.price) ?? undefined,
        liveOn: new Date(),
        status: COURSE_STATUS_DEFAULT,
        chapters: bundle.chapters.map(newStoredChapter),
      });

      return {
        data: { ...report, courseId: created._id.toString() },
      };
    }

    /* ---------------------------------------------------------------- */
    /*  Existing course: reconcile by Chapter Key, never by position.    */
    /* ---------------------------------------------------------------- */
    const storedChapters = course.chapters ?? [];
    const storedByKey = new Map<string, CourseChapterModel>(
      storedChapters.map((chapter) => [chapter.key, chapter]),
    );
    const storedKeys = storedChapters.map((chapter) => chapter.key);

    const chaptersAdded: string[] = [];
    const chaptersUpdated: string[] = [];
    const nextChapters: StoredChapter[] = [];

    for (const bundleChapter of bundle.chapters) {
      const stored = storedByKey.get(bundleChapter.chapterKey);

      if (!stored) {
        chaptersAdded.push(bundleChapter.chapterKey);
        nextChapters.push(newStoredChapter(bundleChapter));
        continue;
      }

      if (chapterChanged(stored, bundleChapter)) {
        chaptersUpdated.push(bundleChapter.chapterKey);
      }
      nextChapters.push(mergedStoredChapter(stored, bundleChapter));
    }

    // Orphans keep their relative order and are appended untouched.
    const bundleKeySet = new Set(bundleKeys);
    const chaptersOrphaned = storedKeys.filter((key) => !bundleKeySet.has(key));
    for (const key of chaptersOrphaned) {
      const stored = storedByKey.get(key);
      if (stored) nextChapters.push(storedChapterAsIs(stored));
    }

    const chaptersReordered = reorderedKeys(storedKeys, bundleKeys);
    const metadataChanged = courseMetadataChanged(course, bundle);

    const changed =
      metadataChanged ||
      chaptersAdded.length > 0 ||
      chaptersUpdated.length > 0 ||
      chaptersReordered.length > 0;

    const report: CourseBundleImportReport = {
      dryRun,
      slug,
      courseId: course._id.toString(),
      course: changed ? "UPDATED" : "UNCHANGED",
      chaptersAdded,
      chaptersUpdated,
      chaptersReordered,
      chaptersOrphaned,
    };

    // Nothing to do: a re-import of an unchanged Bundle writes nothing.
    if (dryRun || !changed) return { data: report };

    const nextCourseFields = courseFieldsFromBundle(bundle);
    course.name = nextCourseFields.name;
    course.description = nextCourseFields.description;
    course.coverImageURL = nextCourseFields.coverImageURL;
    course.meta = nextCourseFields.meta;
    course.roadmap = nextCourseFields.roadmap;
    course.difficultyLevel = nextCourseFields.difficultyLevel;
    course.isPremium = nextCourseFields.isPremium;
    // A Bundle without a price must clear a stale stored price, otherwise the
    // next import would keep reporting the same difference forever.
    course.set("price", nextCourseFields.price ?? undefined);
    course.features = nextCourseFields.features;
    // `status` and `slug` are deliberately left alone: Import can never
    // publish, unpublish or re-address an existing course.

    course.set("chapters", nextChapters);
    await course.save();

    return { data: report };
  } catch (error) {
    logger.error("DB: importCourseBundleToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while importing course bundle", details: error };
  }
};

/**
 * Turns an existing Course back into a Bundle. The output is exactly what
 * Import expects, so exporting and immediately re-importing is a no-op.
 */
const exportCourseBundleFromDB = async (
  slug: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await Course.findOne({ slug });

    if (!course) return { error: "Course not found" };

    const price = normalizePrice(course.price);
    const meta = normalizeText(course.meta);
    const features = normalizeFeatures(course.features);

    const bundle: CourseBundle = {
      schemaVersion: "shiksha-course@1",
      course: {
        slug: course.slug,
        title: normalizeText(course.name),
        description: normalizeText(course.description),
        coverImageURL: normalizeText(course.coverImageURL),
        ...(meta ? { meta } : {}),
        roadmap: course.roadmap as CourseBundle["course"]["roadmap"],
        difficulty:
          course.difficultyLevel as CourseBundle["course"]["difficulty"],
        isPremium: normalizeOptional(course.isPremium),
        ...(price === null ? {} : { price }),
        ...(features.length ? { features } : {}),
      },
      chapters: (course.chapters ?? []).map((chapter) => ({
        chapterKey: chapter.key,
        title: normalizeText(chapter.name),
        content: normalizeText(chapter.content),
        isOptional: normalizeOptional(chapter.isOptional),
      })),
    };

    return { data: bundle };
  } catch (error) {
    logger.error("DB: exportCourseBundleFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while exporting course bundle", details: error };
  }
};

export { exportCourseBundleFromDB, importCourseBundleToDB };
