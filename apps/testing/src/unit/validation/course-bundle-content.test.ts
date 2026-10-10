import fs from "node:fs";
import path from "node:path";

import { validateCourseBundle } from "@tbe/utils/courseBundle";
import { describe, expect, it } from "vitest";

const CONTENT_DIR = path.resolve(__dirname, "../../../../../content/shiksha");

const bundleFiles = fs.existsSync(CONTENT_DIR)
  ? fs
      .readdirSync(CONTENT_DIR)
      .filter((file) => file.endsWith(".json"))
      .sort()
  : [];

describe("content/shiksha Course Bundles", () => {
  it("has a content directory for contributed bundles", () => {
    expect(fs.existsSync(CONTENT_DIR)).toBe(true);
  });

  it("ships at least one worked example bundle", () => {
    expect(bundleFiles.length).toBeGreaterThan(0);
  });

  bundleFiles.forEach((file) => {
    it(`validates ${file}`, () => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const result = validateCourseBundle(JSON.parse(raw));

      if (!result.valid) {
        throw new Error(
          `${file} is not a valid Course Bundle:\n${result.errors
            .map((error) => `  - ${error.field}: ${error.message}`)
            .join("\n")}`,
        );
      }

      expect(`${result.bundle.course.slug}.json`).toBe(file);
    });
  });
});
