# PRD: Cross-Product Study Planner

Status: discovery draft; supported products and scheduling policy are unresolved.

## Problem Statement

Learners use several TBE products but must independently decide how to distribute
their available time. A DSA roadmap cannot represent course chapters, interview
practice, quizzes, and other learning goals in one schedule without changing its
purpose. Separate schedules can also overbook the same learner.

## Solution

Create a distinct, learner-owned study plan that schedules references to existing
TBE learning items. The source product remains authoritative for access,
enrollment, completion, and rewards. Begin with a small approved set of products
and explicit daily capacity, not a promise to support every TBE app at launch.

## User Stories

1. As a learner, I want to select goals across supported products, so that my plan reflects more than DSA.
2. As a learner, I want to set available days and capacity, so that a plan fits my real schedule.
3. As a learner, I want to preview a plan before saving, so that I can reject an unrealistic workload.
4. As a learner, I want to open a planned item in its original app, so that I use the established learning experience.
5. As a learner, I want completed source items reflected in my plan, so that I do not mark the same work twice.
6. As a learner who misses a day, I want to reschedule unfinished work without losing completed work, so that recovery is manageable.
7. As a learner, I want to pause and resume a plan, so that absence does not create misleading progress.
8. As a learner, I want to change capacity and review the impact, so that rescheduling is intentional.
9. As a learner, I want unavailable or newly locked items explained, so that access changes do not erase my plan silently.
10. As a learner, I want timezone-aware dates, so that the schedule matches the day I intend to study.
11. As a learner using multiple devices, I want conflicting edits detected, so that one device does not discard another's changes.
12. As a learner, I want one item identity across duplicate selections, so that the same assignment is not counted twice accidentally.
13. As an operator, I want unsupported products shown honestly, so that the planner does not promise unavailable integrations.
14. As a maintainer, I want source adapters tested independently, so that adding a product does not rewrite the scheduler.

## Implementation Decisions

Confirmed: the planner is a separate cross-product feature, not another name for
the personalized DSA roadmap. A testable scheduling boundary and source adapters
match the approved module plan.

Proposed, not yet approved:

- Start with two product adapters, recommended DSA questions and Shiksha chapters, only after their source contracts are verified.
- Identify a learning item by source product, item kind, and stable source identifier; do not equate different item types solely by database ID.
- Store a versioned plan containing goals, timezone, availability, capacity, references, dates, and revision. Store scheduling state, not duplicate learning completion.
- Use deterministic scheduling with a preview; disclose unknown effort estimates instead of inventing exact durations.
- Keep manual completion, arbitrary external tasks, calendar integrations, notifications, and AI planning out of the first slice unless explicitly selected.
- Replanning changes unfinished future assignments only; completed source work remains historical evidence.

## Testing Decisions

Test schedule capacity, timezone boundaries, unavailable sources, duplicate item
references, pause/resume, stale revisions, and replan preservation. Use controlled
clocks and source adapters backed by synthetic fixtures. Existing Shiksha and DSA
progress tests and onboarding redirect fixtures are prior art. Browser tests must
verify an authenticated cross-app deep link and source completion reflected in the
planner. Do not rely on an open auth PR until it is validated in the target base.

## Out of Scope

Replacing product-specific roadmaps, creating another completion or gamification
system, guaranteed study-duration estimates, external calendar synchronization,
building every product adapter at once, and copying a competitor's implementation
or proprietary interface assets.

## Further Notes

Blocking decisions: product home/navigation, initial source products, supported
goals, capacity units, effort estimates, timezone defaults, missed-day policy,
and whether manual/external tasks are needed. These are discovery questions, not
agent assumptions. No date or implementation commitment is attached to this PRD.

Recommended discovery artifact: a synthetic two-product weekly plan, including a
missed day, one completed item, and an expired entitlement, reviewed by learners.

## Technical Specification

### Contract and Invariants

A source adapter lists eligible item summaries, resolves deep links, returns
canonical progress, and explains access/unavailability. It must not expose private
content or grant access. The scheduler consumes those summaries and approved
capacity rules, returning a preview with scheduled references, unscheduled work,
and reasons for infeasibility.

Authenticated plan operations support create, read, preview-replan, save-replan,
pause, resume, and archive. Mutating operations use expected revisions and the
authenticated owner. Retries must not create duplicate plans or assignments.

Progress synchronization distinguishes complete, incomplete, inaccessible,
unavailable, and source-error. A source error must never turn a completed item
into incomplete. Only the source product may change completion or award points.

Planner timezone is a separate concern from the leaderboard's fixed IST Periods.
Changing timezone previews date changes before committing them. If timezone
arithmetic is needed, use a supported date/time library rather than handwritten
daylight-saving rules.

### Acceptance Checks

- An approved two-product scenario can be previewed, saved, reopened, and followed through source deep links.
- The plan either respects capacity or explicitly explains unscheduled work.
- Replanning a missed day preserves completed source work and prior plan history.
- A failed source lookup produces a recoverable state rather than erasing assignments.
- Two simultaneous edits cannot silently overwrite each other.
- A learner cannot read or mutate another learner's plan.
- Source completion appears in the planner without an additional completion award.

### Rollout Gates

Resolve the discovery questions, validate two complete source contracts, review
the synthetic workflow, and then publish implementation slices in dependency
order. The discovery PRD itself is not an agent-ready build instruction.
