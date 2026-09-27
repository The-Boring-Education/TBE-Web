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

---

## Learning Environment (drafted 2026-09-27, not yet published)

Consolidate the platform learning surfaces onto the existing shared shell. Epic
number assigned at publish; each child's `## Parent` is filled in then. Source:
[learning-environment.md](../learning-environment.md).

| File                                                             | Slice                                              | Kind        | Blocked By     | Ready? | Labels                                            |
| ---------------------------------------------------------------- | -------------------------------------------------- | ----------- | -------------- | ------ | ------------------------------------------------- |
| [le-epic.md](le-epic.md)                                         | Epic                                               | prd         | —              | —      | `prd`                                             |
| [le1-semantic-tokens.md](le1-semantic-tokens.md)                 | Semantic color tokens + dark learning theme        | bug         | None           | yes    | `bug`, `help wanted`, `UI/UX`, `ready-for-agent`  |
| [le2-shell-internals.md](le2-shell-internals.md)                 | Navigation normalizer, sidebar hook, layout opt-out| enhancement | LE1            | no     | `enhancement`, `help wanted`                      |
| [le3-shiksha-migration.md](le3-shiksha-migration.md)             | Migrate Shiksha learn page (closes #1296)          | enhancement | LE2, PH6       | no     | `enhancement`, `help wanted`, `UI/UX`             |
| [le4-interview-prep-migration.md](le4-interview-prep-migration.md)| Migrate interview-prep                            | enhancement | LE3            | no     | `enhancement`, `help wanted`, `UI/UX`             |
| [le5-projects-migration.md](le5-projects-migration.md)           | Migrate Projects                                   | enhancement | LE3            | no     | `enhancement`, `help wanted`, `UI/UX`             |
| [le6-adopt-navigation-contract.md](le6-adopt-navigation-contract.md)| OnCampus/DSA adopt navigation contract          | enhancement | LE2            | no     | `enhancement`, `help wanted`                      |

Only LE1 is unblocked, so only LE1 carries `ready-for-agent`. LE3 has a
cross-epic blocker on PH6 (`useFeatureFlag`). #1296 is re-scoped into this epic
and closed by LE3; its accessibility criteria become LE2's `useLearningSidebar`
acceptance criteria.

## PostHog (drafted 2026-09-27, not yet published)

Add PostHog as a second analytics sink; pilot on platform. Selects the provider
and supersedes [analytics-decision.md](../analytics-decision.md). Source:
[posthog-integration.md](../posthog-integration.md).

| File                                                     | Slice                                             | Kind        | Blocked By       | Ready? | Labels                                     |
| -------------------------------------------------------- | ------------------------------------------------- | ----------- | ---------------- | ------ | ------------------------------------------ |
| [ph-epic.md](ph-epic.md)                                 | Epic                                              | prd         | —                | —      | `prd`                                      |
| [ph1-sink-registry.md](ph1-sink-registry.md)            | Provider-neutral sink registry                    | enhancement | None             | yes    | `enhancement`, `help wanted`, `ready-for-agent` |
| [ph2-scrub-properties.md](ph2-scrub-properties.md)       | Scrub event properties (allowlist + query strip)  | enhancement | PH1              | no     | `enhancement`, `help wanted`               |
| [ph3-posthog-sink-identity.md](ph3-posthog-sink-identity.md)| posthogSink + identify/reset                   | enhancement | PH1, PH2         | no     | `enhancement`, `help wanted`               |
| [ph4-consent.md](ph4-consent.md)                         | Consent: DNT/GPC, opt-out, EU/UK replay gate      | enhancement | PH1              | no     | `enhancement`, `help wanted`               |
| [ph5-ingestion-csp.md](ph5-ingestion-csp.md)             | Reverse-proxy ingestion, env config, CSP          | enhancement | PH3              | no     | `enhancement`, `help wanted`               |
| [ph6-feature-flag-hook.md](ph6-feature-flag-hook.md)     | `useFeatureFlag` hook                             | enhancement | PH3              | no     | `enhancement`, `help wanted`               |
| [ph7-platform-pilot.md](ph7-platform-pilot.md)           | Platform pilot + validation against GA4           | enhancement | PH3, PH4, PH5    | no     | `enhancement`, `help wanted`               |

Only PH1 is unblocked, so only PH1 carries `ready-for-agent`. PH6 unblocks the
Learning Environment migration (LE3). PH7 is partly operational: the GA4
comparison is human-led against authorized reporting access.

## Publishing note

The two epics above are drafted but **not yet published to GitHub**, pending
confirmation. The [sprint README](../README.md) restricts opening new issues in
this pass; the earlier one-off exception covered only the Shiksha slices
(#1291–#1297). Publishing these requires the same explicit authorization.
