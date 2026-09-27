# Shiksha Learning UX: Published Issues

One file per slice, holding the body published to GitHub. These are **published**
as of 2026-09-27; edit the file and the issue together so they do not drift.

Publication was authorized directly, overriding the "do not open or assign new
GitHub issues in this pass" line in the [sprint README](../README.md). That line
still governs the remaining sprint-45 specifications.

Rationale, evidence, and the record of what the PRD got wrong live in the
[issue breakdown](../shiksha-learning-ux-issues.md). Source requirements live in
the [Shiksha learning UX PRD](../shiksha-learning-ux.md).

## Published

Epic: [#1291](https://github.com/The-Boring-Education/TBE-Web/issues/1291) (`prd`)

| Issue                                                                | File                                                                     | Category    | Blocked By | Labels                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------- | ---------- | --------------------------------------- |
| [#1292](https://github.com/The-Boring-Education/TBE-Web/issues/1292) | [la-button-disabled-prop.md](la-button-disabled-prop.md)                 | bug         | None       | `bug`, `help wanted`, `ready-for-agent` |
| [#1293](https://github.com/The-Boring-Education/TBE-Web/issues/1293) | [l1-award-completion-once.md](l1-award-completion-once.md)               | bug         | None       | `bug`, `help wanted`, `ready-for-agent` |
| [#1294](https://github.com/The-Boring-Education/TBE-Web/issues/1294) | [l2-chapter-resolution.md](l2-chapter-resolution.md)                     | bug         | #1293      | `bug`, `help wanted`                    |
| [#1295](https://github.com/The-Boring-Education/TBE-Web/issues/1295) | [l3-enrollment-and-save-feedback.md](l3-enrollment-and-save-feedback.md) | bug         | #1293      | `bug`, `help wanted`                    |
| [#1296](https://github.com/The-Boring-Education/TBE-Web/issues/1296) | [l4-accessible-chapter-drawer.md](l4-accessible-chapter-drawer.md)       | enhancement | #1294      | `enhancement`, `help wanted`, `UI/UX`   |
| [#1297](https://github.com/The-Boring-Education/TBE-Web/issues/1297) | [l5-contain-long-content.md](l5-contain-long-content.md)                 | enhancement | #1296      | `enhancement`, `help wanted`, `UI/UX`   |

The PRD proposed publishing this work as enhancements. Four of the six are
defects: they describe behavior that is wrong today, not behavior that is
missing. Labels reflect that.

## Label Decisions

Following the convention in [issue-briefs.md](../issue-briefs.md), only unblocked
slices carry `ready-for-agent`: #1292 and #1293. The rest become candidates as
their blockers close, and the label should be added then.

No issue carries `good first issue`. #1292 changes a component consumed by every
app in the monorepo and requires a repository-wide caller audit; #1293 touches
points awards feeding the leaderboard. Both are well specified and open to
newcomers through `help wanted`, but neither is unsupervised-beginner work.
#1297 is the strongest candidate to relabel once #1296 lands.

## Before Work Starts on #1293

Its premise was established against a tree predating the merged leaderboard
work. The issue body instructs the implementer to reproduce the behavior on
current `development` first and record what the merged award handling already
guarantees. See the evidence section of the
[issue breakdown](../shiksha-learning-ux-issues.md).
