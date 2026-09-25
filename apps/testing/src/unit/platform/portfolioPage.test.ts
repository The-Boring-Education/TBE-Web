/**
 * @vitest-environment node
 */
import { getSEOMeta, routes } from "@tbe/constants";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("Platform portfolio page", () => {
  const pagesDir = path.resolve(__dirname, "../../../../platform/src/pages");

  it("has a page file serving the /portfolio route", () => {
    const candidates = [
      path.join(pagesDir, "portfolio.tsx"),
      path.join(pagesDir, "portfolio", "index.tsx"),
    ];

    expect(candidates.some((candidate) => fs.existsSync(candidate))).toBe(true);
  });

  it("prefetches SEO meta for the portfolio route", () => {
    const pageContent = fs.readFileSync(
      path.join(pagesDir, "portfolio.tsx"),
      "utf-8",
    );

    expect(pageContent).toContain("getPreFetchProps");
    expect(pageContent).toContain("routes.portfolio");
    expect(getSEOMeta(routes.portfolio, "platform")).toBeDefined();
  });
});
