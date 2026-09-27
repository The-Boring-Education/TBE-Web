# L3: Real enrollment, per-chapter pending state, and visible save failures

Category: bug. Type: AFK. Proposed labels: `bug`.
Source: [Shiksha learning UX PRD](../shiksha-learning-ux.md), stories 4, 5, 6 and 11.
Rationale: [issue breakdown](../shiksha-learning-ux-issues.md).

## What to build

**Enrollment from within the locked content area is simulated.** The control
offered in that state only flips local component state. No enrollment is
recorded anywhere. The page then unlocks every chapter and the completion
control, but each completion request fails server-side because no user-course
record exists. The learner appears enrolled, marks chapters complete, and
nothing is ever saved. Route that control through the same real enrollment path
the page's hero section already uses, so an unlocked page reflects recorded
enrollment.

**Failures are invisible.** The completion handler acts only on the success
branch. There is no failure branch, and the catch writes to the console, which
the repository's own standards prohibit in production code. A failed save leaves
the control looking untouched, so the learner cannot tell the difference between
a save that did not happen and one they never attempted. Add a failure state
with an accessible message and a retry, without exposing raw server error text,
and route the failure through the project logger.

**Pending state is page-wide, not per-chapter.** A single flag drives the
completion control, so a save in flight on one chapter disables the completion
control on every other chapter the learner visits. Make pending state belong to
the chapter being saved.

### Already satisfied, in scope as regression tests only

Do not re-implement these. They hold today and the tests exist to keep them
holding:

- Repeated clicks during a pending save do not issue duplicate requests, because the shared Button disables itself while loading.
- A completion response applies to the chapter captured when the request started, not to whatever is selected when it resolves, because the handler closes over the chapter identity from the click.

## Acceptance criteria

- [ ] The in-content enrollment control records enrollment through the existing enrollment path before unlocking chapters.
- [ ] After enrolling through that control, a completion save succeeds and persists.
- [ ] A failed completion save leaves the last confirmed progress unchanged, announces an accessible error, and offers a retry that succeeds once the underlying cause is resolved.
- [ ] No raw server error text reaches the learner.
- [ ] A save in flight on one chapter leaves the completion control usable on other chapters.
- [ ] Pending, failed, retry, denied, and completed states are all reachable and accessible.
- [ ] No `console.*` call remains in the learning page; failures route through the project logger.
- [ ] Regression test: repeated clicks during a pending save issue exactly one request.
- [ ] Regression test: starting a save on one chapter, navigating to another, then resolving the save updates only the originating chapter.
- [ ] Deferred mocked responses drive the in-flight, failure, and retry cases.
- [ ] Saved completion state and certificate eligibility are unchanged by this work, asserted by test.

## Blocked by

- L1
