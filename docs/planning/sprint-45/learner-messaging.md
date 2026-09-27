# PRD: Learner Messaging and Lifecycle Reminders

Status: draft; human decisions block production implementation and rollout.

## Problem Statement

Learners need a useful next step after onboarding and recognition of real learning
progress. Existing welcome and enrollment messages do not provide a coordinated
return-to-learning journey. Independent reminder, community, and recognition jobs
could send repetitive messages or contact people who have opted out.

## Solution

Coordinate lifecycle and engagement messages through one eligibility policy and
delivery ledger, using the existing TBE email service and Chitthi transport. Every
message should lead to an accessible learning action or a clearly identified
community invitation. Start in preview mode; enable sending only after policy,
consent, content, and delivery behavior have been approved.

## User Stories

1. As a new learner, I want a welcome message that reflects my onboarding app, so that I can resume the right experience.
2. As a returning learner, I want a reminder with an unfinished learning item, so that I know what to do next.
3. As an active learner, I want irrelevant inactivity reminders suppressed, so that messages reflect my actual progress.
4. As a learner, I want day-1, day-7, day-14, and day-30 messages to follow a clear policy, so that the journey is predictable.
5. As a learner, I want progress recognition based on verified completions, so that congratulations are accurate.
6. As a learner using several apps, I want a coordinated frequency limit, so that each app does not independently fill my inbox.
7. As a learner, I want to control optional learning and community messages, so that I can choose what I receive.
8. As an unsubscribed learner, I want queued optional messages suppressed before dispatch, so that my latest choice takes effect.
9. As a learner, I want unsubscribe links to work without login, so that I can act directly from a message.
10. As a learner, I want reminder links to respect access rights and return to the intended page after login, so that reminders are useful.
11. As an operator, I want to preview a bounded candidate cohort without sending, so that I can validate eligibility and copy.
12. As an operator, I want accepted, failed, suppressed, and uncertain attempts distinguished, so that I do not blindly resend messages.
13. As an operator, I want an audited pause control, so that a faulty campaign can stop without affecting essential account messages.
14. As a maintainer, I want retries and overlapping jobs to avoid duplicate dispatches, so that scheduling is recoverable.

## Implementation Decisions

Confirmed: use a TBE-owned messaging policy and delivery ledger, with Chitthi as
transport. Reuse welcome/onboarding behavior from merged PR #1070. Course
completion messages already have a trigger; do not create a competing trigger.
Leaderboard messages have their own existing requirements and preferences.

Proposed, not yet approved:

- Separate essential account messages from optional lifecycle, recognition, and community categories. Obtain policy review of each category.
- Represent a campaign journey explicitly; use a unique delivery identity comprising learner, campaign version, journey, and milestone.
- Evaluate canonical learning activity and access immediately before dispatch, not only when queuing a candidate.
- Expose preview, campaign pause, and a redacted delivery history through authenticated admin operations.
- Use bounded scheduled batches and a persisted claim lease rather than a long-running request or in-memory timer.
- Keep reminder policy out of Chitthi; a transport change needs a separate cross-repository contract review.

## Testing Decisions

Test externally observable eligibility, consent changes, frequency limits,
concurrent claims, timeout recovery, and safe links. Reuse onboarding integration
tests and existing email-service mocks as prior art. Test the policy independently
with a controlled clock, then exercise admin preview and dispatch through mocked
transport. Browser tests cover preference changes and signed unsubscribe flows.
No test sends real email or uses provider credentials.

## Out of Scope

Purchasing a mailbox, DNS changes, bulk historical reactivation, running campaigns
during planning, modifying the leaderboard's accepted policy, and claiming
inbox delivery merely because a provider accepted a request.

## Further Notes

Blocking decisions:

1. Do 1/7/14/30 mean days since signup, app onboarding, last learning activity, or the start of an inactivity journey?
2. Which activity restarts a journey, and how often can a learner enter another journey?
3. What consent basis, category defaults, frequency cap, quiet hours, and cohort are approved?
4. Who approves copy and verifies sender/domain readiness?
5. Which scheduler runs the job, and does the deployed transport provide an idempotency or delivery-status contract?

Recommended first release: one app, one milestone, explicit preview, a small
approved cohort, and optional-email opt-out. No release date is committed.

## Technical Specification

### Contract and Invariants

The policy consumes a learner identifier, verified progress/activity, current
preferences, campaign version, and evaluation instant. It returns either a
suppression reason or an eligible milestone with a validated internal next-step
link. Missing activity data is not evidence of inactivity.

The ledger records the unique delivery identity, eligibility snapshot, claim
expiry, attempt count, outcome, and transport correlation identifier. It must not
contain provider keys or full message bodies by default.

Suggested states: pending, claimed, accepted, retryable-failure, uncertain, and
suppressed. Expired claims are recoverable. A send timeout after possible
acceptance becomes uncertain, not automatically retryable. Application-level
deduplication cannot guarantee exactly-once external delivery without transport
support; reconcile uncertain attempts or require operator review.

Preferences are checked again when a claim is dispatched. Unsubscribe is an
idempotent, narrowly scoped action using a tamper-resistant token. It must not
allow arbitrary account modification. Preserve separate leaderboard preferences
unless a later, reviewed migration unifies them.

### Acceptance Checks

- A preview makes zero transport calls and explains why each bounded candidate is eligible or suppressed.
- Two overlapping jobs can claim one logical delivery only once.
- A learner who opts out after preview is not contacted by the subsequent dispatch.
- An uncertain send does not enter an automatic retry loop.
- Links cannot redirect off-site or expose content beyond the learner's entitlement.
- A campaign can be paused without disabling welcome/account messages.
- Transport acceptance and confirmed delivery, when available, remain distinct.

### Rollout Gates

Approve the policy decisions, verify sender configuration with authorized
operators, run synthetic preview cases, review the first cohort, and enable a
limited campaign. Monitor suppression, failure, uncertainty, and unsubscribe
counts. Stop on unexpected duplication or consent violations.
