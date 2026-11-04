# 08 — Rollout, risks, and open questions

| Field | Value                     |
| :---- | :------------------------ |
| Owner | _(program lead — Sachin)_ |

The phased plan feeds `/to-issues` later; one issue per bullet.
Nothing in this chapter is a hard deadline — the ordering is a
dependency graph, not a calendar.

## 1. Phases

### Phase 1 — Data model & review loop

Goal: end-to-end "lead submits, admin approves, points land in the
ledger" working with a minimal UI.

1. Add `cohortStartedAt`, `cohortEndsAt`, `totalContributionPoints`,
   `currentTier`, `approvedContributionsCount` fields and indexes to
   `DevRelLead`; backfill zeros/defaults. ([01](./01-data-model.md))
2. Add `track`, `difficulty`, `category`, `pointsReward`, `maxClaims`,
   `claimCount` fields and the `isOpen` virtual to `DevRelTask`; mark
   `completionTracking` legacy; write and dry-run the migration
   script. ([01](./01-data-model.md))
3. Create `Contribution` model with unique `(proofUrl, leadId)`
   index. ([01](./01-data-model.md))
4. Create `ContributionLedger` model with append-only middleware and
   the query helper. ([02](./02-contribution-ledger.md))
5. Create `FounderMessage` model. ([01](./01-data-model.md))
6. Implement pure modules: `tier`, `submissionState`, `cohortClock`,
   `proofUrl`, `escalation`. Unit tests per
   [04](./04-domain-modules.md).
7. Implement the review transaction (`POST /v1/admin/contributor/contributions/:id/review`)
   with the full flow from
   [03 §2](./03-review-workflow.md#2-the-review-transaction-approve-path)
   and the idempotency guard.
8. Implement `POST /v1/contributor/contributions` and
   `GET /v1/contributor/contributions`.
9. Minimal admin page `/contributors/queue` (approve-only; no custom
   points override; no filters) to drive the review loop end-to-end.
10. Invariant test: approve N random contributions, assert
    `SUM(ledger.delta) == DevRelLead.totalContributionPoints` for
    every lead. ([02 §4](./02-contribution-ledger.md#4-the-invariant))

### Phase 2 — Lead portal

11. Build `/dashboard` with header, "my contributions", cohort days
    remaining, Tier progress bar. ([06](./06-ui-contributor-app.md))
12. Build `/tasks` catalog with filters. ([06](./06-ui-contributor-app.md))
13. Build the submit drawer (reuses the Proof URL Classifier for
    client-side validation hints).
14. Build the resubmit flow for `changes_requested`.
    ([03 §5](./03-review-workflow.md#5-resubmit-path-lead-action))
15. Build the "Message Sachin" drawer (Escalation Router).

### Phase 3 — Admin polish

16. Task publisher / editor pages. ([07 §3](./07-ui-admin.md#3-contributorstasks))
17. FounderMessage inbox + SLA badge.
18. Per-lead ledger history page.
19. Retract flow (confirm modal; writes negative ledger entry).
    ([03 §4](./03-review-workflow.md#4-retract-path))
20. Manual adjustment flow.

### Phase 4 — Lifecycle & cleanup

21. Nightly job: for leads with `cohortEndsAt < now` and no
    graduation marker, mark `onboardingProgress.completedAt` and send
    a graduation email (reuses the existing mail path).
22. Drop the legacy `completionTracking` Map after one release.
23. Document the Contribution Ledger invariant in an ADR under
    `docs/adr/`.

## 2. Out of scope for v1

- Webhook-based auto-approval of merged PRs. The Proof URL
  Classifier already parses the data a webhook would need, so this
  is a clean v2 add.
- Automatic PDF certificates on cohort end.
- A Discord / Telegram bot that mirrors contribution events.
- Public leaderboards. Lead-visible leaderboards. Any ranking at all
  — Contribution Points are a personal counter in v1.
- Co-authorship / pair submissions as a first-class field (manual
  adjustments cover the pair's second lead).
- A shared global quarterly cohort — v1 is per-lead rolling only.
- Reward fulfillment logistics (swag addresses, LoR templates).
- Integrating Contribution Points with the learner-side gamification
  Points / Period Score / Leaderboard. Separate systems, separate
  ADR if ever unified.
- Replacing the `DevRelLead` application flow (apply → interview →
  approved). This program assumes an accepted `DevRelLead` and
  extends from there.

## 3. Risks and open questions

1. **Program-scope question (blocking Phase 1)**: this spec assumes
   the TBE "Contributor Program" is the same program as the existing
   `DevRel*` + `oncampus` infra. If it is a separate open-source
   initiative (unrelated to college ambassadors), the model-reuse
   plan is wrong and we add parallel collections instead. Resolve by
   reading the Notion doc with Sachin before Phase 1 starts.
2. **Tier thresholds (50, 100)**: lifted from the original PRD draft.
   Sachin to sanity-check against last cohort's distribution.
   Moving them later is a one-line change in the Tier Resolver
   ([04](./04-domain-modules.md)) plus a backfill of
   `DevRelLead.currentTier`.
3. **Who is an `AdminUser` for review**: today, only Sachin. A
   single SPOF for review throughput. Not blocking v1, but should
   be addressed before active-lead count exceeds ~30.
4. **PR-revert detection is manual**: the v2 webhook work solves
   this. In the meantime, document in the lead-facing FAQ that a
   reverted PR may be retracted.
5. **Ledger invariant drift**: cheap periodic DB check must run
   nightly from day one; a drift alert goes to Sachin before a
   lead ever notices.
6. **Migration from `completionTracking`**: dry-run on a cloned
   DB before touching prod. The old Map has no explicit "approved"
   signal — the mapping table in [01](./01-data-model.md) is
   best-effort; expect some rows to need manual review.

## 4. Done-ness

Phase 1 is done when:

- Every pure module has a passing test file.
- A real lead can submit via the API, Sachin can approve via
  `/contributors/queue`, and `balanceOf(leadId)` matches the lead's
  cached total.
- The invariant test is in CI and green.

Phase 2 is done when:

- A lead can go end-to-end in the portal without Sachin's help once
  they're onboarded.

Phase 3 is done when:

- Sachin uses no other tool (sheet, Discord DM, Google Form) for
  reviewing, task-publishing, or escalation handling during a full
  working week.

Phase 4 is done when:

- The legacy `completionTracking` Map is gone from the schema.
- The invariant ADR is merged.
