# 06 — Contributor app UI

| Field              | Value                                                                                                 |
| :----------------- | :---------------------------------------------------------------------------------------------------- |
| App                | `apps/contributor` (Next.js Pages Router, Tailwind, port 3008, `contributors.theboringeducation.com`) |
| Owner              | _(unassigned)_                                                                                        |
| Companion chapters | [05 API](./05-api.md), [04 Domain modules](./04-domain-modules.md)                                    |

The lead-facing portal. Reuses `@tbe/components`, `@tbe/hooks`,
`@tbe/utils`. No new design system work.

## 1. Routes

| Route                | Auth   | Purpose                                                                               |
| :------------------- | :----- | :------------------------------------------------------------------------------------ |
| `/`                  | public | Landing: program overview, how it works, apply CTA.                                   |
| `/apply`             | public | Application form; posts to existing `POST /v1/devrel/apply`.                          |
| `/status`            | public | Check application status by email; uses `GET /v1/devrel/applications/status/[email]`. |
| `/dashboard`         | lead   | Authenticated lead's home. §2 below.                                                  |
| `/tasks`             | lead   | Open-tasks catalog. §3 below.                                                         |
| `/tasks/:id`         | lead   | Task detail + submit drawer. §4 below.                                                |
| `/contributions`     | lead   | Full "my contributions" list (paged).                                                 |
| `/contributions/:id` | lead   | One contribution's detail + resubmit if `changes_requested`. §5 below.                |

Non-leads (applied-but-not-onboarded, or a logged-in User who is not
a lead) hitting `/dashboard` are routed to `/status` with their email
prefilled.

## 2. `/dashboard`

Four stacked sections, mobile-first (single column; two-column from
`md:` up).

### 2.1 Header card

- Avatar, name, current Tier badge (color per Tier — Contributor
  slate, Lead indigo, Captain gold).
- `totalContributionPoints` large number.
- Progress bar to next Tier: `points % 50` of 50 for Contributor →
  Lead, `(points - 50) % 50` of 50 for Lead → Captain. Captain's bar
  is replaced with a "Captain unlocked" chip.
- Cohort countdown: "`cohort.daysRemaining` days left". Hidden if
  `!cohort.inCohort`; replaced with a "Cohort completed on
  `graduatedAt`" chip.

### 2.2 "Pick a task" card

Static CTA → `/tasks`. Shows a one-line stat ("12 open code tasks,
7 community").

### 2.3 "My contributions" list

The 5 most recent, newest first. Each row: task title (or
`customTitle`), submitted date, status badge, points if approved.
Row click → `/contributions/:id`. "See all" link → `/contributions`.

### 2.4 "Message Sachin" button

Fixed button in the dashboard header on mobile; sidebar on `md:` up.
On click, opens the Escalation drawer (§6).

## 3. `/tasks`

- Filter bar: Track (code / community / both), Difficulty (any /
  beginner / intermediate / advanced), Points (slider or min/max),
  Category.
- Task grid: `TaskCard` with title, Track badge, Difficulty badge,
  Points pill, estimated time (from `estimatedHours`), "Pick" CTA.
- Infinite scroll or "Load more" — pick the simpler one; prior art in
  the quizes catalog.

## 4. `/tasks/:id`

- Task description, requirements, resources.
- "Open issue" button if `githubIssueUrl` is set.
- "Submit Contribution" button → opens the Submit drawer (§4.1).

### 4.1 Submit drawer

Form:

- Proof URL (text) — on blur, call `classify()` client-side and
  display the detected kind + any warnings. Does not block submission
  if `kind === "other"` but shows a yellow hint.
- Notes (textarea).
- Preview of what will be sent.
- Submit → `POST /v1/contributor/contributions`. On success, close
  drawer, toast "Submitted — pending review", soft-navigate to
  `/contributions/:newId`.

### 4.2 Custom-contribution drawer

Same as 4.1 plus a Title field. Launched from a "Submit custom
contribution" button on `/contributions` and from an empty state on
`/tasks`.

## 5. `/contributions/:id`

- Current state banner (pending / approved / changes_requested /
  rejected / retracted).
- Proof URL (clickable; shows `proofKind` as a chip).
- Notes.
- Reviewer feedback if present.
- Revision history dropdown if `revisions.length > 0`.
- If `status === "changes_requested"` and the viewer owns the record,
  an "Edit & resubmit" affordance that opens a drawer prefilled with
  the current values; submits via `PATCH`.

## 6. Escalation drawer ("Message Sachin")

On open, fetches no data — the drawer renders based on the lead's
current tier (already in page state) and runs `route()` from
[04](./04-domain-modules.md) client-side to pick the UI shape:

- `channel === "calendly"`: shows a short message ("Captains book
  directly — pick a slot") plus a button that opens the Calendly URL
  in a new tab. No form.
- `channel === "in_app_inbox"`: form with category dropdown
  (Mentorship / Proposal / Task blocker / General), subject, body;
  submit → `POST /v1/contributor/founder-message`. Toast on success.
- `channel === "email"`: shows the fallback email and a
  `mailto:` button.

The server re-runs the router at write time (see [05 §1](./05-api.md#post-v1contributorfounder-message))
so the UI's choice is advisory; a tampered client gets the server's
answer anyway.

## 7. Tier promotion moment

When a contribution is approved and the server's response includes
`tierPromoted: true` (compared `oldTier` vs `newTier` server-side),
the UI shows a one-time celebration overlay on the next page load.
Flag kept in `localStorage` keyed on the new tier to prevent repeats.

Only Captain gets a confetti-grade celebration; Lead gets a toast
("You're now a Lead — new tasks unlocked" with no actual unlock gate
in v1, it just reflects the status). Decided this way because
Captain is the one externally rewarded tier (swag, Calendly, LoR).

## 8. Not in v1

- Public leaderboard page.
- Social sharing of a Contribution.
- Any editing of an `approved` or `rejected` contribution.
- Deep-linking into the resubmit drawer from an email.
