# PRD: Personalized DSA Roadmap

Status: draft; recommendation policy and first cohort require approval.

## Problem Statement

DSA learners provide their experience, timeline, target, language, and topic
interests, but a topic map alone does not explain which eligible material they
should learn next. Learners can face an undifferentiated catalog or lose confidence
when recommendations ignore work they have already completed.

## Solution

Offer an explainable sequence of DSA topics and questions tailored to existing
preferences and verified progress. Keep this roadmap distinct from the
cross-product planner: the roadmap recommends what to learn; the planner can
later schedule selected work across products.

## User Stories

1. As a new DSA learner, I want recommendations based on my onboarding answers, so that my starting point is relevant.
2. As a learner with existing progress, I want completed questions recognized, so that I do not start over.
3. As a learner, I want a reason for the next recommended topic, so that I can understand the sequence.
4. As a learner, I want prerequisite topics considered, so that advanced questions do not become unexplained blockers.
5. As a learner, I want language and topic preferences editable, so that my roadmap can reflect a changing goal.
6. As a learner, I want a preview before replacing my roadmap, so that a preference change is not destructive.
7. As a learner, I want locked material identified without exposing its protected content, so that access rules remain clear.
8. As a learner with no eligible remaining material, I want an honest empty or completed state, so that missing content is not presented as a loading error.
9. As a learner, I want the next recommendation to reflect a completion or reversal, so that it stays aligned with real progress.
10. As a learner using two devices, I want my saved roadmap to be consistent, so that edits are not silently overwritten.
11. As a learner, I want accessible navigation on mobile and desktop, so that I can use the roadmap without precise pointer gestures.
12. As a maintainer, I want deterministic recommendation fixtures, so that changes in ordering can be explained and tested.
13. As an operator, I want a safe fallback to the existing catalog, so that a recommendation outage does not prevent learning.

## Implementation Decisions

Confirmed: this is a DSA-only feature, separate from the cross-product planner.
Reuse existing onboarding preferences, question identities, progress, access
checks, and topic UI. A testable recommendation policy is an approved boundary.

Proposed, not yet approved:

- Start with deterministic recommendations, not an LLM dependency.
- Store a versioned roadmap selection with learner ownership, normalized preferences, policy version, revision, and ordered references to existing catalog items.
- Derive completion from canonical progress, not a second set of completion flags.
- Distinguish unavailable content, access-locked content, prerequisite ordering, and completed material.
- Treat timeline as a prioritization input unless a scheduling policy is explicitly approved; daily calendar slots belong to the separate planner.
- Reuse the shared query layer with explicit stale time and invalidation after preference or progress changes.

## Testing Decisions

Test recommendation output and explanation against synthetic catalog/progress
fixtures, including conflicting goals, no content, all completed, deleted items,
and access changes. Reuse DSA roadmap access-summary and topic-roadmap regression
tests as prior art. Add ownership and stale-revision API tests, plus a browser
journey from preference preview to an accessible question and back after progress.
No real AI calls are necessary for the proposed deterministic version.

## Out of Scope

Cross-product calendar scheduling, promises of placement outcomes, a new question
catalog, duplicate progress storage, paid-access bypasses, automatic subscription
changes, and deploying an AI recommendation service without a separate decision.

## Further Notes

Blocking decisions: approve recommendation inputs and weights, prerequisite
metadata ownership, whether locked topics appear in previews, deterministic
versus AI recommendations, and the first cohort. The user approved separating
the roadmap from the planner, not a specific ranking algorithm.

Recommended first slice: saved preferences produce one explainable next DSA item
and preserve existing progress. Follow with full topic sequencing only after that
path works end to end. No release commitment has been made.

## Technical Specification

### Contract and Invariants

The policy accepts normalized preferences, stable catalog references, entitlement
summaries, and canonical completed-item identifiers. It returns ordered eligible
references with reason codes, a policy version, and explicit unavailable/locked
states. Identical inputs and policy versions must produce identical ordering in
the deterministic option, including a stable tie-breaker.

Per-user read, preview, save, and replace operations must derive ownership from
the authenticated identity. Preview does not mutate progress. Save/replace uses
an expected revision and returns a conflict for stale edits. Rebuilding a roadmap
never enrolls the learner, grants access, or awards points.

Recheck access when opening material; a saved recommendation is not an access
token. Catalog deletion produces an unavailable state and a replacement proposal,
not silent progress loss. Avoid full-catalog payloads when summaries suffice.

### Acceptance Checks

- A returning learner's completed questions remain completed after saving a roadmap.
- Repeated preview of unchanged inputs returns stable ordering and explanations.
- A preference edit is previewable and a stale-device save receives a conflict.
- Locked question bodies are never present in an unauthorized response.
- A failed recommendation request leaves the existing catalog usable.
- Completing or reversing a question refreshes recommendations without duplicating rewards.
- No dates or workloads are silently created in the separate planner.

### Rollout Gates

Approve the recommendation policy and fixtures, enable for an explicitly selected
cohort, compare suggested items with known learner histories using non-sensitive
test data, and preserve a route to the existing topic catalog throughout rollout.
