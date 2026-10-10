/**
 * Pure validator for the Course Bundle contract.
 *
 * Intentionally free of database, network, filesystem and framework imports:
 * the import endpoint, the CI job that validates contributed files and the
 * Admin importer pre-flight check all call this same synchronous function.
 *
 * Errors accumulate instead of stopping at the first problem so a contributor
 * sees everything wrong with their file in a single pass.
 */

import type {
  CourseBundle,
  CourseBundleDifficulty,
  CourseBundleRoadmap,
  CourseBundleValidationError,
  CourseBundleValidationResult,
  CreditRole,
} from "@tbe/types";

export const COURSE_BUNDLE_SCHEMA_VERSION = "shiksha-course@1";

export const COURSE_BUNDLE_ROADMAPS: CourseBundleRoadmap[] = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Tech",
  "DSA",
  "AI",
  "Data",
  "GTM",
];

export const COURSE_BUNDLE_DIFFICULTIES: CourseBundleDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export const CREDIT_ROLES: CreditRole[] = [
  "AUTHOR",
  "CO_AUTHOR",
  "REVIEWER",
  "EDITOR",
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHAPTER_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GITHUB_HANDLE_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validateRequiredString = (
  value: unknown,
  field: string,
  errors: CourseBundleValidationError[],
): boolean => {
  if (value === undefined || value === null || value === "") {
    errors.push({ field, message: `${field} is required` });
    return false;
  }
  if (!isNonEmptyString(value)) {
    errors.push({ field, message: `${field} must be a non-empty string` });
    return false;
  }
  return true;
};

const validateOptionalString = (
  value: unknown,
  field: string,
  errors: CourseBundleValidationError[],
) => {
  if (value === undefined) return;
  if (typeof value !== "string") {
    errors.push({ field, message: `${field} must be a string` });
  }
};

const validateOptionalBoolean = (
  value: unknown,
  field: string,
  errors: CourseBundleValidationError[],
) => {
  if (value === undefined) return;
  if (typeof value !== "boolean") {
    errors.push({ field, message: `${field} must be a boolean` });
  }
};

const validateCredits = (
  value: unknown,
  field: string,
  errors: CourseBundleValidationError[],
) => {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array` });
    return;
  }

  value.forEach((credit, index) => {
    const creditField = `${field}[${index}]`;
    if (!isPlainObject(credit)) {
      errors.push({
        field: creditField,
        message: `${creditField} must be an object`,
      });
      return;
    }

    const hasHandle = validateRequiredString(
      credit.githubHandle,
      `${creditField}.githubHandle`,
      errors,
    );
    if (
      hasHandle &&
      !GITHUB_HANDLE_PATTERN.test(credit.githubHandle as string)
    ) {
      errors.push({
        field: `${creditField}.githubHandle`,
        message: `${creditField}.githubHandle must be a valid GitHub handle`,
      });
    }

    validateRequiredString(
      credit.displayName,
      `${creditField}.displayName`,
      errors,
    );

    if (credit.role === undefined) {
      errors.push({
        field: `${creditField}.role`,
        message: `${creditField}.role is required`,
      });
    } else if (!CREDIT_ROLES.includes(credit.role as CreditRole)) {
      errors.push({
        field: `${creditField}.role`,
        message: `${creditField}.role must be one of ${CREDIT_ROLES.join(", ")}`,
      });
    }
  });
};

const validateCourse = (
  value: unknown,
  errors: CourseBundleValidationError[],
) => {
  if (!isPlainObject(value)) {
    errors.push({
      field: "course",
      message:
        value === undefined ? "course is required" : "course must be an object",
    });
    return;
  }

  if (validateRequiredString(value.slug, "course.slug", errors)) {
    if (!SLUG_PATTERN.test(value.slug as string)) {
      errors.push({
        field: "course.slug",
        message:
          "course.slug must be lowercase alphanumeric words separated by single hyphens",
      });
    }
  }

  validateRequiredString(value.title, "course.title", errors);
  validateRequiredString(value.description, "course.description", errors);
  validateRequiredString(value.coverImageURL, "course.coverImageURL", errors);
  validateOptionalString(value.meta, "course.meta", errors);

  if (value.roadmap === undefined) {
    errors.push({
      field: "course.roadmap",
      message: "course.roadmap is required",
    });
  } else if (
    !COURSE_BUNDLE_ROADMAPS.includes(value.roadmap as CourseBundleRoadmap)
  ) {
    errors.push({
      field: "course.roadmap",
      message: `course.roadmap must be one of ${COURSE_BUNDLE_ROADMAPS.join(", ")}`,
    });
  }

  if (value.difficulty === undefined) {
    errors.push({
      field: "course.difficulty",
      message: "course.difficulty is required",
    });
  } else if (
    !COURSE_BUNDLE_DIFFICULTIES.includes(
      value.difficulty as CourseBundleDifficulty,
    )
  ) {
    errors.push({
      field: "course.difficulty",
      message: `course.difficulty must be one of ${COURSE_BUNDLE_DIFFICULTIES.join(", ")}`,
    });
  }

  validateOptionalBoolean(value.isPremium, "course.isPremium", errors);

  if (value.price !== undefined) {
    if (
      typeof value.price !== "number" ||
      !Number.isFinite(value.price) ||
      value.price < 0
    ) {
      errors.push({
        field: "course.price",
        message: "course.price must be a non-negative number",
      });
    }
  }

  if (value.isPremium === true) {
    if (value.price === undefined) {
      errors.push({
        field: "course.price",
        message: "course.price is required for a premium course",
      });
    } else if (typeof value.price === "number" && value.price <= 0) {
      errors.push({
        field: "course.price",
        message: "course.price must be greater than 0 for a premium course",
      });
    }
  }

  if (value.features !== undefined) {
    if (!Array.isArray(value.features)) {
      errors.push({
        field: "course.features",
        message: "course.features must be an array",
      });
    } else {
      value.features.forEach((feature, index) => {
        if (!isNonEmptyString(feature)) {
          errors.push({
            field: `course.features[${index}]`,
            message: `course.features[${index}] must be a non-empty string`,
          });
        }
      });
    }
  }

  validateCredits(value.credits, "course.credits", errors);
};

const validateChapters = (
  value: unknown,
  errors: CourseBundleValidationError[],
) => {
  if (value === undefined) {
    errors.push({ field: "chapters", message: "chapters is required" });
    return;
  }
  if (!Array.isArray(value)) {
    errors.push({ field: "chapters", message: "chapters must be an array" });
    return;
  }
  if (value.length === 0) {
    errors.push({
      field: "chapters",
      message: "chapters must contain at least one chapter",
    });
    return;
  }

  const seenKeys = new Set<string>();

  value.forEach((chapter, index) => {
    const field = `chapters[${index}]`;
    if (!isPlainObject(chapter)) {
      errors.push({ field, message: `${field} must be an object` });
      return;
    }

    if (
      validateRequiredString(chapter.chapterKey, `${field}.chapterKey`, errors)
    ) {
      const chapterKey = chapter.chapterKey as string;
      if (!CHAPTER_KEY_PATTERN.test(chapterKey)) {
        errors.push({
          field: `${field}.chapterKey`,
          message: `${field}.chapterKey must be lowercase alphanumeric words separated by single hyphens`,
        });
      } else if (seenKeys.has(chapterKey)) {
        errors.push({
          field: `${field}.chapterKey`,
          message: `${field}.chapterKey "${chapterKey}" is duplicated in this bundle`,
        });
      } else {
        seenKeys.add(chapterKey);
      }
    }

    validateRequiredString(chapter.title, `${field}.title`, errors);
    validateRequiredString(chapter.content, `${field}.content`, errors);
    validateOptionalBoolean(chapter.isOptional, `${field}.isOptional`, errors);
    validateCredits(chapter.credits, `${field}.credits`, errors);
  });
};

/**
 * Validates unknown input against the Course Bundle contract.
 * Returns the typed Bundle when valid, or every field-level error found.
 */
export const validateCourseBundle = (
  input: unknown,
): CourseBundleValidationResult => {
  const errors: CourseBundleValidationError[] = [];

  if (!isPlainObject(input)) {
    return {
      valid: false,
      errors: [{ field: "root", message: "Bundle must be an object" }],
    };
  }

  if (input.schemaVersion === undefined) {
    errors.push({
      field: "schemaVersion",
      message: "schemaVersion is required",
    });
  } else if (input.schemaVersion !== COURSE_BUNDLE_SCHEMA_VERSION) {
    errors.push({
      field: "schemaVersion",
      message: `schemaVersion must be "${COURSE_BUNDLE_SCHEMA_VERSION}"`,
    });
  }

  validateCourse(input.course, errors);
  validateChapters(input.chapters, errors);

  if (errors.length > 0) return { valid: false, errors };

  return { valid: true, bundle: input as unknown as CourseBundle };
};
