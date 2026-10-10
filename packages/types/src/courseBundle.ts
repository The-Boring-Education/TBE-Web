/**
 * Course Bundle — the versioned JSON document that fully describes one
 * Shiksha Course and all of its Chapters.
 *
 * It is the single contract shared by every producer of course content:
 * the Admin Course Builder, the generation agent and community contributors
 * opening a pull request.
 *
 * Course Lifecycle Status is deliberately NOT part of the Bundle: publishing
 * is an operational decision, not content, so importing a correction can never
 * accidentally publish or unpublish a course.
 */

import type { DifficultyType } from "./database";

/** Schema version discriminator carried by every Bundle. */
export type CourseBundleSchemaVersion = "shiksha-course@1";

/** Roadmaps a course bundle can belong to. */
export type CourseBundleRoadmap =
  "Frontend" | "Backend" | "Fullstack" | "Tech" | "DSA" | "AI" | "Data" | "GTM";

/** Difficulty of a course bundle. */
export type CourseBundleDifficulty = DifficultyType;

/** Role a contributor played on a course or chapter. */
export type CreditRole = "AUTHOR" | "CO_AUTHOR" | "REVIEWER" | "EDITOR";

/**
 * A single credit entry. Avatars are derived from the GitHub handle at render
 * time and are never stored.
 */
export interface Credit {
  githubHandle: string;
  displayName: string;
  role: CreditRole;
}

/** One chapter inside a Course Bundle. */
export interface CourseBundleChapter {
  chapterKey: string;
  title: string;
  content: string;
  isOptional?: boolean;
  credits?: Credit[];
}

/** Course metadata carried by a Course Bundle (no lifecycle status). */
export interface CourseBundleCourse {
  slug: string;
  title: string;
  description: string;
  coverImageURL: string;
  meta?: string;
  roadmap: CourseBundleRoadmap;
  difficulty: CourseBundleDifficulty;
  isPremium?: boolean;
  price?: number;
  features?: string[];
  credits?: Credit[];
}

/** The full, versioned Course Bundle document. */
export interface CourseBundle {
  schemaVersion: CourseBundleSchemaVersion;
  course: CourseBundleCourse;
  chapters: CourseBundleChapter[];
}

/** A single field-level validation problem. */
export interface CourseBundleValidationError {
  field: string;
  message: string;
}

/** Result of validating unknown input against the Course Bundle contract. */
export type CourseBundleValidationResult =
  | { valid: true; bundle: CourseBundle }
  | { valid: false; errors: CourseBundleValidationError[] };
