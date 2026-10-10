# 03 — Review workflow

| Field              | Value                                                                                                                     |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------ |
| Owner              | _(unassigned)_                                                                                                            |
| Companion chapters | [02 Contribution Ledger](./02-contribution-ledger.md), [04 Domain modules](./04-domain-modules.md), [05 API](./05-api.md) |

What a reviewer can do to a `Contribution`, in what order, and under
what transaction boundaries. The pure state-machine function
`canTransition()` lives in [04](./04-domain-modules.md); this chapter
is how it is used.

## 1. States and transitions

```
                 ┌────────────────────────────┐
                 ▼                            │
  (new) ──► pending ──► approved              │
             │  ▲          │                  │
             │  │          └► retracted  ◄────┘ (reviewer; writes negative ledger)
             │  │
             │  └──── changes_requested ◄──┐
             │           │                 │
             │           └── (resubmit) ───┘
             │
             └► rejected  (terminal)
```

- `pending → approved` — reviewer action; writes a ledger row.
- `pending → changes_requested` — reviewer action; no ledger write.
- `pending → rejected` — reviewer action; terminal; no ledger write.
- `changes_requested → pending` — **lead** action (resubmit). Edits
  `proofUrl` and `notes` in place; appends the previous values to
  `revisions[]`; clears `reviewerFeedback`. Same `_id`, not a new
  document.
- `changes_requested → rejected` — reviewer action after lead doesn't
  resubmit or resubmits inadequately; terminal.
- `approved → retracted` — reviewer action; writes a **negative**
  ledger row. The Contribution's `status` moves to `retracted` and
  `reviewerFeedback` is updated with the retraction reason. The
  original `pointsAwarded` is left intact for history; the user's
  cached total reflects the retraction via the ledger invariant.

Every status write goes through `canTransition(from, to)` from [04].
A disallowed transition is a 409.

## 2. The review transaction (approve path)

Pseudocode for `POST /v1/admin/contributor/contributions/:id/review`
with `action: "approve"`. All steps run inside a Mongoose session /
transaction:

```
assert reviewer is an active AdminUser                                       // 401 otherwise
load contribution by id                                                      // 404 otherwise
assert canTransition(contribution.status, "approved")                        // 409 otherwise
load lead by contribution.leadId
pointsToAward = body.pointsOverride ?? contribution.task?.pointsReward ?? 0  // 400 if 0 and no task
assert pointsToAward > 0

// Idempotency: did we already record this exact approval?
existingEntry = ledger.findOne({ submissionId: id, kind: "contribution_approved" })
if existingEntry:
  return the existing state (no re-write, no double-pay)

newBalance = lead.totalContributionPoints + pointsToAward
oldTier    = lead.currentTier
newTier    = tier(newBalance)                                                // from 04

ledger.record({
  leadId, userId, submissionId: id,
  kind: "contribution_approved",
  delta: pointsToAward,
  balanceAfter: newBalance,
  reason: `Approved contribution ${id}`,
  actorId: reviewer.id,
})

contribution.update({
  status: "approved",
  pointsAwarded: pointsToAward,
  reviewedBy: reviewer.id,
  reviewedAt: now,
  reviewerFeedback: body.feedback,
})

lead.update({
  totalContributionPoints: newBalance,
  currentTier: newTier,
  $inc: { approvedContributionsCount: 1 },
})

if newTier != oldTier:
  emit tier-promotion event              // notification is UI's job; see 06, 07

commit transaction
```

A crash at any step rolls everything back. Idempotency ensures a
network retry re-reads the existing ledger row and returns a
same-shape response.

## 3. Other reviewer branches

- **`action: "request_changes"`** — update
  `{status: "changes_requested", reviewerFeedback: body.feedback,
  reviewedBy, reviewedAt}`. No ledger write.
- **`action: "reject"`** — update
  `{status: "rejected", reviewerFeedback: body.feedback, reviewedBy, reviewedAt}`.
  `body.feedback` is **required** here (enforced at the handler
  boundary, 400 if missing). No ledger write.

Both branches are a single document write, no transaction needed.

## 4. Retract path

`POST /v1/admin/contributor/contributions/:id/retract`. Transaction
boundaries:

```
assert reviewer is an active AdminUser
load contribution by id
assert contribution.status == "approved"                                     // 409 otherwise
originalEntry = ledger.findOne({ submissionId: id, kind: "contribution_approved" })
assert originalEntry exists                                                  // 500 — invariant violation

ledger.retract(originalEntry._id, body.reason, reviewer.id)
  // writes a NEW row: delta: -originalEntry.delta, kind: "retraction"

contribution.update({ status: "retracted", reviewerFeedback: body.reason })
lead.update({
  totalContributionPoints: lead.totalContributionPoints - originalEntry.delta,
  currentTier: tier(newBalance),
})
commit
```

Retract is **not** idempotent — a reviewer retracting twice would
write two negative rows. The UI confirms before firing; the API
responds with the current state so a retried call that overshoots
returns an obvious result rather than silently repeating.

(If we need retract idempotency later, the natural key is
`(submissionId, "retraction")`, which can be made unique.)

## 5. Resubmit path (lead action)

`PATCH /v1/contributor/contributions/:id` with
`{proofUrl, notes}`. The handler:

```
load contribution; assert ownership (contribution.userId === session.userId)  // 403 otherwise
assert canTransition(contribution.status, "pending")                           // 409 otherwise — only changes_requested resubmits
contribution.revisions.push({ proofUrl: current.proofUrl, notes: current.notes, submittedAt: current.updatedAt })
contribution.update({ proofUrl, notes, status: "pending", reviewerFeedback: null })
```

Single document write. The ledger is untouched because no points were
ever awarded.

## 6. Concurrency notes

- Two reviewers approving the same contribution at the same moment:
  the unique `(submissionId, "contribution_approved")` index on the
  ledger causes the second write to fail; the second handler reads
  the existing row and returns a same-shape response (idempotent).
- Two leads submitting the same proof URL: the unique
  `(proofUrl, leadId)` index on `Contribution` is only unique per
  lead. Two different leads can both submit the same PR URL — this
  is intentional (pair work, re-tweet drives). Reviewer judgement
  decides whether both get points.
- Claim races on `maxClaims`: v1 does not enforce this transactionally
  (see [01](./01-data-model.md)). The reviewer decides whether the
  Nth claim is approved.
