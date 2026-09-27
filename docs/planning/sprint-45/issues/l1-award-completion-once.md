## Parent

The-Boring-Education/TBE-Web#1291

## Context

When a learner finishes every chapter of a Shiksha course, two things should
happen exactly once: they receive a certificate, and they receive the
course-completion points award.

Right now the award fires **every time they change chapters afterwards**.

Here is the loop. The learning page runs an effect whenever the selected
chapter changes. That effect checks whether all chapters are complete and, if
so, fires the course-completion gamified action — which issues a real points
request to the server. It stops itself from firing twice by raising the
chapter-feedback flag. But that same flag is lowered again when the learner
submits the feedback popup. So the next chapter click fires the award again,
raises the flag again, shows the popup again, and the cycle restarts. There is
no natural end to it. A learner re-reading a course they already finished
inflates their points total indefinitely, and gets the feedback popup shoved in
their face on every click.

Separately, and independently of any of that: the certificate API **already**
credits the course-completion award on the server when the certificate is
created, while the page credits it from the browser. So one honest course
completion is counted twice before anyone re-navigates anywhere.

Points feed the leaderboard. This is score integrity, not cosmetics.

## What to build

Course completion should produce exactly one award and one celebration, with
the server as the authority for the award. Navigation should produce none, ever.

Certificate creation itself must keep working exactly as it does now — a
learner who completes every chapter still gets their certificate, and the
eligibility rules do not change.

### Also: fix the test that cannot fail

While you are here, replace the conditional assertion in the existing Shiksha
enrolment end-to-end spec. Its enrolled-completion test checks whether the
completion button is present, and asserts something different depending on the
answer — so it passes whether the button works or has vanished entirely. It is
not a test, it is a coin flip that always lands heads.

Make the fixture deterministically enrolled and assert the completion request
unconditionally. This matters beyond tidiness: that spec is the safety net for
ticket L3, and the hole in it sits exactly where L3 does its work.

## Verify the premise before you change anything

This ticket was written against a snapshot of the codebase taken before the
leaderboard work merged. That merge introduced award-tracking that did not
exist in the snapshot, and it may already prevent some of the duplication
described above.

**Reproduce the behaviour on current `development` first.** Then record in your
pull request description what the merged award handling already guarantees and
what was left for you to fix. The acceptance criteria below are written in
terms of what a learner can observe, so they hold regardless of what you find.

If it turns out the duplication is already fully prevented, say so on the
ticket — that is a valid and useful outcome, and the test coverage is still
worth adding.

## Where to look

The learning page is in the platform app under the Shiksha course routes. The
points award path runs through the gamification package on the client and the
gamification and certificate API routes on the server. The end-to-end spec is
in `apps/testing` under the platform e2e directory.

## Acceptance criteria

- [ ] Completing the final chapter of a course credits the course-completion award exactly once, counting both browser-initiated and server-initiated credits together.
- [ ] Navigating between chapters after a course is already complete issues no award requests at all, no matter how many times the learner navigates or dismisses the feedback prompt.
- [ ] The course feedback prompt appears at most once per completion, rather than on every subsequent chapter change.
- [ ] Certificate creation still happens when all chapters are complete, and certificate eligibility rules are unchanged.
- [ ] Per-chapter completion awards are unaffected.
- [ ] A browser test walks a completion, then repeated chapter navigation and feedback dismissal, counting award requests and asserting the expected total.
- [ ] The enrolled-completion end-to-end assertion no longer branches on whether the completion control exists; it asserts the request directly.
- [ ] Current behaviour on `development` is confirmed before implementation, and the overlap with merged leaderboard award handling is recorded in the pull request description.

## How to verify

```bash
pnpm install
pnpm test:e2e            # or pnpm test:e2e:ui for the interactive runner
pnpm test:unit
pnpm quality:check
```

Playwright can assert on outgoing requests, which is the cleanest way to count
awards across a navigation sequence. Existing course mocks and fixtures are in
`apps/testing`; reuse them rather than writing new ones.

## Notes

Do not "fix" this by suppressing the celebration animation while leaving the
request in place. The request is the bug; the animation is a symptom.

## Blocked by

None - can start immediately.
