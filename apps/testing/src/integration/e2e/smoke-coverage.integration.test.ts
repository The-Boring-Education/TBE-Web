import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const E2E_ROOT = path.resolve(__dirname, "../../e2e");
/** Must match smoke rollout in docs/code-stability.md §5 (one smoke spec folder per app). */
const REQUIRED_APPS = [
  "platform",
  "prep-yatra",
  "quizes",
  "dsayatra",
  "oncampus",
  "techyatra",
  "resume-yatra",
  "onboarding",
] as const;

function listSpecFiles(appFolder: string): string[] {
  const target = path.join(E2E_ROOT, appFolder);
  if (!fs.existsSync(target)) return [];

  return fs
    .readdirSync(target)
    .filter((entry) => entry.endsWith(".spec.ts"))
    .map((entry) => path.join(target, entry));
}

function countTestsInFile(filePath: string): number {
  const source = fs.readFileSync(filePath, "utf8");
  const directTests = source.match(/\btest\(/g)?.length ?? 0;
  const skipTests = source.match(/\btest\.skip\(/g)?.length ?? 0;
  return directTests + skipTests;
}

describe("e2e smoke coverage contract (integration)", () => {
  it("has at least one smoke spec for each required app", () => {
    for (const app of REQUIRED_APPS) {
      const specs = listSpecFiles(app);
      expect(specs.length, `Missing .spec.ts for ${app}`).toBeGreaterThan(0);
    }
  });

  it("keeps a minimum of 10 smoke tests across required apps", () => {
    const totalTests = REQUIRED_APPS.reduce((sum, app) => {
      const appTests = listSpecFiles(app)
        .map((specPath) => countTestsInFile(specPath))
        .reduce((appSum, count) => appSum + count, 0);

      return sum + appTests;
    }, 0);

    expect(totalTests).toBeGreaterThanOrEqual(10);
  });
});
