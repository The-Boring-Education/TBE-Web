## Parent

The-Boring-Education/TBE-Web#1291

## Context

This is the worst of the Shiksha defects, because the learner has no way to
detect it.

### Enrolling from inside the course body does not enrol you

When a learner is not enrolled, the course content area shows a locked state
with an "Enroll in Course" button. Clicking it flips a local variable in the
browser. That is the entire implementation. Nothing is sent anywhere, and no
enrolment record is created.

The page then behaves as though enrolment succeeded: chapters unlock, the
completion control appears, everything looks right. But every completion save
now fails on the server, because there is no enrolment record for the save to
attach to.

### And the failure is invisible

The completion handler only does something on success. There is no failure
branch at all, and the catch block just writes to the console — which this
repository's standards prohibit in production code anyway.

So the save fails, nothing is shown, and the button settles back to "Mark As
Completed" as though the click never happened. The learner cannot distinguish
"my progress was not saved" from "I did not click properly". They can work
through an entire course convinced their progress is being recorded, and lose
all of it.

Note there is a _second_, working enrolment path on the same page, in the hero
section at the top. The in-content button is a duplicate that skips the server.

### Pending state is page-wide instead of per-chapter

One flag drives the completion control for the whole page. Start a save on
chapter three, navigate to chapter four while it is in flight, and chapter
four's completion control is disabled too — for a save that has nothing to do
with it.

## What to build

Route the in-content enrolment button through the same real enrolment path the
hero section already uses, so an unlocked page reflects an enrolment that
actually exists.

Give the completion control a real failure state: an accessible message and a
retry that works. Do not surface raw server error text to learners. Send the
failure to the project logger instead of the console.

Make pending state belong to the chapter being saved, so an in-flight save on
one chapter leaves every other chapter usable.

## Already works — regression tests only, do not re-implement

Both of these hold on the current code. The tickets ask you to lock them in
with tests, not to build them:

- **Repeated clicks during a pending save do not duplicate the request.** The shared Button disables itself while loading.
- **A completion response applies to the chapter you were on when you clicked**, not whichever chapter is selected when the response arrives. The handler captures the chapter identity at click time.

If you find yourself writing code to solve either of these, stop and re-read.

## Where to look

The learning page is in the platform app under the Shiksha course routes. The
working enrolment path is in the hero container in the components package. The
completion endpoint is in the API app under the user Shiksha routes. Tests go
in `apps/testing`.

## Acceptance criteria

- [ ] The in-content enrolment control records enrolment through the existing enrolment path before unlocking chapters.
- [ ] After enrolling through that control, a completion save succeeds and persists.
- [ ] A failed completion save leaves the last confirmed progress unchanged, announces an accessible error, and offers a retry that succeeds once the underlying cause is resolved.
- [ ] No raw server error text reaches the learner.
- [ ] A save in flight on one chapter leaves the completion control usable on other chapters.
- [ ] Pending, failed, retry, denied, and completed states are all reachable and accessible.
- [ ] No `console.*` call remains in the learning page; failures route through the project logger.
- [ ] Regression test: repeated clicks during a pending save issue exactly one request.
- [ ] Regression test: starting a save on one chapter, navigating to another, then resolving the save updates only the originating chapter.
- [ ] Saved completion state and certificate eligibility are unchanged by this work, asserted by test.

## How to verify

```bash
pnpm install
pnpm test:e2e            # or pnpm test:e2e:ui
pnpm test:unit
pnpm quality:check
```

To test the in-flight and retry cases, hold the mocked response open and
resolve it deliberately rather than letting it return immediately. Playwright
route interception supports this. Existing course mocks live in `apps/testing`.

Reproducing the enrolment bug by hand is worth doing once: sign in, open a
course you are not enrolled in, click the in-content enrol button, then try to
mark a chapter complete. Nothing happens, and nothing tells you so.

## Blocked by

The-Boring-Education/TBE-Web#1293

## Notes

The enrolment fix and the error-state work are one ticket on purpose. An error
state you cannot reach is an error state you cannot test — fixing enrolment is
what makes the failure path reproducible.

## Related

The-Boring-Education/TBE-Web#1293 repairs a conditional assertion in the
Shiksha enrolment end-to-end spec that currently passes whether the completion
control works or has disappeared. That spec is this ticket's safety net, which
is why it is fixed first.
