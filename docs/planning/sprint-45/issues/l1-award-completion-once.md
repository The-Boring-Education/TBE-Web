# L1: Award course completion exactly once, regardless of navigation

Category: bug. Type: AFK. Proposed labels: `bug`, `ready-for-agent`.
Source: [Shiksha learning UX PRD](../shiksha-learning-ux.md), stories 7 and 12.
Rationale: [issue breakdown](../shiksha-learning-ux-issues.md).

## What to build

A learner who has completed every chapter of a Shiksha course re-earns the
course-completion award each time they change chapters.

The effect keyed on chapter selection fires the course-completion gamified
action, which issues a real points request. It guards itself by raising the
chapter feedback flag, but that flag is lowered again when the learner submits
the feedback popup, so the next chapter change fires the award again and
re-opens the popup. The cycle has no natural end.

Independently, the certificate API already credits the same course-completion
action server-side when a certificate is created, while the page credits it from
the client. A single genuine completion is therefore counted twice before any
re-navigation occurs.

Make course completion produce exactly one award and one celebration, with the
server as the authority for the award. Navigation must produce none. Certificate
creation itself must keep working unchanged.

While working here, replace the tautological assertion in the existing Shiksha
enrollment end-to-end spec. Its enrolled-completion test branches on whether the
completion control is present and passes down either branch, so it cannot detect
that control silently disappearing. Make the fixture deterministically enrolled
and assert the completion request unconditionally. That test is the safety net
for L3, and it currently has a hole exactly where L3 works.

### Verify the premise first

This was scoped against a tree cut from `development` before the leaderboard work
merged, which introduced award-tracking that is absent from the inspected tree.
Confirm the current behavior against `development` before changing anything, and
record what the merged award handling already guarantees in the pull request
description. The acceptance criteria below are written as observable behavior so
they hold either way.

## Acceptance criteria

- [ ] Completing the final chapter of a course credits the course-completion award exactly once, counting both client- and server-initiated credits.
- [ ] Navigating between chapters after a course is complete issues no award requests, regardless of how many times the learner navigates or dismisses the feedback prompt.
- [ ] The course feedback prompt appears at most once per completion, not on each subsequent chapter change.
- [ ] Certificate creation still occurs when all chapters are complete, and certificate eligibility rules are unchanged.
- [ ] Per-chapter completion awards are unaffected.
- [ ] A browser test counts award requests across a completion followed by repeated chapter navigation and feedback dismissal, and asserts the expected total.
- [ ] The enrolled-completion end-to-end assertion no longer branches on the presence of the completion control; it asserts the request directly.
- [ ] Current behavior on `development` is confirmed before implementation, and any overlap with merged leaderboard award handling is recorded in the pull request description.

## Blocked by

None - can start immediately.
