# 02 — Contribution Ledger

| Field              | Value                                                                              |
| :----------------- | :--------------------------------------------------------------------------------- |
| Owner              | _(unassigned — this chapter must have a named owner before Phase 1 lands)_         |
| Companion chapters | [01 Data model](./01-data-model.md), [03 Review workflow](./03-review-workflow.md) |

This is the one piece of the program that must not be gotten wrong.
The Ledger is the single source of truth for every Contribution Point
that ever changes hands. `DevRelLead.totalContributionPoints` is a
denormalised cache of a ledger sum; the Ledger itself is append-only.

## 1. Collection

```ts
// apps/api/src/lib/database/models/DevRel/ContributionLedger.ts
interface ContributionLedgerModel {
  leadId: ObjectId; // ref DevRelLead
  userId: ObjectId; // denormalised ref User
  submissionId?: ObjectId; // ref Contribution; null for manual_adjustment
  kind: "contribution_approved" | "manual_adjustment" | "retraction";
  delta: number; // signed int (negative only for retraction)
  balanceAfter: number; // sum of deltas up to and including this row
  reason: string; // required for manual_adjustment & retraction
  actorId: ObjectId; // ref AdminUser
  createdAt: Date; // the ONLY timestamp — no updatedAt
}
```

Indexes:

- `{ leadId: 1, createdAt: -1 }` — history reads.
- `{ submissionId: 1, kind: 1 }` **unique sparse** — idempotency for
  `contribution_approved`; a retraction has `kind: "retraction"` so it
  doesn't collide. `manual_adjustment` has no `submissionId` so is
  excluded from this unique index via `sparse`.

## 2. Query helper interface

Lives at `apps/api/src/lib/database/queries/contributionLedger.ts`.
Four functions, nothing else public:

```ts
record(entry: LedgerEntry): Promise<LedgerEntry>
balanceOf(leadId: ObjectId): Promise<number>
historyOf(leadId: ObjectId, opts: { page: number; limit: number }): Promise<LedgerEntry[]>
retract(originalEntryId: ObjectId, reason: string, actorId: ObjectId): Promise<LedgerEntry>
```

- **`record`** is idempotent on `(submissionId, kind)`. If an entry
  already exists for the same pair, it returns that entry unchanged.
  Callers can safely retry on network error.
- **`balanceOf`** is a `$sum` aggregation; it is the ground truth. The
  cached `DevRelLead.totalContributionPoints` is for display and
  queries, never for computing a new balance.
- **`historyOf`** returns newest-first, paged.
- **`retract`** writes a **new negative row** referencing the original
  by `submissionId`, with `kind: "retraction"`. It never updates or
  deletes the original.

## 3. Immutability — enforcement

The collection is append-only. Three layers of protection:

1. **Schema**: `timestamps: { createdAt: true, updatedAt: false }`. No
   setter is defined on any field.
2. **Mongoose middleware** on the model blocks every mutating hook:

   ```ts
   LedgerSchema.pre(
     [
       "updateOne",
       "updateMany",
       "findOneAndUpdate",
       "findOneAndReplace",
       "deleteOne",
       "deleteMany",
       "findOneAndDelete",
     ],
     function () {
       throw new LedgerImmutableError(this.op);
     },
   );
   ```

3. **Regression test**: `apps/testing/src/unit/database/contributionLedger.test.ts`
   greps the query helper file and asserts no update/delete calls on
   this collection appear anywhere in the codebase except the test
   fixtures themselves.

## 4. The invariant

For every lead:

```
SUM(ledger.delta WHERE leadId = X) == DevRelLead.totalContributionPoints
```

Where this is asserted:

- **In the review transaction** (see [03](./03-review-workflow.md)):
  the transaction writes the ledger row and the cached total under
  one session; a crash between the two rolls both back.
- **In unit tests**: a property-style test approves N random
  contributions in random order, retracts a random subset, then
  compares the cached total to the ledger sum.
- **In production**: a nightly job (owner: ops; wire via existing
  cron infra when it exists, or a Vercel scheduled function) runs the
  check across all leads and emails Sachin on drift. Drift should
  never happen; the alert exists so a bug is caught before a lead
  disputes a point count.

## 5. Reading the ledger

Two API endpoints expose ledger data (see [05 API](./05-api.md)):

- `GET /v1/admin/contributor/leads/:id/ledger` — full ledger history
  for one lead; admin only.
- `GET /v1/contributor/contributions` — lead-facing contribution list,
  which joins ledger rows to show the point award per contribution.
  Does **not** expose `balanceAfter` to the lead — only the per-row
  `pointsAwarded`.

## 6. Open questions

- **Pair work / co-authorship**: v1 awards points to one `leadId` only.
  A manual adjustment covers the paired lead. v2 may add
  `coContributors[]` to `Contribution` and emit one ledger row per
  co-contributor on approval; keep this seam in mind when picking
  index shapes.
- **Partial retraction**: v1 retracts the full original amount. A
  partial retraction (reverted PR earned 50 CP but half the diff
  survived) is not supported; the reviewer uses a `manual_adjustment`
  to shape the final number.
