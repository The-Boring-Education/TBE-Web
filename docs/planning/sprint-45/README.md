# Sprint 45 Planning

Planning snapshot: 2026-09-24. This packet is a proposal, not a release commitment.
It contains no product implementation and does not authorize production changes.

## Approved Scope

- Plan all sprint items without committing delivery to October 4.
- Keep the personalized DSA roadmap separate from a cross-product study planner.
- Leave the PostHog versus Statsig decision open; preserve the existing GA4 integration.
- Reuse existing TBE modules and add testable domain boundaries only where needed.
- Cover authentication, consent, scheduling, progress, payments, and data safety with behavior tests.
- Publish public-safe requirements; keep business metrics, interview notes, credentials, and customer data out of GitHub.
- Consolidate specifications and draft task briefs into one documentation PR on `docs/sprint-45-product-specs`, based on `development`.
- Keep the issue breakdown in the PR for later use; do not open or assign new GitHub issues in this pass.

## Readiness

An approved module boundary is not an approved product policy. Proposed defaults
below must not be treated as settled decisions. Each PRD distinguishes confirmed
facts, recommended behavior, and decisions that block implementation.

- **AFK**: fully specified work that an agent can implement independently after its blockers are complete. Normal repository review and CI still apply.
- **HITL**: work requiring a human decision, design review, operational access, or release verification.
- **Ready now**: approved acceptance criteria, no unmet dependencies, and runnable checks without production access.
- **Blocked**: a decision or another deliverable must be completed before implementation begins.

No issue is assigned to Copilot or a contributor merely by appearing in this plan.
Publishing issues is not authorization to merge them or run production operations.

## Existing Work To Reuse

| Work                       | Existing Artifact                                                                                                                               | Planning Treatment                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Leaderboard requirements   | [PRD #1263](https://github.com/The-Boring-Education/TBE-Web/issues/1263)                                                                        | Reuse the parent and its existing child issues.                                   |
| Leaderboard implementation | [PR #1279](https://github.com/The-Boring-Education/TBE-Web/pull/1279)                                                                           | Open at inspection; presence in a branch is not proof of release.                 |
| Leaderboard launch         | [Issue #1278](https://github.com/The-Boring-Education/TBE-Web/issues/1278)                                                                      | Human launch verification remains necessary.                                      |
| Welcome emails             | [PR #1070](https://github.com/The-Boring-Education/TBE-Web/pull/1070)                                                                           | Merged; welcome emails are not the proposed lifecycle reminder loop.              |
| Contributor guide          | [PR #1241](https://github.com/The-Boring-Education/TBE-Web/pull/1241)                                                                           | Open; coordinate local-setup documentation instead of creating a competing guide. |
| Profile spacing            | [PR #1260](https://github.com/The-Boring-Education/TBE-Web/pull/1260)                                                                           | Already implements existing issue #1244; do not duplicate it.                     |
| Cross-app auth             | [PR #1243](https://github.com/The-Boring-Education/TBE-Web/pull/1243) and [PR #1258](https://github.com/The-Boring-Education/TBE-Web/pull/1258) | Existing work may affect planner deep links; verify before depending on it.       |

## Feature Specifications

The planning scope includes learner messaging, the DSA roadmap, the cross-product
planner, DSA pricing, the contributor program, safe OSS data, Shiksha learning UX,
admin workflows, analytics, Hall of Fame, and the DSA IDE. Existing leaderboard
requirements remain authoritative rather than being duplicated in another PRD.

Small-task briefs and the proposed issue breakdown are included in this same PR.
Operational tasks remain human-owned: analytics reporting, discovery interviews,
program policy, mailbox provisioning, and release sign-off.

### Documents

1. [Learner messaging](learner-messaging.md)
2. [Personalized DSA roadmap](dsa-roadmap.md)
3. [Cross-product planner](cross-product-planner.md)
4. [DSA pricing and access](dsa-pricing.md)
5. [Contributor program](contributor-program.md)
6. [Safe OSS development data](oss-development-data.md)
7. [Shiksha learning UX](shiksha-learning-ux.md)
8. [Admin workflows](admin-workflows.md)
9. [Analytics decision](analytics-decision.md)
10. [Hall of Fame](hall-of-fame.md)
11. [DSA IDE](dsa-ide.md)

Supporting handoff: [evidence and sequencing](evidence-and-sequencing.md) and
[draft issue briefs](issue-briefs.md). Product decisions and task readiness remain
explicit; the specification branch is not a product implementation branch yet.

## Verification Contract

- PRDs use the problem, solution, user stories, implementation decisions, testing decisions, out-of-scope, and further-notes sections.
- Technical specs add inputs, outputs, invariants, failure behavior, acceptance checks, and rollout gates.
- Tests assert external behavior, not private helper names or incidental component structure.
- TBE tests belong in the existing centralized test app, using Vitest, MSW, MongoDB test helpers, and Playwright where applicable.
- Provider calls are mocked. No real emails, payment requests, AI calls, or code-execution jobs are part of planning verification.
- New UI workflows require accessible loading, empty, denied, and error states and desktop/mobile browser checks during implementation.
- Documentation is format-checked and reviewed for broken local references and missing decision gates.
- Documentation PRs reference implementation parents without `Fixes` or `Closes`; merging a spec must not close an unimplemented feature.

## Evidence Boundary

The main checkout was inspected on `feat/leaderboard` at `9045260c`.
The documentation worktree starts from fetched `origin/development` at `f39f8ed2b`.
Feature-branch evidence is explicitly identified; no production behavior, CI
success, or release status is inferred from a source file alone.
