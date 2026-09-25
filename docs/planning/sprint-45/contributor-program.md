# PRD: Contributor Program Launch Workflow

Status: discovery draft; track vocabulary, form ownership, and program policy need approval.

## Problem Statement

Prospective contributors need consistent expectations from the public program
page through application, review, onboarding, and first contribution. The current
public page uses Code/Community tracks and links to an external form, while the
program brief describes Code/Content tracks and a broader recognition journey.
Existing DevRel data structures do not prove that this whole journey is connected.

## Solution

Agree on one program vocabulary and a minimal application-to-first-contribution
workflow. Reuse the existing public site and supported application/review systems.
Keep public amplification optional and separate from program participation. Start
with human-reviewed contributions before building automated XP and reward systems.

## User Stories

1. As an applicant, I want track names and expectations to agree across the site and form, so that I choose the right path.
2. As an applicant, I want to describe my interests and proof of work, so that reviewers can assess more than a referral count.
3. As an applicant, I want social-sharing consent to be explicit, so that participation does not imply unrestricted publicity.
4. As an applicant, I want to decline optional publicity without losing eligibility, so that consent is meaningful.
5. As an applicant, I want confirmation and a clear next step, so that I know my application was received.
6. As a reviewer, I want a consistent rubric and track-specific evidence, so that decisions are explainable.
7. As a reviewer, I want application state transitions recorded, so that repeated updates do not send duplicate offers or lose history.
8. As an accepted contributor, I want an onboarding checklist and first mission, so that I can contribute promptly.
9. As a code contributor, I want a runnable starter issue with test guidance, so that I can make a verifiable contribution.
10. As a content contributor, I want publication and originality criteria, so that expectations are clear before submission.
11. As a contributor, I want recognition based on accepted work, so that opening low-quality submissions does not earn automatic credit.
12. As a contributor, I want publicity consent withdrawable, so that future amplification respects my current preference.
13. As an operator, I want reviewer and escalation ownership defined, so that applications and submissions do not stall silently.
14. As a maintainer, I want contributor recognition kept distinct from learner scoring, so that a contribution cannot accidentally change learning rank.

## Implementation Decisions

Confirmed: use the existing contributor application/review boundary and test
external behavior. The current public site points to a Google Form. Existing
DevRel lead/task models have review and onboarding states, but connecting or
migrating them is not approved merely because they exist.

Proposed, not yet approved:

- Resolve Code/Content versus Code/Community before changing public terminology.
- Keep the external form as the initial intake unless the owner explicitly chooses a native form and a reviewed migration.
- Capture separate, optional public-amplification consent with a policy version and timestamp in the chosen system of record.
- Document reviewer, first-mission, and escalation handoffs; build only the workflow gaps verified after the intake decision.
- Keep contributor XP outside learner Lifetime Points, Period Score, and Champion rules.
- Do not promise merchandise, event access, certificates, or promotion automatically without approved eligibility and operational ownership.

## Testing Decisions

Test public CTA destinations, accessible track selection, consent defaults and
withdrawal, application ownership, valid review transitions, and duplicate
submissions. Existing onboarding API/browser tests and DevRel models are prior
art, not evidence that the proposed flow is already covered. External forms need
human verification unless a supported test integration exists. Use synthetic
applications; never include real applicant data in fixtures or GitHub issues.

## Out of Scope

Full six-month program automation, reward fulfillment, automatic social posting,
mandatory publicity, rebuilding already-live contributor acknowledgement,
automatic XP from unreviewed PRs, and changing an external form during planning.

## Further Notes

Blocking decisions: canonical tracks, intake system of record, form owner,
reviewers, consent wording, first-mission policy, and whether any certificate or
XP automation belongs in the first release. Program strategy and application
review require human judgment.

Reuse contributor-guide PR #1241 and the existing contribution acknowledgement
experience. DevRel interview work in open PR #1020 also needs coordination before
touching the same review flow. No new application platform is committed here.

## Technical Specification

### Contract and Invariants

An application records identity, selected approved track, evidence links,
availability, and independent publicity consent. Required participation
commitments must not be used as a substitute for publicity consent.

If native application integration is selected, server-side validation and
authenticated ownership apply. Review transitions use a documented transition
table, expected current state, reviewer identity, and an audit event. Retrying a
transition must not duplicate an offer, notification, or onboarding assignment.

Consent withdrawal stops future amplification; the program must explain any
limits on already-published third-party material. Public pages do not expose
private application evidence or reviewer notes. Accepted contribution evidence
must be distinguished from a submitted or merely opened PR.

### Acceptance Checks

- Approved track names match on the site, intake form, and reviewer instructions.
- Optional publicity is not preselected or tied to program acceptance.
- The application CTA reaches the agreed intake without requiring a production-only workaround.
- Reviewers can identify the current state, responsible owner, and next action.
- First missions link to existing, non-duplicated issues with runnable guidance.
- Learner Period Score is unchanged by contributor submissions or recognition.

### Rollout Gates

Approve program vocabulary and consent, confirm the intake owner, perform a
synthetic application-to-first-mission walkthrough, and verify human review
capacity. Publish only the implementation gaps found in that walkthrough.
