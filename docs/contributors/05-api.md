# 05 — API contracts

| Field              | Value                                                                              |
| :----------------- | :--------------------------------------------------------------------------------- |
| Owner              | _(unassigned)_                                                                     |
| Companion chapters | [01 Data model](./01-data-model.md), [03 Review workflow](./03-review-workflow.md) |

All routes under `apps/api/src/pages/api/v1/`. Request and response
bodies wrap in the existing `sendAPIResponse({ status, data | message })`
helper used across the codebase. Auth reuses NextAuth sessions already
live in the monorepo; admin endpoints are behind the existing admin
guard (`AdminUser` collection). No new auth stack.

## 1. Lead-facing

### Existing `/v1/devrel/*` endpoints — extended

| Method | Path                   | Change                                                                                                                                   |
| :----- | :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/v1/devrel/dashboard` | adds `points`, `tier`, `cohort { startedAt, endsAt, daysRemaining, inCohort }`, `recent[]` (last 5 contributions).                       |
| GET    | `/v1/devrel/tasks`     | adds `track`, `difficulty`, `pointsMin`, `pointsMax`, `category` filters; adds the new fields from [01](./01-data-model.md) to each row. |

Backward compatibility: callers of the existing shape see the old
fields unchanged. The new fields are additive.

### New `/v1/contributor/*` endpoints

#### `POST /v1/contributor/contributions`

Submit a new Contribution.

Body:

```json
{
  "taskId": "66f...", // optional; null for custom
  "customTitle": "…", // required iff taskId is null
  "track": "code",
  "proofUrl": "https://github.com/org/repo/pull/42",
  "notes": "…"
}
```

Handler:

- `proofUrl` passes through `classify()` from [04](./04-domain-modules.md);
  `proofKind` is set from the result.
- Rejects if `(proofUrl, leadId)` already exists (DB unique index →
  409 with a message pointing at the existing contribution).
- Response: `201 Created` with the new document in `pending` state.

#### `GET /v1/contributor/contributions`

Query: `status`, `page`, `limit`. Default sort: `createdAt desc`.
Returns only the caller's own contributions.

#### `PATCH /v1/contributor/contributions/:id`

Resubmit a `changes_requested` contribution. See
[03 §5](./03-review-workflow.md#5-resubmit-path-lead-action).

Body: `{ proofUrl, notes }`. 403 if not the owner; 409 if not in
`changes_requested`.

#### `POST /v1/contributor/founder-message`

Body:

```json
{
  "category": "mentorship" | "proposal" | "task_blocker" | "general",
  "subject": "...",
  "body": "..."     // max 2000 chars
}
```

Handler:

1. Loads caller's `DevRelLead` to get `currentTier`.
2. Calls `route(tier, category)` from [04](./04-domain-modules.md).
3. If `channel === "in_app_inbox"`: insert a `FounderMessage` with
   the router's `priority` and the lead's current tier captured in
   `tierAtSendTime`.
4. If `channel === "calendly" | "email"`: no DB write; respond with
   `{ channel, target }` so the UI opens the correct link.

## 2. Admin-facing

Prefix: `/v1/admin/contributor/*`. All behind the admin guard.

#### `GET /v1/admin/contributor/queue`

Query: `status` (default `pending`), `track`, `page`, `limit`. Sort:
`createdAt asc` (oldest first for `pending`; newest first for others).
Each row populates: lead `{name, email, currentTier, totalContributionPoints}`,
task `{title, pointsReward}` or `customTitle`, `proofUrl`,
`proofKind`, `notes`, `revisions.length`.

#### `POST /v1/admin/contributor/contributions/:id/review`

Body:

```json
{
  "action": "approve" | "request_changes" | "reject",
  "pointsOverride": 25,                   // optional, approve only
  "feedback": "Shipped and merged."       // required for reject
}
```

Dispatches to the review transaction in [03 §2](./03-review-workflow.md#2-the-review-transaction-approve-path)
or the single-write branches in [03 §3](./03-review-workflow.md#3-other-reviewer-branches).

Responses:

- `200 OK` with the updated Contribution.
- `409 Conflict` on disallowed transition.
- `400 Bad Request` on missing feedback for reject or 0 points for
  approve.

#### `POST /v1/admin/contributor/contributions/:id/retract`

Body: `{ "reason": "PR reverted on 2026-10-20" }`.

See [03 §4](./03-review-workflow.md#4-retract-path).

#### `POST /v1/admin/contributor/tasks`

Publish a new task. Body matches `DevRelTask` new fields from
[01](./01-data-model.md): `title`, `description`, `type`, `priority`,
`track`, `difficulty`, `category`, `pointsReward`, `maxClaims?`,
`requirements?`, `resources?`.

#### `PATCH /v1/admin/contributor/tasks/:id`

Edit or retire a task. Setting `isActive: false` retires it. Changing
`pointsReward` does **not** retroactively re-score approved
contributions — the ledger already recorded the old amount; use
`POST /leads/:id/adjust` if a manual fix is needed.

#### `POST /v1/admin/contributor/leads/:id/adjust`

Body: `{ "delta": 10, "reason": "Pair work with lead X" }`. Writes a
`manual_adjustment` ledger entry.

#### `GET /v1/admin/contributor/leads/:id/ledger`

Returns the lead's full ledger history, newest first. See
[02 §5](./02-contribution-ledger.md#5-reading-the-ledger).

## 3. Error envelope

Already standard in the codebase; included here for clarity:

```json
{ "status": false, "message": "...", "code": "VALIDATION_ERROR" }
```

Error codes used by this spec:

- `VALIDATION_ERROR` — 400
- `UNAUTHENTICATED` — 401
- `FORBIDDEN` — 403
- `NOT_FOUND` — 404
- `STATE_CONFLICT` — 409 (disallowed state machine transition, duplicate
  proof URL, etc.)
- `LEDGER_IMMUTABLE` — 500 (should never surface; indicates a code bug)

## 4. Rate limiting

One submission per lead per 60 seconds, enforced at the handler
boundary with an in-process throttle keyed on `userId`. Crude on
purpose; a real abuse-prevention layer is out of scope. The
learner-side `Pace Limit` from CONTEXT.md does **not** apply here.
