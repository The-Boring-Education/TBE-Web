# PRD: Hall of Fame and Verified Recognition

Status: discovery draft; the subject of recognition is not yet selected.

## Problem Statement

The sprint names a Hall of Fame but does not define whether it celebrates learner
outcomes, leaderboard Champions, or contributors. Existing testimonials,
contributor acknowledgement, and leaderboard recognition already cover parts of
this space. A new page without a clear subject could duplicate them or publish
personal claims without appropriate verification and consent.

## Solution

Choose the recognition subject and reuse an existing surface when it fits. If the
intent is verified learner outcomes, build a moderated, consent-based publication
workflow with a minimal public record and a withdrawal path. Do not infer a new
ranking system or guaranteed placement claim from the feature name.

## User Stories

1. As a visitor, I want to understand what an entry recognizes, so that a testimonial is not confused with a verified outcome.
2. As a learner, I want publication of my story to require explicit consent, so that participation does not make my personal history public automatically.
3. As a learner, I want to preview my public details, so that I can correct them before publication.
4. As a learner, I want to exclude private contact or employment details, so that recognition does not expose unnecessary information.
5. As a learner, I want to withdraw future display, so that consent remains meaningful.
6. As a reviewer, I want supporting evidence kept separate from public content, so that verification does not disclose private documents.
7. As a reviewer, I want approval, rejection, and correction states, so that unreviewed submissions never appear publicly.
8. As a reviewer, I want the recognized person and subject deduplicated, so that repeated submissions do not create misleading counts.
9. As a visitor, I want accessible names, images, and fallbacks, so that the list works with assistive technology and missing assets.
10. As an operator, I want removals reflected in cached pages, so that withdrawal is not limited to the database record.
11. As an operator, I want publication history and ownership, so that corrections are traceable.
12. As a maintainer, I want Champion and contributor recognition kept distinct, so that unrelated policies do not become entangled.

## Implementation Decisions

Confirmed: reuse existing TBE UI and a moderated recognition boundary if a new
workflow is required. Existing testimonials are curated content; leaderboard
Champions already have a parent PRD and launch workflow.

Proposed, not yet approved:

- Define the subject before introducing a new model or route.
- For learner outcomes, use draft, submitted, approved, published, rejected, and withdrawn states with an explicit reviewer and consent record.
- Publish only an allowlisted public projection; keep evidence, contact details, and reviewer notes private.
- Use existing image/media handling and shared presentation components where suitable.
- Treat withdrawal and cache invalidation as part of the first publishable workflow, not a later enhancement.

## Testing Decisions

Test unauthorized publication, missing consent, state transitions, deduplication,
public-field projection, withdrawal, and stale-cache handling. Existing landing
testimonial tests and leaderboard privacy tests are useful prior art, though the
latter are feature-branch work until merged. Browser tests cover the review-to-
publication path with synthetic people and locally controlled assets.

## Out of Scope

Scraping competitor profiles, publishing private applicant/learner records,
claiming unverified placements, generating fictional success stories, rebuilding
the leaderboard, and automatically promoting existing testimonials to verified
outcomes.

## Further Notes

Blocking decisions: recognized subject, evidence standard, publication fields,
consent/withdrawal policy, reviewer, and whether an existing surface can satisfy
the requirement. Recommended default is to reuse Champions for ranking-based
recognition and create a new workflow only for genuinely distinct outcomes.

## Technical Specification

### Contract and Invariants

If a new recognition record is approved, it identifies the subject, recognized
achievement, private evidence reference, consent version, review state, public
projection, and publication timestamps. Public reads return published,
consented, non-withdrawn entries only, with bounded pagination.

Publication requires an authorized reviewer and a valid current consent record.
Updates use expected state/revision to prevent a stale approval from republishing
a withdrawn entry. A duplicate submission is either rejected or linked to the
existing review, never silently published twice.

Withdrawal removes the entry from public reads and invalidates affected caches.
Define and test the maximum cache-removal window before rollout. Private evidence
must not be reachable through public media URLs unless explicitly approved for
publication.

### Acceptance Checks

- The subject of Hall of Fame is defined and does not duplicate an existing recognition policy.
- An unapproved or unconsented entry cannot appear in any public response.
- A public response contains no private evidence or contact information.
- Withdrawal removes public display within the approved cache window.
- Stale moderation cannot republish a withdrawn entry.
- Synthetic browser fixtures demonstrate publication and withdrawal end to end.

### Rollout Gates

Resolve the subject and privacy policy, approve a synthetic public example, and
validate moderation and withdrawal before considering real entries. No personal
story is published by this planning task.
