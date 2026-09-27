# Shiksha Learning UX: Ready-to-Publish Issues

One file per vertical slice, written as the issue body to publish verbatim. No
GitHub issues are opened by this directory; Sprint 45 keeps issue publication
gated, so these are staged here until that gate lifts.

Rationale, evidence, and the record of what the PRD got wrong live in the
[issue breakdown](../shiksha-learning-ux-issues.md). Source requirements live in
the [Shiksha learning UX PRD](../shiksha-learning-ux.md). Read the breakdown
before publishing; it explains why the chain is ordered this way.

## Queue

| ID  | Issue                                                                           | Category    | Type | Blocked By | Proposed Labels                |
| --- | ------------------------------------------------------------------------------- | ----------- | ---- | ---------- | ------------------------------ |
| LA  | [Honor or remove the ignored Button disabled prop](la-button-disabled-prop.md)  | bug         | AFK  | None       | `bug`, `ready-for-agent`       |
| L1  | [Award course completion exactly once](l1-award-completion-once.md)             | bug         | AFK  | None       | `bug`, `ready-for-agent`       |
| L2  | [Resolve chapter selection server-side](l2-chapter-resolution.md)               | bug         | AFK  | L1         | `bug`                          |
| L3  | [Real enrollment and visible save failures](l3-enrollment-and-save-feedback.md) | bug         | AFK  | L1         | `bug`                          |
| L4  | [Accessible mobile chapter drawer](l4-accessible-chapter-drawer.md)             | enhancement | AFK  | L2         | `enhancement`, `accessibility` |
| L5  | [Contain long content on narrow viewports](l5-contain-long-content.md)          | enhancement | AFK  | L4         | `enhancement`                  |

The PRD proposed publishing these as enhancements. Four are defects: they
describe behavior that is wrong today, not behavior that is missing. Categories
above reflect that.

## Publishing Order and Labels

Publish in dependency order so the "Blocked by" sections can carry real issue
numbers: LA and L1 first in either order, then L2 and L3, then L4, then L5.
Replace the `L#` placeholders in each "Blocked by" section with the published
issue reference as you go.

Following the convention in [issue-briefs.md](../issue-briefs.md), only unblocked
slices are candidates for `ready-for-agent`. LA and L1 qualify on publication;
the rest become candidates as their blockers close.

Do not add `good first issue` to any of these without review. LA looks small but
changes a shared component consumed across every app, and L1 touches points
awards.

## Before Publishing L1

L1 was scoped against a tree that predates the merged leaderboard work. Re-verify
its premise against current `development` first. See the evidence section of the
[issue breakdown](../shiksha-learning-ux-issues.md) for what changed.
