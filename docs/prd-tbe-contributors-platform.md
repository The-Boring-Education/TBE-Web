# PRD — TBE Contributors Program

| Field      | Value                                                          |
| :--------- | :------------------------------------------------------------- |
| Status     | Draft — pending alignment on scope & vocabulary                |
| Owner      | Sachin Shukla                                                  |
| Apps       | `apps/contributor` (new UI), `apps/admin` (review), `apps/api` |
| Depends on | existing `DevRel*` models, `packages/gamification`             |
| Supersedes | the original draft of this file (PR #1316 initial commit)      |

> **Open scope question — not yet resolved.** The referenced Notion doc is
> titled _"College Connects / DevRel"_ and the repo already ships an
> `apps/oncampus` app plus `DevRelLead` / `DevRelTask` models with an
> application → interview → onboarded status machine. The original draft of
> this PRD framed the program as _generic open-source contribution_, which
> is a strictly wider scope. This revision assumes the program is the
> **college-ambassador / DevRel** program the existing infra is already
> built for, and that "Contributor" is a role name inside it, not a
> separate program. If that is wrong, the problem statement below needs
> to change before engineering starts.

---

## Problem Statement

Sachin runs a cohort-based DevRel / college-ambassador program for TBE.
Today, every stage of a cohort lives in a different place:

- Applications arrive through a Google Form that writes to a sheet.
- Approved leads are told what to do over DMs on Discord/WhatsApp.
- Work (PRs, blog posts, campus event photos) is submitted as links in chat.
- Sachin tracks who did what, and who should be rewarded, in his head and
  in that same chat.
- Leads can't see what they've done, what they're worth, or what's next.
  Sachin can't see who's active, who's stalled, or who's earned a reward
  without scrolling.

The result: a lead who finished three tasks in week two is indistinguishable
from one who's ghosted, until someone remembers to check. Rewards (swag,
LoRs, internships, 1:1s) go to whoever is loudest, not whoever contributed
most. Sachin becomes the bottleneck on review, on recognition, and on
basic "what should I do next" guidance — which caps the program at
whatever he can personally hold in his head on a Tuesday evening.

## Solution

A single web portal where a lead who has been accepted into a cohort:

1. Sees a **list of open tasks** tagged by track, difficulty, and the
   number of **Contribution Points** they'd earn.
2. Picks one, does the work, pastes a **proof URL** (merged PR, published
   post, event photos), writes a note, submits.
3. Sees the submission in a **"my submissions"** list with its status
   (pending / approved / changes requested / rejected) and the reviewer's
   feedback once reviewed.
4. Sees their **running total** of Contribution Points, their **Tier**
   (Contributor → Lead → Captain), and how many points to the next tier.
5. Can **escalate to Sachin** through one explicit button whose destination
   depends on their tier (an in-app message for Contributors, a Calendly
   link for Captains).

And in `apps/admin`, a reviewer (initially just Sachin) sees:

1. A **review queue** of pending submissions, newest first, with the
   proof URL inline, the task they claimed, and the submitter's current
   total.
2. Three actions per submission: **approve** (optionally edit the point
   award), **request changes** (with a note), **reject** (with a reason).
3. A **task publisher** form so new tasks can be added without a deploy.

The reward structure, the review workflow, and the vocabulary all stay
compatible with the existing `DevRelLead` / `DevRelTask` models and the
project's documented gamification vocabulary. Nothing new is invented
where something existing fits.

## User Stories

**Applicant & onboarding**

1. As a student who heard about the program on Discord, I want to see the
   landing page explain who the program is for and what I'd actually do,
   so that I can self-select before applying.
2. As an applicant, I want to apply with my name, email, GitHub, LinkedIn,
   track preference (Code / Community), and a short motivation, so that
   Sachin can decide whether to accept me without a separate interview.
3. As an applicant, I want to check my application status by email, so
   that I don't have to DM anyone.
4. As an accepted lead, I want to be told my cohort start and end date up
   front, so that I know how long I have.

**Browsing & picking work**

5. As a lead, I want to see every open task on one page, so that I can
   pick what fits my time this week.
6. As a lead, I want to filter tasks by **track** (Code / Community),
   **difficulty**, and **point range**, so that I can find a 15-minute
   task when I have 15 minutes.
7. As a lead new to open source, I want tasks explicitly tagged
   _Good First Task_, so that I don't accidentally start with a
   core-infra refactor.
8. As a lead, I want to see the task description, acceptance criteria,
   and the direct link (GitHub issue, content brief, or event brief), so
   that I can get started without a back-and-forth.
9. As a lead, I want to see whether a task is already claimed or has a
   claim limit, so that I don't start duplicate work.

**Submitting work**

10. As a lead who finished a task, I want one form that asks for the task,
    proof URL, and notes, so that I don't have to format a submission.
11. As a lead who did something not on the task list, I want to submit a
    _custom contribution_ with a title and proof URL, so that off-list
    work still counts.
12. As a lead, I want the form to reject obviously-wrong proof URLs
    (not a URL, broken, pointing to a repo I'm not involved with) before
    submission, so that I don't wait days to find out it was rejected.
13. As a lead, I want to be told at submission time if I've already
    submitted this proof URL, so that I don't accidentally double-submit.
14. As a lead, I want each submission I make to appear in **my submissions**
    immediately in _pending_ state, so that I know it landed.
15. As a lead whose submission got **changes requested**, I want to update
    the same submission (not open a second one), so that the reviewer sees
    the history on one record.

**Progress & recognition**

16. As a lead, I want to see my **total Contribution Points**, my current
    **Tier**, and a progress bar to the next Tier on my dashboard, so
    that I can tell at a glance how I'm doing.
17. As a lead, I want a **timeline of my approved contributions** with
    the points awarded for each, so that I can show it to a recruiter.
18. As a lead, I want to see how many days are left in my cohort, so
    that I can pace myself.
19. As a lead who just crossed the **Captain** threshold, I want an
    unmistakable confirmation (the badge visibly changes; one celebratory
    moment), so that I feel the milestone.

**Escalation**

20. As a lead stuck on a task for more than a day, I want one button
    that says _"Message Sachin"_, so that I don't have to guess which
    channel to use.
21. As a **Captain** who's earned a 1:1, I want that button to show me a
    Calendly link, so that I can book without asking.
22. As a Contributor or Lead who hasn't earned a 1:1 yet, I want that
    button to open an **in-app message** that Sachin can batch-answer,
    so that mentorship doesn't become a full-time job for him.

**Reviewer (admin)**

23. As Sachin reviewing submissions, I want a queue of **pending**
    submissions newest-first, with the proof URL already clickable and
    the submitter's name / current points / tier visible, so that I don't
    pivot between tabs.
24. As a reviewer, I want to **approve** a submission with the task's
    default point value already filled in, so that the common case is
    one click.
25. As a reviewer, I want to **override** the point value before approving,
    so that an exceptionally thorough submission can be rewarded.
26. As a reviewer, I want to **request changes** with a note that goes
    straight back to the lead, so that iteration doesn't need a DM.
27. As a reviewer, I want to **reject** a submission and require a reason,
    so that we have an audit trail if a lead disputes it.
28. As a reviewer, I want to **publish a new task** from inside the admin
    (title, description, track, difficulty, points, link), so that I
    don't need engineering to add tasks.
29. As a reviewer, I want to see **which open tasks have no submissions
    in a week**, so that I can retire or re-promote them.

**Program integrity**

30. As Sachin, I want every point award to leave an **immutable audit
    record** (who awarded, how many, for which submission, when), so that
    a dispute can be resolved from data, not memory.
31. As Sachin, I want the leaderboard-visible points on a lead's profile
    to be **exactly** the sum of their audit records, so that there is
    no way a bug can inflate or deflate someone's standing without a
    corresponding entry.
32. As Sachin, I want to be able to **retract** points on a specific
    submission (e.g. the PR was later reverted), so that the record can
    be made correct, and the retraction is itself an entry in the audit
    log, not a mutation of the original.

## Implementation Decisions

### Vocabulary (binding across code, docs, and UI)

CONTEXT.md already defines the project's domain language. The program's
nouns must not collide with it. We adopt:

- **Contribution Point** — the point unit this program awards. Named
  distinctly from the existing `Point Event` (the learner-side
  gamification unit from CONTEXT.md) so a reader can tell at a glance
  which system an entry belongs to. Shortened as _CP_ in the UI only
  when space is tight.
- **Tier** — the named band derived from total Contribution Points.
  Values: **Contributor** (0 ≤ CP < 50), **Lead** (50 ≤ CP < 100),
  **Captain** (CP ≥ 100). Named **Tier**, not _Level_, because
  CONTEXT.md reserves _Level_ for the learner-side (Noob → Legend)
  scale. Note that _Lead_ here is the mid-Tier; this matches the
  existing `DevRelLead` model, which represents a person admitted
  into the program as a whole, not the mid-Tier band.
  _Avoid_: XP, Level, Role, Rank.
- **Contribution** — a submitted proof-of-work record. Replaces the
  original draft's "Submission" to avoid colliding with the generic
  review word.
- **Track** — Code or Community. _Hybrid_ is dropped as a track value in
  v1; a lead on either track can submit to the other track's tasks, so
  "Hybrid" is a property of behaviour, not a required third option.
- **Cohort** — the lead's own 4-month window, starting the day they
  are accepted (per-lead rolling), not a shared calendar block.
  See _Cohort rules_ below.
- **Review** — the admin action against a Contribution. Transitions
  defined by the state machine below.

### Reuse existing models — do not create parallel ones

The initial draft of this PRD introduced `ContributorProfile`,
`ContributorTask`, `ContributorSubmission` schemas. These collide
field-for-field with the existing `DevRelLead` and `DevRelTask` models.
Decision:

- **The accepted lead's identity, status machine, and performance metrics
  live on the existing `DevRelLead`** (`apps/api/src/lib/database/models/DevRel/`).
  New fields are added only where needed (`cohortStartedAt`,
  `cohortEndsAt`, `totalContributionPoints`, `currentTier`). The existing
  `performanceMetrics.tasksCompleted` and `streakCount` fields are kept
  and continue to be used.
- **Tasks live on the existing `DevRelTask`.** It already has `title`,
  `description`, `type`, `priority`, `assignedTo[]`, `submissionRequired`,
  `submissionType`, `requirements`, `resources`, `tags`. We add:
  `track` (`code | community`), `difficulty`
  (`beginner | intermediate | advanced`), `pointsReward` (number),
  `category`, `isOpen` (derived from `isActive` + claim-count), and
  `maxClaims`.
- **The old `DevRelTask.completionTracking` Map is retired for new work.**
  Keeping per-lead submission state inside a Map on the Task document
  does not scale, cannot be queried by status without `$each`-grade
  gymnastics, and cannot carry independent "custom" contributions. We
  extract a new collection — see _Contribution Ledger_ below — and
  migrate `completionTracking` entries into it as part of the rollout.
- **Audit log** — new collection, see _Contribution Ledger_ below.

### Deep module: Contribution Ledger

The one piece of this program that must not be gotten wrong is the
accounting. The Ledger is a deep module with a small interface and all
the behaviour behind it.

Interface (shape only — implementation is one query helper file):

```
record(entry: LedgerEntry) → LedgerEntry      // append-only, idempotent on (submissionId, kind)
balanceOf(leadId) → number                    // sum of all entries for that lead
historyOf(leadId, { page, limit }) → …        // paged, newest first
retract(originalEntryId, reason, adminId) → … // writes a NEGATIVE entry; never deletes
```

A LedgerEntry carries: `leadId`, optional `submissionId`, `kind`
(`contribution_approved | manual_adjustment | retraction |
tier_promotion_note`), `delta` (signed int), `balanceAfter`, `reason`,
`actorId`, `createdAt`. `balanceAfter` is written at insert time so a
read of one row explains itself; the invariant checked by tests is
`sum(delta) == DevRelLead.totalContributionPoints` for every lead.

**Idempotency**: `record()` is a no-op if an entry already exists for
the same `(submissionId, kind)` pair. This is enforced by a unique
compound index and surfaced as a successful (same-shape) response, so
retrying an approval after a network blip can't double-pay.

**Immutability**: the collection has `createdAt: true, updatedAt: false`
and no field other than nothing is ever updated. Corrections go through
`retract()`, which writes a _new negative row_. The API never calls
`updateOne` / `findOneAndUpdate` on this collection; a test asserts the
query helper file contains no such calls.

### Deep module: Tier Resolver

A single pure function `tier(points: number) → Tier`. Lives in
`packages/gamification` or a small `apps/api/src/lib/contributor/tier.ts`
— exact home decided during Phase 1. Called from:

- the ledger write path, to compute the new tier after an approval;
- the dashboard read path, to compute the tier badge;
- any test that needs the mapping.

The thresholds (50, 100) are the _only_ place those numbers appear in
code. Tier promotion is not a stored event, it is a derived property;
_recognizing_ the promotion (confetti, Captain welcome email) is the
UI's job and keys off a comparison of the tier before and after the
ledger write.

### Deep module: Submission State Machine

Transitions:

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

A pure transition function `canTransition(from, to) → boolean`
guards every status write. `changes_requested → pending` is the
re-submit path (same record, new `proofUrl` and `notes` allowed; the
Ledger is untouched because no points were awarded). `approved →
retracted` is a reviewer action that writes a negative ledger entry.
`rejected` is terminal (a lead who disagrees opens a new Contribution).

### Deep module: Cohort Clock

Pure function over `{cohortStartedAt, now}`:

- `daysRemaining` — floor to 0 when past the end.
- `inCohort` — boolean.
- `graduatedAt` — the end-of-cohort date.

The end date is **calendar-month arithmetic**: `cohortStartedAt + 4
months`, snapping to the last day of the target month when the start
day doesn't exist (`Oct 31 → Feb 28`). _Not_ `start + 120 days`. The
original draft said "exactly 4 months" and `start + 120 days` in the
same section — we pick calendar months because the program's cadence
is monthly.

Cohorts are **per-lead rolling**, not a shared global cohort. A lead
accepted on 2026-10-10 has a cohort ending 2026-02-10. The _program_
runs continuously; "cohort" only ever refers to one lead's own window.
(If a shared quarterly cohort is needed later, the Clock stays; a new
`CohortBatch` concept is added above it.)

### Deep module: Proof URL Classifier

Pure function `classify(url) → { kind, canonicalUrl, warnings }` where
`kind` is `github_pr | github_issue | blog | tweet | linkedin |
youtube | drive | other`. For `github_pr` it also returns
`{owner, repo, number}` so the admin UI can show a link preview and so
later a webhook integration can match merged PRs without a schema
change. Non-URL input → single warning; `other` is allowed to submit
with a notes requirement bumped.

### Deep module: Escalation Router ("Message Sachin")

Pure function `route(tier, category) → { channel, target }` where
`channel ∈ {calendly, in_app_inbox, email}`. The default policy for
v1:

- Captain + any category → `calendly` (link from env/config).
- Lead or Contributor + `task_blocker` → `in_app_inbox` with high priority.
- Lead or Contributor + any other category → `in_app_inbox` with normal
  priority.

Email is only used as a fallback target for Captains if the Calendly
link is missing. No Discord / Telegram integration in v1 — those are
assumed to still exist alongside the portal, but the button inside the
portal never routes there. (Rationale: multi-channel escalation is
exactly what the program is trying to replace.)

The `in_app_inbox` target is a tiny `FounderMessage` collection
(contributor, category, subject, body, createdAt, resolvedAt?,
resolvedBy?). Capped read view in the admin. SLA badge in UI if open > 48h.

### Cohort rules (edge cases the original draft left open)

- **Mid-cohort rejoin / second cohort**: a lead whose cohort has ended
  but who re-applies starts a fresh cohort window; their _previous_
  Contribution Points carry forward (no reset). This is a deliberate
  departure from a per-period score reset; the alternative was explicit
  on in CONTEXT.md's gamification language, but the program's intent is
  cumulative recognition, not quarterly ranking.
- **Pair submissions**: v1 does not model co-authorship. If two leads
  pair, one submits and names the other in `notes`; the reviewer can
  manually create a `manual_adjustment` ledger entry for the pair. v2
  can add a `coContributors[]` field.
- **Reverted PR**: reviewer uses `retract()` with reason "PR reverted
  on `<date>`". This writes a negative ledger entry; the lead's total
  and tier update immediately on next read. No notification is sent
  by v1 (the reviewer should DM the lead); a `retracted` notification
  is a v2 add.
- **Claim limit race**: `maxClaims` is advisory in v1. A lead sees the
  current claim count on the task card; actual enforcement happens at
  review time (the reviewer decides whether to approve the Nth claim).
  A hard limit requires a transactional claim-reserve table, which is
  out of scope. The current `DevRelTask.assignedTo[]` array is reused
  for soft "I'm working on this" claims if the UI exposes it.

### Program vs. the gamification engine

The learner-side `packages/gamification` system (Points, Levels,
Period Scores, Leaderboards) is **separate** from Contribution Points.
A contributor who is also a learner has both; neither sums into the
other. This is a conscious choice — the audiences, the actions, and
the privacy model are different (gamification is public-leaderboard
by default, Contribution Points are opt-in-visible by default). The
only shared piece is the `User` id.

A future "unified leaderboard" is out of scope for v1 and should get
its own ADR when raised.

### `apps/contributor` is the home for the lead-facing UI

The repo already has an `apps/contributor` Next.js scaffold (port 3008,
`contributors.theboringeducation.com`). The portal lives there. The
`apps/oncampus` app stays what it is (campus-prep learning content);
it is _not_ repurposed. Cross-linking between the two is fine but not
part of this PRD.

### `apps/admin` is the home for the review UI

The existing Vite + React admin app ships ~15 management pages already
and is wired to the API. A new **"Contributors"** section is added
with two pages: `/contributors/submissions` (the review queue) and
`/contributors/tasks` (publish/retire tasks).

### API shape

All routes under `apps/api/src/pages/api/v1/`. The existing
`/v1/devrel/*` routes (`apply`, `applications`, `applications/status/[email]`,
`dashboard`, `tasks`) are **kept and extended**, not replaced:

- `GET /v1/devrel/dashboard` — extended to return current points, tier,
  cohort clock, recent contributions.
- `GET /v1/devrel/tasks` — extended with `track`, `difficulty`,
  `pointsReward` filters.
- `POST /v1/contributor/contributions` — new. Submit a Contribution.
- `GET /v1/contributor/contributions` — new. List mine.
- `PATCH /v1/contributor/contributions/:id` — new. Edit a
  `changes_requested` contribution (same record, not a new one).
- `POST /v1/contributor/founder-message` — new. Escalation.
- `GET /v1/admin/contributor/queue` — new. Admin review queue.
- `POST /v1/admin/contributor/contributions/:id/review` — new. Approve /
  request changes / reject. One endpoint, action in body. Opens a Mongoose
  transaction: updates Contribution, writes Ledger entry (if approving),
  updates `DevRelLead.totalContributionPoints` + `currentTier`.
- `POST /v1/admin/contributor/contributions/:id/retract` — new. Writes a
  negative Ledger entry; does not touch the original Contribution's
  status.
- `POST /v1/admin/contributor/tasks` — new. Publish a task.
- `PATCH /v1/admin/contributor/tasks/:id` — new. Retire / edit.

### Non-functional

- **Auth** — reuse NextAuth sessions already live in the monorepo.
  Admin endpoints behind the same admin guard the admin app uses today
  (`AdminUser` collection). No new auth stack.
- **Data minimisation** — `discordHandle`, `telegramHandle`, `linkedinUrl`
  are all optional and never shown to other contributors. Only the
  admin app and the contributor themselves see them.
- **Rate / abuse** — one submission per lead per 60 seconds (to catch
  accidental double-clicks and simple abuse). This is a crude guard,
  not the `Pace Limit` from CONTEXT.md; the Pace Limit is a different
  mechanism for a different system and does not apply here.
- **Immutable ledger** — see Contribution Ledger above.
- **Observability** — reviews, retractions, and founder-messages log
  through the existing `logger`.

## Testing Decisions

A test is good if someone can read its name, read what it asserts, and
tell what the system is supposed to do — without reading the module
under test. We test _behaviour at module boundaries_, not internals.

Modules to cover (in order of blast radius):

1. **Contribution Ledger** — the critical one. Tests to write:
   - Approving a Contribution writes a Ledger entry with the right
     `delta` and `balanceAfter`.
   - After N approvals, `sum(delta for lead) == DevRelLead.totalContributionPoints`.
     This invariant is also asserted by a periodic DB check (not just
     in tests).
   - Approving the _same_ Contribution twice is a no-op (idempotency);
     the lead's balance only moves once.
   - `retract()` writes a negative entry and leaves the original intact.
   - A Ledger entry cannot be updated after creation (test attempts
     `updateOne` and expects no change / an error).

2. **Tier Resolver** — table-driven: 0 → Contributor, 49 → Contributor,
   50 → Lead, 99 → Lead, 100 → Captain, 1000 → Captain, -1 → Contributor
   (floored).

3. **Submission State Machine** — a transition table test. Every valid
   transition succeeds; every disallowed one is rejected with the same
   error shape. `changes_requested → pending` preserves the `_id`.

4. **Cohort Clock** — a Jan-31 start lands on May-31; a Jan-31 start on a
   leap year lands on May-31 still (snap only when target day doesn't
   exist, e.g. Oct-31 → Feb-28). `daysRemaining` floors at 0.

5. **Proof URL Classifier** — valid GitHub PR URL extracts
   owner/repo/number; a tweet is classified as `tweet`; "not a url" is
   classified as `other` with a warning. The function is pure, so tests
   are literal.

6. **Escalation Router** — tier/category table: Captain → calendly;
   Lead + task_blocker → in_app_inbox (high); Contributor + mentorship
   → in_app_inbox (normal); Captain with no Calendly configured → email
   fallback.

7. **Review endpoint** — one integration test that goes through the
   transaction: submission goes from `pending` to `approved`, Ledger has
   one new entry, lead's total and tier reflect it. One for the
   `retract` path.

Prior art for structuring these tests: the existing
`apps/testing/src/unit/database/gamification-queries.test.ts` and
`apps/testing/src/unit/hooks/useGamification.test.ts` show the pattern
(co-located DB mocks, named-after-behaviour tests).

The admin UI and the lead UI are **not** covered by component tests in
v1 — only the modules above are. Component changes are protected only
by TypeScript + manual testing, which is the current convention in the
repo. (We'd revisit this if the UI starts holding domain logic, which
these modules are deliberately designed to prevent.)

## Out of Scope

- GitHub webhook auto-verification of merged PRs. The review step is
  manual in v1; the Proof URL Classifier already parses the data a
  webhook would need, so this is a clean v2 add.
- Automatic PDF certificates on cohort end.
- A Discord / Telegram bot that mirrors contribution events.
- Public leaderboards. Lead-visible leaderboards. Any ranking at all,
  in fact — Contribution Points are a personal counter in v1.
- Co-authorship / pair submissions as a first-class field.
- A shared global quarterly cohort — v1 is per-lead rolling only.
- Reward fulfillment logistics (swag addresses, LoR templates). The
  portal records that a Captain exists; the shipping is a human
  process off-platform.
- Integrating Contribution Points with the learner-side gamification
  Points / Period Score / Leaderboard. Separate systems, separate ADR
  if ever unified.
- Replacing the `DevRelLead` application flow (apply → interview →
  approved). This PRD assumes an accepted `DevRelLead` and extends
  from there.

## Further Notes

- **The Notion reference couldn't be fetched** (login-gated). This PRD
  assumes the program is the "College Connects / DevRel" program the
  repo's existing `apps/oncampus` + `DevRel*` models were built for.
  If the Notion doc contradicts anything here — in particular, if
  "College Connects" is a learner-side campus program and "Contributor
  Program" is a _separate_ open-source initiative — the first section
  of this PRD needs to be rewritten before engineering starts.
- **PR #1316** currently adds the original draft of this document (and
  the companion spec). The intent of this revision is to replace those
  files in place on the same PR, not to open a new one.
- **Terminology drift risk**: the one word most likely to cause bugs
  is _Level_. If anyone writes `level` on a `DevRelLead`, it will be
  ambiguous forever. The field is named `currentTier` with a string
  enum; `level` is a lint-grep anti-pattern.
- The thresholds `50` and `100` are placeholders borrowed from the
  original draft. Sachin should sanity-check them against last cohort's
  distribution before Phase 1 ships; moving them later means a one-line
  change in the Tier Resolver and a backfill of `currentTier`.
