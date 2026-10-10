# 01 — Data model

| Field              | Value                                                                                                |
| :----------------- | :--------------------------------------------------------------------------------------------------- |
| Owner              | _(unassigned)_                                                                                       |
| Companion chapters | [02 Contribution Ledger](./02-contribution-ledger.md), [03 Review workflow](./03-review-workflow.md) |

Two existing collections are extended, two new collections are added,
and one in-document map is retired. The ledger is covered in [02];
this chapter is everything else.

## 1. `DevRelLead` — extended

```ts
// apps/api/src/lib/database/models/DevRel/DevRelLead.ts
interface DevRelLeadModel {
  // … all existing fields unchanged …

  // NEW — program lifecycle
  cohortStartedAt?: Date; // set when status transitions to "onboarded"
  cohortEndsAt?: Date; // cohortStartedAt + 4 calendar months (see Cohort Clock in 04)

  // NEW — program accounting (derived; see the ledger invariant in 02)
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

## 2. `DevRelTask` — extended, map retired

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
  // completionTracking: Map<leadId, {...}>  — see Contribution collection below
}
```

### Migration from `completionTracking`

A one-shot script reads every `completionTracking` entry on every
`DevRelTask` and writes it as a `Contribution` document. Status
mapping:

| completionTracking.status                   | Contribution.status |
| :------------------------------------------ | :------------------ |
| `completed` + reviewStatus `approved`       | `approved`          |
| `completed` + reviewStatus `needs_revision` | `changes_requested` |
| `in_progress`                               | `pending`           |
| `pending`                                   | _dropped_           |

The Map stays in the schema definition behind a `legacy_` prefix for
one release so an old deploy can still read historical data, then is
removed in the following release. Migration is in `apps/api/scripts/`
(exact filename decided during Phase 1).

## 3. `Contribution` — new

```ts
// apps/api/src/lib/database/models/DevRel/Contribution.ts
interface ContributionModel {
  leadId: ObjectId; // ref DevRelLead
  userId: ObjectId; // ref User (for queries that don't want to join DevRelLead)
  taskId?: ObjectId; // ref DevRelTask; null for custom contributions
  customTitle?: string; // required iff taskId is null
  track: "code" | "community";

  proofUrl: string; // validated by Proof URL Classifier (see 04)
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
`reviewerFeedback` is cleared on resubmit (a new review is a new
decision). State-machine rules in [03](./03-review-workflow.md).

## 4. `FounderMessage` — new

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

Priority is set by the Escalation Router at write time (see [04](./04-domain-modules.md)),
not by the lead.

## 5. Data-privacy posture

- `discordHandle`, `telegramHandle`, `linkedinUrl` on `DevRelLead` are
  all optional and never shown to other contributors. Only the admin
  app and the contributor themselves see them.
- `FounderMessage.body` is never surfaced outside the admin inbox.
- No cross-lead PII is ever included in a response that goes to a
  non-admin.
