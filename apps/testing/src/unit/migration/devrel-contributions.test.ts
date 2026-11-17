/**
 * Guards the pure mapping rules used by the
 * `completionTracking → Contribution` migration
 * (docs/contributors/01-data-model.md).
 */
import {
  legacyProofKind,
  legacyProofUrl,
  mapLegacyStatus,
} from "@api/lib/migration/devrel-contributions";
import { describe, expect, it } from "vitest";

describe("mapLegacyStatus", () => {
  it("maps completed + approved to approved", () => {
    expect(
      mapLegacyStatus({ status: "completed", reviewStatus: "approved" }),
    ).toBe("approved");
  });

  it("maps completed + needs_revision to changes_requested", () => {
    expect(
      mapLegacyStatus({ status: "completed", reviewStatus: "needs_revision" }),
    ).toBe("changes_requested");
  });

  it("maps completed without a decision to pending", () => {
    expect(mapLegacyStatus({ status: "completed" })).toBe("pending");
    expect(
      mapLegacyStatus({ status: "completed", reviewStatus: "pending" }),
    ).toBe("pending");
  });

  it("maps in_progress to pending", () => {
    expect(mapLegacyStatus({ status: "in_progress" })).toBe("pending");
  });

  it.each(["pending", "overdue", undefined])("drops %s entries", (status) => {
    expect(mapLegacyStatus({ status })).toBeNull();
  });
});

describe("legacyProofUrl", () => {
  it("uses the legacy submission URL when present", () => {
    expect(
      legacyProofUrl(
        { submissionUrl: " https://github.com/org/repo/pull/7 " },
        "task1",
        "lead1",
      ),
    ).toBe("https://github.com/org/repo/pull/7");
  });

  it("falls back to a stable per-task, per-lead placeholder", () => {
    expect(legacyProofUrl({}, "task1", "lead1")).toBe(
      "legacy://devrel-task/task1/lead/lead1",
    );
    expect(legacyProofUrl({ submissionUrl: "  " }, "task1", "lead2")).toBe(
      "legacy://devrel-task/task1/lead/lead2",
    );
  });
});

describe("legacyProofKind", () => {
  it("detects GitHub pull requests and issues", () => {
    expect(legacyProofKind("https://github.com/org/repo/pull/7")).toBe(
      "github_pr",
    );
    expect(legacyProofKind("https://github.com/org/repo/issues/7")).toBe(
      "github_issue",
    );
  });

  it("falls back to other for anything else", () => {
    expect(legacyProofKind("https://blog.example.com/post")).toBe("other");
    expect(legacyProofKind("https://github.com/org/repo")).toBe("other");
    expect(legacyProofKind("legacy://devrel-task/task1/lead/lead1")).toBe(
      "other",
    );
    expect(legacyProofKind("not a url")).toBe("other");
  });

  it("is not fooled by lookalike hosts", () => {
    expect(legacyProofKind("https://github.com.evil.dev/org/repo/pull/7")).toBe(
      "other",
    );
  });
});
