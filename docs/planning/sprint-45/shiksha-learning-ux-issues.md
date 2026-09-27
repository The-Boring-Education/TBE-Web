# Shiksha Learning UX: Issue Breakdown

Rationale and evidence for the vertical slices derived from the
[Shiksha learning UX PRD](shiksha-learning-ux.md), following a source-inspection
pass over the Shiksha learning page and its dependencies.

These slices were published to GitHub on 2026-09-27 under epic
[#1291](https://github.com/The-Boring-Education/TBE-Web/issues/1291), by direct
authorization overriding the sprint packet's issue-publication gate. That gate
still governs the remaining sprint-45 specifications.

The issue bodies live in [issues/](issues/README.md), one file per slice, kept
alongside the published issues. This document explains why they are shaped and
ordered the way they are; it does not repeat their contents.

This breakdown supersedes S3, S4, and S5 in [issue-briefs.md](issue-briefs.md).
Those briefs assumed no blockers and assumed the described behaviors were
unbuilt. Inspection contradicted both assumptions.

## Evidence Base and Its Limits

Inspection was performed on `docs/sprint-45-product-specs`, cut from
`origin/development` at `f39f8ed2b`. Leaderboard PR #1279 merged to
`development` on 2026-09-25, after that cut, and introduced award-tracking
models absent from the inspected tree. Award-related findings are therefore
stated as observable behavior rather than as code paths, and L1 must be
re-verified against current `development` before implementation begins.

## What the PRD Got Wrong

Three PRD acceptance checks already pass on the inspected tree and must not be
re-implemented. They survive in L3 as regression tests only:

- Repeated clicks during a pending save already cannot issue duplicate mutations. The shared Button disables itself while loading.
- A completion response already applies to the chapter captured at click time. The handler closes over the chapter identity from the click, so the originating chapter is updated regardless of later navigation.
- Chapter selection already appears in the URL and survives refresh. Chapter links are real navigations carrying the chapter identifier.

Two behaviors are worse than the PRD describes:

- The invariant "navigation alone performs no enrollment, completion, or certificate writes" is violated today, not preserved. Post-completion navigation issues real award requests, repeatedly. See L1.
- The in-content enrollment path is not merely unclear. It is simulated client-side, unlocks the page without recording anything, and leaves the learner permanently unable to save progress. See L3.

The PRD proposed publishing this work as enhancement slices. Four of the six are
defects: they describe behavior that is wrong today, not behavior that is
missing. The issue files categorize them accordingly.

## Queue

| ID  | Issue                                                                                        | Category    | Type | Blocked By | User Stories |
| --- | -------------------------------------------------------------------------------------------- | ----------- | ---- | ---------- | ------------ |
| LA  | [#1292 Honor or remove the ignored Button disabled prop](issues/la-button-disabled-prop.md)  | bug         | AFK  | None       | Incidental   |
| L1  | [#1293 Award course completion exactly once](issues/l1-award-completion-once.md)             | bug         | AFK  | None       | 7, 12        |
| L2  | [#1294 Resolve chapter selection server-side](issues/l2-chapter-resolution.md)               | bug         | AFK  | #1293      | 1, 2, 3      |
| L3  | [#1295 Real enrollment and visible save failures](issues/l3-enrollment-and-save-feedback.md) | bug         | AFK  | #1293      | 4, 5, 6, 11  |
| L4  | [#1296 Accessible mobile chapter drawer](issues/l4-accessible-chapter-drawer.md)             | enhancement | AFK  | #1294      | 8, 9         |
| L5  | [#1297 Contain long content on narrow viewports](issues/l5-contain-long-content.md)          | enhancement | AFK  | #1296      | 10           |

Story 13 (maintainer coverage) is satisfied by the test obligations inside each
slice rather than by a slice of its own.

## Why the Chain Is Sequential

L1 through L5 all modify the same page component and are deliberately chained
rather than parallelized. Decomposing that component into smaller pieces first
was considered and rejected: the refactor would put the enrollment, completion,
and certificate contracts the PRD asks us to preserve at risk inside a single
large diff, which is precisely the failure mode the PRD was written to avoid.

L1 leads because the effect it fixes is adjacent to the code every other slice
touches, and because shipping the others first would have them inherit and
entrench the award defect.

L4 is blocked on L2 rather than on L1 because the shared chapter list component
needs a per-chapter destination, and its shape depends on the URL contract L2
settles.

LA touches a shared package only and can proceed in parallel with any of them.

## Rollout Gates

Approve this breakdown, re-verify L1 against current `development`, run the
existing Shiksha course tests plus the added regressions, and review desktop and
mobile screenshots. Keep visual redesign out of these pull requests unless a
reviewed design is supplied.
