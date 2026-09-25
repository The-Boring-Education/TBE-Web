# PRD: Shiksha Learning Navigation and Feedback

Status: proposed narrow behaviors; full visual redesign requires separate review.

## Problem Statement

Learners need chapter navigation, reliable progress feedback, and a usable mobile
chapter list. The current learn page owns router selection, completion mutations,
course completion, and certificate state together. Cosmetic changes in this area
can accidentally affect learning history or award behavior.

## Solution

Improve the learning flow through small behavior-focused changes: durable chapter
selection, explicit mutation feedback, accessible mobile navigation, and readable
content. Preserve the existing enrollment, completion, certificate, and reward
contracts. Design changes should follow a reviewed desktop/mobile sample.

## User Stories

1. As a learner, I want a selected chapter reflected in its URL, so that refresh and sharing retain the same context.
2. As a learner, I want browser Back and Forward to navigate chapters predictably, so that navigation works like the rest of the web.
3. As a learner opening an invalid chapter link, I want a deterministic fallback or explained state, so that stale links do not leave mismatched content.
4. As a learner, I want completion controls to show pending state, so that I do not submit duplicate changes.
5. As a learner whose progress save fails, I want an accessible error and retry, so that I do not assume progress was saved.
6. As a learner who switches chapters during a save, I want the original chapter updated, so that an in-flight response cannot change the wrong chapter.
7. As a learner, I want saved completion and certificate eligibility preserved, so that usability work cannot erase learning history.
8. As a mobile learner, I want to open and close the chapter list with touch or keyboard, so that navigation is accessible.
9. As a keyboard user, I want focus to remain inside an open modal drawer and return to its trigger, so that I do not lose my place.
10. As a learner reading code or tables, I want long content contained without hiding controls, so that narrow screens remain usable.
11. As a learner without enrollment, I want an honest access state and enrollment path, so that the page does not imply protected content is available.
12. As a learner who completes a course, I want one coherent completion and certificate flow, so that navigation does not repeatedly celebrate the same action.
13. As a maintainer, I want these behaviors covered in existing learning tests, so that later visual changes can be made safely.

## Implementation Decisions

Confirmed: preserve the Shiksha navigation/progress boundary and test observable
behavior. Reuse existing shared components, query mutations, enrollment checks,
and server-authoritative progress/award behavior.

Proposed for issue approval:

- Treat the validated chapter URL as the durable selection; synchronize content, chapter list, and browser history.
- Capture the chapter identity at mutation start and apply the result to that chapter even if selection changes while the request is pending.
- Provide pending, failed, retry, denied, empty, and completed states without exposing raw server errors.
- Use the existing accessible dialog/drawer pattern, not a new modal framework.
- Separate three small changes: chapter routing, mutation feedback, and mobile drawer accessibility. Leave broader visual redesign for a human-reviewed sample.

## Testing Decisions

Reuse existing Shiksha enrollment E2E tests, course mocks, and user-course API
tests. Add browser assertions for direct links, refresh, Back/Forward, and drawer
focus at desktop/mobile widths. Use deferred mocked responses to test chapter
switches during completion updates and retry after failure. Assert unchanged
canonical completion and no additional award/certificate side effects caused by
navigation. Source inspection motivates these checks; no production bug has been
reproduced as part of this planning pass.

## Out of Scope

A new editor, new content authoring system, redesigning every learning app,
rewriting gamification, changing enrollment policy, collecting real learner data,
or changing certificate eligibility rules.

## Further Notes

The three narrow behaviors can be published as enhancement slices after approval.
Visual direction, content-density targets, and any broader layout changes remain
HITL. Coordinate with open leaderboard PR #1279 before touching shared award
feedback; do not depend on its unmerged implementation without verification.

## Technical Specification

### Contract and Invariants

Chapter selection accepts a route chapter identifier and available chapter
summaries. A valid identifier selects exactly one chapter. An invalid identifier
uses an agreed canonical fallback and normalizes the URL without a navigation
loop. Navigation alone performs no enrollment, completion, or certificate writes.

A completion operation carries the captured course/chapter identity and desired
state. The UI shows pending state and prevents duplicate submits for that
operation. On success, update only the matching chapter. On failure, preserve the
last confirmed state and provide a retry. Ignore stale results for a different
course instance; do not move selection because a mutation completes.

The mobile chapter drawer supports an accessible name, initial focus, Escape,
focus containment where modal, background interaction control, and focus return.
Selecting a chapter closes the drawer and moves to meaningful content focus.

### Acceptance Checks

- Select chapter B, refresh, and remain on B; Back returns to the previous chapter.
- An invalid chapter link does not render one chapter title with another chapter's body.
- A failed completion save leaves confirmed progress unchanged and exposes retry.
- Start saving A, navigate to B, then resolve the save: only A changes.
- Repeated clicks during a pending save do not issue duplicate mutations.
- Keyboard-only users can open, navigate, and dismiss the mobile drawer without losing focus.
- Narrow viewports and long content do not obscure completion or navigation controls.
- Navigation and error recovery create no new completion awards or certificates.

### Rollout Gates

Approve the small issue breakdown, run existing course tests plus the added
regressions, and review desktop/mobile screenshots. Keep visual redesign out of
the small behavior PRs unless a reviewed design is supplied.
