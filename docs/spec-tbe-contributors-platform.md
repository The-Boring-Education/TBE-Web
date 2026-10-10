# Spec — TBE Contributors Program

| Field      | Value                                                                      |
| :--------- | :------------------------------------------------------------------------- |
| Status     | Draft — pending PRD alignment                                              |
| Companion  | `docs/prd-tbe-contributors-platform.md`                                    |
| Apps       | `apps/contributor`, `apps/admin`, `apps/api`                               |
| Depends on | existing `DevRel*` models under `apps/api/src/lib/database/models/DevRel/` |

This spec is a technical companion to the PRD. The PRD defines the
problem, the user stories, the vocabulary, and the module-level
decisions. This file encodes only the schema shapes, the endpoint
contracts, and the migration path.

If this spec and the PRD disagree, the PRD wins.

---

## 1. Vocabulary (binding)

See the PRD for full definitions. Short form:

- **Contribution Point** — the point unit (`CP` in UI only).
- **Tier** — Contributor (0–49 CP) / Lead (50–99 CP) / Captain (100+ CP).
- **Contribution** — a submitted proof-of-work record.
- **Track** — `code | community`.
- **Cohort** — per-lead rolling, 4 calendar months.

Do not use _XP_ or _Level_ for anything in this program; those are
reserved for the learner-side gamification system (CONTEXT.md).

---

## 2. Schema changes

Two existing collections are **extended**, one new collection is
**added**, and one in-document map is **retired**.

### 2.1 `DevRelLead` — extended

```ts
// apps/api/src/lib/database/models/DevRel/DevRelLead.ts
interface DevRelLeadModel {
  // … all existing fields unchanged …

  // NEW — program lifecycle
  cohortStartedAt?: Date; // set when status transitions to "onboarded"
  cohortEndsAt?: Date; // cohortStartedAt + 4 calendar months (Cohort Clock)

  // NEW — program accounting (derived; see §4 for the invariant)
  totalContributionPoints: number; // default 0, min 0
  currentTier: "contributor" | "lead" | "captain"; // default "contributor"
  approvedContributionsCount: number; // default 0
}
```

Indexes to add:

- `{ status: 1, totalContributionPoints: -1 }` — admin "top active leads" view.
- `{ cohortEndsAt: 1 }` — graduation sweeps.

The existing `performanceMetrics` sub-document stays as-is but is not
part of this program's happy path; it was wired for a different flow
and may be deprecated later.

### 2.2 `DevRelTask` — extended, map retired

```ts
// apps/api/src/lib/database/models/DevRel/DevRelTask.ts
interface DevRelTaskModel {
  // … existing fields: title, description, type, priority,
  // assignedTo[], assignedToAll, dueDate, requirements[], resources[],
  // submissionRequired, submissionType, submissionInstructions,
  // tags[], isActive, createdBy …

  // NEW
  track: "code" | "community";
  difficulty: "beginner" | "intermediate" | "advanced";
  category:
    | "frontend"
    | "backend"
    | "fullstack"
    | "documentation"
    | "content"
    | "community"
    | "event"
    | "pr_review";
  pointsReward: number; // required, min 1
  maxClaims?: number | null; // null = unlimited; soft limit in v1
  claimCount: number; // denormalised count; eventually consistent
  isOpen: boolean; // derived (isActive && (maxClaims == null || claimCount < maxClaims))

  // RETIRED (do not read, do not write)
  // completionTracking: Map<leadId, {...}>  — see Contribution collection
}
```

**Migration**: a one-shot script reads every `completionTracking` entry
and writes it as a `Contribution` document (status mapped:
`completed` → `approved`, `in_progress` → `pending`, else dropped).
The Map stays in the schema definition behind a `legacy_` prefix for
one release so an old deploy can still read historical data, then is
removed in the following release.

### 2.3 `Contribution` — new

```ts
// apps/api/src/lib/database/models/DevRel/Contribution.ts
interface ContributionModel {
  leadId: ObjectId; // ref DevRelLead
  userId: ObjectId; // ref User (for queries that don't want to join DevRelLead)
  taskId?: ObjectId; // ref DevRelTask; null for custom contributions
  customTitle?: string; // required iff taskId is null
  track: "code" | "community";

  proofUrl: string; // validated by Proof URL Classifier
  proofKind:
    | "github_pr"
    | "github_issue"
    | "blog"
    | "tweet"
    | "linkedin"
    | "youtube"
    | "drive"
    | "other";
  notes: string; // required

  status: "pending" | "approved" | "changes_requested" | "rejected";
  pointsAwarded: number; // 0 unless status === "approved"

  reviewedBy?: ObjectId; // ref AdminUser
  reviewedAt?: Date;
  reviewerFeedback?: string;

  // Edit history for `changes_requested → pending` resubmits
  revisions: Array<{
    proofUrl: string;
    notes: string;
    submittedAt: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;
}
```

Indexes:

- `{ leadId: 1, createdAt: -1 }` — "my contributions" list.
- `{ status: 1, createdAt: -1 }` — admin review queue.
- `{ proofUrl: 1, leadId: 1 }` **unique** — one proof URL per lead,
  prevents double-submit of the same PR by the same person.

The `revisions[]` array is append-only in the application layer; a
`changes_requested → pending` transition appends the previous
`{proofUrl, notes}` to `revisions[]` and overwrites the top-level
fields with the new values. Status flips to `pending` and
`reviewerFeedback` is cleared on resubmit (new review is a new
decision).

### 2.4 `ContributionLedger` — new (deep module data layer)

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

Collection is append-only. Enforcement:

- Mongoose middleware blocks `pre('updateOne' | 'findOneAndUpdate' |
'deleteOne' | 'deleteMany')` and throws.
- A regression test asserts the query helper file (§4) contains no
  update/delete calls on this collection.

### 2.5 `FounderMessage` — new

```ts
// apps/api/src/lib/database/models/DevRel/FounderMessage.ts
interface FounderMessageModel {
  leadId: ObjectId;
  userId: ObjectId;
  tierAtSendTime: "contributor" | "lead" | "captain";
  category: "mentorship" | "proposal" | "task_blocker" | "general";
  subject: string;
  body: string; // max 2000 chars
  priority: "normal" | "high";

  resolvedAt?: Date;
  resolvedBy?: ObjectId;
  resolutionNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

Index: `{ resolvedAt: 1, priority: -1, createdAt: 1 }` — admin inbox
"open, high-pri, oldest first" view.

---

## 3. Module layout

The PRD's deep modules land at these paths:

| Module                   | Path                                                      | Shape         |
| :----------------------- | :-------------------------------------------------------- | :------------ |
| Contribution Ledger      | `apps/api/src/lib/database/queries/contributionLedger.ts` | query helper  |
| Tier Resolver            | `apps/api/src/lib/contributor/tier.ts`                    | pure function |
| Submission State Machine | `apps/api/src/lib/contributor/submissionState.ts`         | pure function |
| Cohort Clock             | `apps/api/src/lib/contributor/cohortClock.ts`             | pure function |
| Proof URL Classifier     | `apps/api/src/lib/contributor/proofUrl.ts`                | pure function |
| Escalation Router        | `apps/api/src/lib/contributor/escalation.ts`              | pure function |

Each pure-function module is a single file exporting one function and
its types; no classes, no singletons. Imported from API handlers and
from tests directly.

---

## 4. Review transaction (the one place correctness matters)

Pseudocode for the approve path (`POST /v1/admin/contributor/contributions/:id/review`
with `action: "approve"`). All steps run inside a Mongoose session /
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
if existingEntry: return the existing state (no re-write, no double-pay)

newBalance = lead.totalContributionPoints + pointsToAward
newTier    = tier(newBalance)

ledger.insertOne({
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

if newTier != oldTier: emit tier-promotion event (notification is UI's job)
commit transaction
```

The `request_changes` and `reject` branches skip the ledger and only
update the Contribution.

**Invariant** (asserted in tests and by a periodic DB check):
`SUM(ledger.delta WHERE leadId = X) == DevRelLead.totalContributionPoints`
for every lead.

---

## 5. API contracts (summary; full OpenAPI not generated here)

All routes under `apps/api/src/pages/api/v1/`. Request/response bodies
wrap in the existing `sendAPIResponse({ status, data | message })`
helper used across the codebase.

### Lead-facing (`/v1/contributor/*` and `/v1/devrel/*`)

| Method | Path                                | Purpose                                                      |
| :----- | :---------------------------------- | :----------------------------------------------------------- |
| GET    | `/v1/devrel/dashboard`              | **extended**: adds `points`, `tier`, `cohort`, `recent[]`    |
| GET    | `/v1/devrel/tasks`                  | **extended**: filters `track`, `difficulty`, `pointsMin/Max` |
| POST   | `/v1/contributor/contributions`     | submit a Contribution                                        |
| GET    | `/v1/contributor/contributions`     | list mine (filter by status)                                 |
| PATCH  | `/v1/contributor/contributions/:id` | resubmit a `changes_requested` Contribution                  |
| POST   | `/v1/contributor/founder-message`   | escalation                                                   |

### Admin-facing (`/v1/admin/contributor/*`)

| Method | Path                                              | Purpose                            |
| :----- | :------------------------------------------------ | :--------------------------------- |
| GET    | `/v1/admin/contributor/queue`                     | pending-first review queue         |
| POST   | `/v1/admin/contributor/contributions/:id/review`  | approve / request_changes / reject |
| POST   | `/v1/admin/contributor/contributions/:id/retract` | retract an approved contribution   |
| POST   | `/v1/admin/contributor/tasks`                     | publish a task                     |
| PATCH  | `/v1/admin/contributor/tasks/:id`                 | edit / retire a task               |
| POST   | `/v1/admin/contributor/leads/:id/adjust`          | manual ledger adjustment (rare)    |
| GET    | `/v1/admin/contributor/leads/:id/ledger`          | per-lead ledger history            |

**Review body**:

```json
{ "action": "approve" | "request_changes" | "reject",
  "pointsOverride": 25,                 // optional, approve only
  "feedback": "Shipped and merged." }
```

**Retract body**:

```json
{ "reason": "PR reverted on 2026-10-20" }
```

---

## 6. UI shape

### `apps/contributor` (Next.js, port 3008)

- `/` — public landing (program overview, apply CTA → existing
  `/v1/devrel/apply`).
- `/status` — unauthenticated application status by email (uses
  existing `/v1/devrel/applications/status/[email]`).
- `/dashboard` — authenticated lead's home. Sections:
  1. Header: name, avatar, Tier badge, points, progress-to-next-Tier,
     cohort days remaining.
  2. "Pick a task" card → links to `/tasks`.
  3. "My contributions" list with status badges, newest first.
  4. "Message Sachin" button (opens the Escalation Router drawer).
- `/tasks` — open-tasks catalog with Track / Difficulty / Points filters.
- `/tasks/:id` — task detail + "Submit Contribution" drawer.

### `apps/admin` (Vite + React, existing)

New section "Contributors":

- `/contributors/queue` — review queue. Row shows: lead name, lead
  current points + tier, task title (or "custom"), proof URL (link
  preview + the URL kind as a chip), notes, revision count. Row
  actions: approve (modal with points override), request changes,
  reject. Clicking a row expands to show the full `revisions[]`.
- `/contributors/tasks` — list + "New task" button → form (title,
  description, track, difficulty, category, points, link, max claims).
- `/contributors/leads/:id` — single lead view: ledger history,
  contributions, founder messages, manual-adjust button.
- `/contributors/inbox` — FounderMessage inbox, open-first.

No new design system work; reuses the admin's existing shadcn-ish
component kit.

---

## 7. Phased work plan (not issues yet; one issue per bullet when ready)

### Phase 1 — Data model & review loop (API + minimal admin)

1. Add `cohortStartedAt`, `cohortEndsAt`, `totalContributionPoints`,
   `currentTier`, `approvedContributionsCount` fields and indexes to
   `DevRelLead`; backfill zeros/defaults.
2. Add `track`, `difficulty`, `category`, `pointsReward`, `maxClaims`,
   `claimCount` fields and `isOpen` virtual to `DevRelTask`; mark
   `completionTracking` legacy; migration script.
3. Create `Contribution` model with unique `(proofUrl, leadId)` index.
4. Create `ContributionLedger` model with append-only middleware.
5. Create `FounderMessage` model.
6. Implement pure modules: `tier`, `submissionState`, `cohortClock`,
   `proofUrl`, `escalation`. Unit tests per PRD §Testing Decisions.
7. Implement the review transaction (`POST /v1/admin/contributor/contributions/:id/review`)
   with the full §4 flow and the idempotency guard.
8. Implement `POST /v1/contributor/contributions` and
   `GET /v1/contributor/contributions`.
9. Minimal admin page `/contributors/queue` to drive the review loop
   end-to-end.
10. Invariant test: approve N random contributions, assert
    `SUM(ledger.delta) == DevRelLead.totalContributionPoints` for
    every lead.

### Phase 2 — Lead portal

11. Build `/dashboard` with header, "my contributions", cohort days
    remaining, Tier progress bar.
12. Build `/tasks` catalog with filters.
13. Build the submit drawer (reuses the Proof URL Classifier for
    client-side validation hints).
14. Build the resubmit flow for `changes_requested`.
15. Build the "Message Sachin" drawer (Escalation Router).

### Phase 3 — Admin polish

16. Task publisher / editor pages.
17. FounderMessage inbox + SLA badge.
18. Per-lead ledger history page.
19. Retract flow (confirm modal; writes negative ledger entry).
20. Manual adjustment flow.

### Phase 4 — Lifecycle & cleanup

21. Nightly job: for leads with `cohortEndsAt < now` and no graduation
    marker, mark `onboardingProgress.completedAt` and send a graduation
    email (reuses the existing mail path).
22. Drop the legacy `completionTracking` Map after one release.
23. Document the Contribution Ledger invariant in an ADR under
    `docs/adr/`.

### Explicitly out of this plan

- Webhook-based auto-approval of merged PRs.
- Public leaderboards.
- Co-authorship.
- Discord / Telegram bots.
- Certificate generation.

---

## 8. Risks and open questions

1. **Program-scope question (blocking Phase 1)**: this spec assumes the
   TBE "Contributor Program" is the same program as the existing
   `DevRel*` + `oncampus` infra. If it is a separate open-source
   initiative (unrelated to college ambassadors), the model-reuse plan
   is wrong and we add parallel collections instead. Resolve by reading
   the Notion doc with Sachin before Phase 1.
2. **Tier thresholds (50, 100)**: lifted from the original PRD draft.
   Validate against last cohort's distribution.
3. **Who is an `AdminUser` for review**: today, only Sachin. A single
   SPOF for review throughput. Not blocking v1, but should be addressed
   before cohort size exceeds ~30 active leads.
4. **PR-revert detection is manual**: v2 webhook work solves this.
   Document in the lead-facing FAQ that reverted PRs may be retracted.
5. **Ledger invariant drift**: belt-and-braces — the periodic DB check
   is cheap and should run nightly from day one; a drift alert goes to
   Sachin before a lead notices.
