# 07 — Admin UI

| Field              | Value                                                                 |
| :----------------- | :-------------------------------------------------------------------- |
| App                | `apps/admin` (Vite + React, shadcn-ish component kit, TanStack Query) |
| Owner              | _(unassigned)_                                                        |
| Companion chapters | [05 API](./05-api.md), [03 Review workflow](./03-review-workflow.md)  |

A new "Contributors" section inside the existing admin app. Reuses the
app's layout, auth, toasts, and query client — no new infra.

## 1. Navigation

A top-level "Contributors" item in the sidebar with four sub-pages:

- `/contributors/queue` — review queue (default landing).
- `/contributors/tasks` — task management.
- `/contributors/leads` — lead list.
- `/contributors/inbox` — FounderMessage inbox.

A badge on the sidebar item shows the count of **pending**
contributions (polled every 60s with a stale-while-revalidate cache).

## 2. `/contributors/queue`

The review loop. This is the page Sachin lives on.

### 2.1 Row shape

| Column    | Content                                                                        |
| :-------- | :----------------------------------------------------------------------------- |
| Lead      | avatar, name, Tier chip (color-coded)                                          |
| Current   | `totalContributionPoints` number                                               |
| Task      | task title (clickable → `/tasks/:id`) or `customTitle` with a "custom" chip    |
| Proof     | `proofKind` chip + the URL as a `<a target="_blank">` with the hostname + path |
| Submitted | relative time ("2h ago") with tooltip = absolute IST timestamp                 |
| Rev       | revisions count badge                                                          |
| Actions   | Approve · Request changes · Reject (icon buttons)                              |

Row click expands inline to show full notes, reviewer feedback (if
any), and the revision history.

### 2.2 Filters

- Status (default: `pending`; also `changes_requested`, `approved`,
  `rejected`, `retracted`, `all`).
- Track.
- Date range.

### 2.3 Approve modal

Opens on the Approve action.

- Shows the task's default `pointsReward` prefilled.
- Points override field (number input, min 1).
- Feedback textarea (optional for approve).
- Confirm → `POST /v1/admin/contributor/contributions/:id/review`
  with `action: "approve"`.
- On success: toast "Approved. Lead now at X CP (Tier: Y)".
- On 409 (idempotency hit): toast "Already approved" (same-shape
  response is treated as success).

### 2.4 Request-changes modal

- Required feedback textarea.
- Confirm → `action: "request_changes"`.

### 2.5 Reject modal

- Required reason textarea.
- Confirm → `action: "reject"`.
- Warn once in the UI copy: "Reject is terminal; the lead must open
  a new contribution to try again."

## 3. `/contributors/tasks`

List all tasks (filterable by Track, Difficulty, Status) with "New
task" button → form drawer.

### 3.1 New task form

Fields match `DevRelTask` extended shape from [01](./01-data-model.md):
title, description (markdown), type, priority, track, difficulty,
category, points reward, max claims (optional), estimated hours,
requirements (list input), resources (list of {title, url, type}),
GitHub issue URL (optional), guidelines URL (optional).

### 3.2 Edit / retire

Edit opens the same form prefilled. "Retire" sets `isActive: false`
with a confirm — the task vanishes from the lead-facing catalog but
existing contributions keep their link.

**Warning in the UI**: editing `pointsReward` does NOT re-score
approved contributions (see [05 §2 PATCH tasks](./05-api.md#patch-v1admincontributortasksid)).

## 4. `/contributors/leads`

Table of all onboarded leads with search by name/email.

Columns: name, email, cohort start, cohort days remaining,
`totalContributionPoints`, `currentTier`, approved count, "last
contribution" date.

Sort defaults: current points desc.

Row click → `/contributors/leads/:id`.

### 4.1 `/contributors/leads/:id` — single lead view

Tabs:

- **Overview** — profile fields (email, GitHub, LinkedIn, Discord,
  Telegram), tier, points, cohort, performance snapshot.
- **Contributions** — list of all their contributions with inline
  review actions (shortcut into the queue flow).
- **Ledger** — the full ledger history from
  `GET /v1/admin/contributor/leads/:id/ledger`, newest first.
  Columns: when, kind, delta, balance after, reason, actor.
  Rows are not editable. A "Manual adjustment" button at the top
  opens a drawer that posts to `/leads/:id/adjust`.
- **Founder messages** — list of this lead's `FounderMessage`
  records (resolved and open).

## 5. `/contributors/inbox`

The FounderMessage inbox. Sort: open first, then high-priority
first, then oldest first (per the inbox index in [01](./01-data-model.md)).

Row shows: lead, category chip, priority chip, subject, open-age (red
if > 48h), and a "Resolve" action that opens a resolution notes
drawer and marks `resolvedAt / resolvedBy`.

SLA badge on the sidebar: red dot if any open high-priority message
is > 48h old.

## 6. Not in v1

- Bulk approve / reject.
- Keyboard shortcuts for the queue.
- Export to CSV.
- Multi-admin review (today, Sachin is the only reviewer; the admin
  guard works, but there's no reviewer-assignment UI).
