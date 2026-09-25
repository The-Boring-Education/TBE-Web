# PRD: Targeted Admin Workflow Improvements

Status: discovery draft; no specific admin workflow has been selected.

## Problem Statement

The sprint's admin-improvements ticket has no description or acceptance criteria.
The admin app already includes content, user, email, coupon, and other operational
pages. A generic redesign ticket cannot tell an agent what outcome to improve or
which permission and data risks matter.

## Solution

Choose one observed operator workflow, define its current failure or friction,
and implement a complete improvement from authorized data access through feedback
and verification. Keep separate domain changes, such as lifecycle campaigns and
leaderboard moderation, under their existing parent requirements.

## User Stories

1. As an operator, I want the target workflow named precisely, so that the change solves a real task rather than changing appearance arbitrarily.
2. As an operator, I want loading, empty, denied, and failed states distinguished, so that I understand why data is absent.
3. As an operator, I want failures to provide a recoverable action, so that I can continue without losing context.
4. As an operator editing a record, I want validation before submission, so that incomplete input does not create ambiguous errors.
5. As an operator, I want pending actions protected from duplicate submission, so that retries do not create duplicate records.
6. As an operator, I want destructive changes explicitly confirmed, so that accidental clicks are recoverable before submission.
7. As an operator, I want filters and pagination preserved after a change, so that I do not repeatedly search for my place.
8. As an operator, I want a successful mutation reflected in the list, so that stale caches do not contradict the outcome.
9. As an operator, I want conflicting edits reported, so that I do not silently overwrite another person's work.
10. As an administrator, I want authorization enforced on the server, so that hiding a button is not the only security control.
11. As an administrator, I want sensitive operational actions auditable, so that the responsible actor and outcome can be traced.
12. As a maintainer, I want one bounded workflow per implementation issue, so that changes can be independently demonstrated.

## Implementation Decisions

Confirmed: use the existing admin app and API boundary. Reuse its API hooks,
forms, confirmation dialogs, query invalidation, and feedback conventions. Do not
create a second admin app because older workspace instructions mention a
standalone repository.

Candidate workflows, not selected requirements: email preview/history, a content
editing operation, or a user-management task. Leaderboard administration already
has issue #1274 and implementation work in PR #1279; do not duplicate it.

Proposed: define the selected action's request/response, authorization, validation,
pending/error behavior, cache invalidation, and audit requirements together.
Choose existing helpers before introducing a new generic CRUD abstraction.

## Testing Decisions

Use mocked admin API tests for success, validation, denial, server failure, and
duplicate-submit behavior. Add server-side authorization tests for the selected
endpoint and one browser workflow covering the actual operator action. Reuse
existing admin subscription-plan and growth-analytics API tests as prior art.
Production access and real administrative actions are not part of testing this
planning packet.

## Out of Scope

An unbounded admin redesign, replacing the state-management stack, changing every
CRUD page, credential provisioning, running destructive actions, and duplicating
leaderboard or messaging requirements under a generic ticket.

## Further Notes

Blocking inputs: operator/actor, page and action, observed problem, example using
synthetic data, desired result, permission policy, and workflow owner. Request a
short walkthrough or reproducible scenario before creating implementation issues.
Until then, this parent is HITL, not ready for an agent.

## Technical Specification

### Contract and Invariants

The selected workflow must define the authoritative record and permitted actor,
one or more allowed state transitions, request validation, response envelope,
error categories, and post-mutation query refresh. Server authorization is
required even when client navigation is protected.

Do not expose private account fields in public pages or diagnostic logs. A
destructive operation needs an explicit confirmation UI and server-side checks.
Where concurrency matters, reject stale versions instead of accepting last-write
wins without review. If the underlying endpoint cannot meet the desired behavior,
the vertical slice includes its API change and tests.

### Acceptance Checks

- A named operator can complete the selected workflow with synthetic data.
- A forbidden actor receives an appropriate denied response regardless of UI state.
- Validation, pending, empty, and failure states have explicit behavior.
- A successful mutation refreshes the affected data without discarding the operator's context.
- Repeated or conflicting actions behave according to the selected domain's contract.
- Sensitive changes have an appropriate audit trail without logging secrets.

### Rollout Gates

Select the workflow and acceptance examples, approve permission and audit
requirements, then split into independently demonstrable changes. This document
does not authorize admin writes or a production rollout.
