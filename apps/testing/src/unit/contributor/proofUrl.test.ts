import { describe, expect, it } from "vitest";

import type { ProofKind } from "@/lib/contributor/proofUrl";
import { classify } from "@/lib/contributor/proofUrl";

describe("proof URL classifier", () => {
  const cases: Array<{
    url: string;
    kind: ProofKind;
    canonicalUrl: string;
  }> = [
    {
      url: "https://github.com/The-Boring-Education/TBE-Web/pull/1344",
      kind: "github_pr",
      canonicalUrl: "https://github.com/The-Boring-Education/TBE-Web/pull/1344",
    },
    {
      url: "https://github.com/The-Boring-Education/TBE-Web/issues/1344",
      kind: "github_issue",
      canonicalUrl:
        "https://github.com/The-Boring-Education/TBE-Web/issues/1344",
    },
    {
      url: "https://twitter.com/tbe/status/123",
      kind: "tweet",
      canonicalUrl: "https://twitter.com/tbe/status/123",
    },
    {
      url: "https://x.com/tbe/status/123",
      kind: "tweet",
      canonicalUrl: "https://x.com/tbe/status/123",
    },
    {
      url: "https://www.linkedin.com/posts/tbe-activity-123",
      kind: "linkedin",
      canonicalUrl: "https://www.linkedin.com/posts/tbe-activity-123",
    },
    {
      url: "https://www.youtube.com/watch?v=abc123",
      kind: "youtube",
      canonicalUrl: "https://www.youtube.com/watch?v=abc123",
    },
    {
      url: "https://youtu.be/abc123",
      kind: "youtube",
      canonicalUrl: "https://youtu.be/abc123",
    },
    {
      url: "https://drive.google.com/file/d/abc123/view",
      kind: "drive",
      canonicalUrl: "https://drive.google.com/file/d/abc123/view",
    },
    {
      url: "https://theboringeducation.com/blog/my-post",
      kind: "blog",
      canonicalUrl: "https://theboringeducation.com/blog/my-post",
    },
    {
      url: "  https://theboringeducation.com/blog/my-post/  ",
      kind: "blog",
      canonicalUrl: "https://theboringeducation.com/blog/my-post",
    },
  ];

  it.each(cases)("classifies $url as $kind", ({ url, kind, canonicalUrl }) => {
    const result = classify(url);
    expect(result.kind).toBe(kind);
    expect(result.canonicalUrl).toBe(canonicalUrl);
    expect(result.warnings).toEqual([]);
  });

  it("returns the owner/repo/number parts for a pull request", () => {
    expect(
      classify("https://github.com/The-Boring-Education/TBE-Web/pull/1344")
        .parts,
    ).toEqual({
      owner: "The-Boring-Education",
      repo: "TBE-Web",
      number: 1344,
    });
  });

  it("does not return parts for non pull request links", () => {
    expect(
      classify("https://github.com/The-Boring-Education/TBE-Web/issues/1344")
        .parts,
    ).toBeUndefined();
    expect(classify("https://theboringeducation.com").parts).toBeUndefined();
  });

  it("strips query and fragment from a github proof", () => {
    const result = classify(
      "https://github.com/The-Boring-Education/TBE-Web/pull/1344?diff=split#discussion_r1",
    );
    expect(result.kind).toBe("github_pr");
    expect(result.canonicalUrl).toBe(
      "https://github.com/The-Boring-Education/TBE-Web/pull/1344",
    );
  });

  it("classifies a github repo root as a blog link", () => {
    expect(
      classify("https://github.com/The-Boring-Education/TBE-Web").kind,
    ).toBe("blog");
  });

  it("warns on an empty string", () => {
    const result = classify("   ");
    expect(result.kind).toBe("other");
    expect(result.canonicalUrl).toBe("");
    expect(result.warnings).toHaveLength(1);
  });

  it("warns on non-URL text instead of throwing", () => {
    const result = classify("i did the thing, promise");
    expect(result.kind).toBe("other");
    expect(result.canonicalUrl).toBe("i did the thing, promise");
    expect(result.warnings).toHaveLength(1);
  });

  it("warns on an unsupported scheme", () => {
    const result = classify("ftp://example.com/proof.txt");
    expect(result.kind).toBe("other");
    expect(result.warnings).toHaveLength(1);
  });
});
