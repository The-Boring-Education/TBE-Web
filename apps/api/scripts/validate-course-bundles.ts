/**
 * Validates community-contributed Course Bundle files against the Course
 * Bundle contract.
 *
 * Runs in CI on every pull request that touches `content/shiksha/`, and can be
 * run locally with `pnpm validate:course-bundles` before opening the pull
 * request. It reuses `validateCourseBundle`, so a contributor sees exactly the
 * same field-level errors the importer would report.
 *
 * Usage:
 *   tsx scripts/validate-course-bundles.ts [file ...]
 *
 * With no arguments every `*.json` file in `content/shiksha/` is validated.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { validateCourseBundle } from "@tbe/utils/courseBundle";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const CONTENT_DIR = path.join(REPO_ROOT, "content", "shiksha");

const listBundleFiles = (): string[] => {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => path.join(CONTENT_DIR, file));
};

const relative = (filePath: string) => path.relative(REPO_ROOT, filePath);

const validateFile = (filePath: string): boolean => {
  const displayPath = relative(filePath);

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    console.error(`❌ ${displayPath}\n   - file: unable to read file`);
    return false;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${displayPath}\n   - file: invalid JSON — ${message}`);
    return false;
  }

  const result = validateCourseBundle(parsed);
  if (!result.valid) {
    const details = result.errors
      .map((error) => `   - ${error.field}: ${error.message}`)
      .join("\n");
    console.error(`❌ ${displayPath}\n${details}`);
    return false;
  }

  const expectedFileName = `${result.bundle.course.slug}.json`;
  if (path.basename(filePath) !== expectedFileName) {
    console.error(
      `❌ ${displayPath}\n   - course.slug: file must be named "${expectedFileName}" to match course.slug "${result.bundle.course.slug}"`,
    );
    return false;
  }

  console.log(
    `✅ ${displayPath} (${result.bundle.chapters.length} chapter${
      result.bundle.chapters.length === 1 ? "" : "s"
    })`,
  );
  return true;
};

const main = () => {
  const args = process.argv.slice(2);
  const files = (
    args.length > 0 ? args.map((file) => path.resolve(REPO_ROOT, file)) : []
  ).filter((file) => file.startsWith(CONTENT_DIR) && file.endsWith(".json"));

  const targets = args.length > 0 ? files : listBundleFiles();

  if (targets.length === 0) {
    console.log("No Course Bundle files to validate.");
    return;
  }

  console.log(`Validating ${targets.length} Course Bundle file(s)...\n`);

  const failed = targets.filter((file) => !validateFile(file));

  if (failed.length > 0) {
    console.error(
      `\n${failed.length} of ${targets.length} Course Bundle file(s) failed validation.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll ${targets.length} Course Bundle file(s) are valid.`);
};

main();
