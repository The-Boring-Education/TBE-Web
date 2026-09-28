# PRD: Learner Broadcast from the Admin Panel

Status: specified. Replaces the earlier discovery draft, which named no workflow.
The selected workflow is a bulk email broadcast to a defined learner audience,
sent by an authorized operator from the existing admin app.

## Problem Statement

An operator who needs to tell learners something — a cohort announcement, a
programme change, a launch — has no way to do it. The admin panel's email page
can send exactly one message to exactly one person: a test email, a team offer
letter, or a DevRel offer letter. Reaching every learner means exporting the
database by hand and pasting addresses into a personal mail client, which loses
the audience definition, produces no record of who was contacted, gives learners
no way to opt out, and cannot be repeated or audited.

Two consequences follow. Operationally, learner communication does not happen,
because the cost of each send is an afternoon of manual work. Legally and
reputationally, any send that does happen is a broadcast to people who never
consented and cannot unsubscribe, from an account with no delivery record.

The permission story is equally thin. Every admin is exactly as privileged as
every other admin. Nothing in the system distinguishes "preview a template" from
"email the entire learner base," so the blast radius of a compromised or careless
admin session is the whole user table.

## Solution

An operator opens Broadcasts in the admin app, writes a subject and body, picks
an audience from the segments the admin analytics already understand, and sees
the exact recipient count that audience resolves to before committing. They send
a test to themselves, read it in a real inbox, then dispatch.

The broadcast does not run as one long request. The system records the campaign
and one delivery row per recipient, then works through them in chunks, so the
operator watches a progress count climb and can leave and come back. A campaign
interrupted mid-flight resumes exactly where it stopped and never sends the same
learner the same campaign twice.

Every message carries an unsubscribe link. A learner who uses it is suppressed
from all future broadcasts, enforced on the server at audience-resolution time,
not by remembering to filter in the UI.

Dispatch is restricted to a privileged admin tier. An ordinary admin can open the
page and see past campaigns; only a super-admin can send one, and that is checked
on the server on every request, independent of what the UI renders.

## User Stories

1. As an operator, I want to compose a broadcast with a subject and rich body, so that I can write the announcement in the tool rather than in a personal mail client.
2. As an operator, I want to choose an audience from named segments, so that I do not have to express "everyone who finished onboarding" as a database query.
3. As an operator, I want the resolved recipient count shown before I send, so that I learn I am about to email 12,000 people while I can still stop.
4. As an operator, I want the count to reflect suppression and deduplication, so that the number I approve is the number of messages that will actually leave.
5. As an operator, I want to select the entire learner base without an implicit date window, so that long-standing learners are not silently excluded from an announcement meant for everyone.
6. As an operator, I want to send a test copy to myself before dispatching, so that I catch broken formatting in a real inbox rather than in a preview pane.
7. As an operator, I want to save a broadcast as a draft, so that I can write it now and send it after someone reviews the wording.
8. As an operator, I want an explicit confirmation step that restates the audience and the count, so that a stray click cannot start a send to everyone.
9. As an operator, I want a live progress indicator during dispatch, so that I can tell the difference between a slow send and a stuck one.
10. As an operator, I want to close the browser mid-dispatch without losing the campaign, so that a broadcast is not hostage to one open tab.
11. As an operator, I want to resume an interrupted campaign, so that a deploy or a timeout does not force me to start over or send duplicates.
12. As an operator, I want per-recipient outcomes recorded, so that I can answer "did this learner get it?" without guessing.
13. As an operator, I want to retry only the failed recipients, so that fixing a transient provider error does not re-mail everyone who already received it.
14. As an operator, I want to cancel a campaign that is still in flight, so that a mistake spotted after dispatch stops at the next chunk instead of running to completion.
15. As an operator, I want loading, empty, denied, and failed states told apart, so that "no recipients" and "you are not allowed to see this" are not the same blank screen.
16. As an operator, I want a failure to name a recoverable next action, so that I can continue without re-entering the message.
17. As an operator, I want validation before submission, so that an empty subject is rejected at the form rather than by an opaque provider error.
18. As an operator, I want to browse past campaigns with their audience, sender, timing, and outcome, so that I can see what the learner base was last told.
19. As a learner, I want an unsubscribe link in every broadcast, so that I can stop receiving them without emailing support.
20. As a learner, I want unsubscribing to take one action and confirm itself, so that I do not have to log in to an account I may not remember having.
21. As a learner, I want my unsubscribe honoured on every subsequent broadcast, so that opting out means something.
22. As a learner, I want unsubscribing from broadcasts to leave my account-essential mail intact, so that opting out of announcements does not break enrolment or payment receipts.
23. As a learner, I want my unsubscribe link to affect only my own preference, so that a forwarded email cannot be used to opt someone else out.
24. As an administrator, I want broadcast dispatch limited to a privileged tier, so that a single compromised admin session cannot mail the entire user base.
25. As an administrator, I want that tier enforced on the server, so that hiding the button is not the only control.
26. As an administrator, I want machine credentials refused on the broadcast route, so that a script holding an ops secret cannot dispatch to learners.
27. As an administrator, I want each campaign to record who dispatched it and what happened, so that the responsible actor and outcome are traceable afterwards.
28. As an administrator, I want learner addresses kept out of logs and error payloads, so that diagnostics do not become a data leak.
29. As a maintainer, I want audience resolution to be a separate, directly testable unit, so that "who receives this" can be verified without sending anything.
30. As a maintainer, I want the send path to be idempotent per recipient per campaign, so that concurrent or repeated workers cannot double-send.

## Implementation Decisions

### Confirmed by inspection

The admin app and the `/api/v1/admin` boundary are the place for this. Its React
Query hooks, tables, dialogs, and toast conventions are reused. No second admin
application is created.

The current admin send endpoint accepts one recipient and proxies to Chitthi, the
external email service. Chitthi is a synchronous, single-recipient service: it
has no batch endpoint, no queue, no template store, no suppression list, no
delivery webhooks, and no enforced rate limiting. It is treated here purely as
the transport for one message. Everything above a single send — audience,
batching, resumability, delivery state, suppression — is owned by TBE.

The API service caps function duration at sixty seconds and the repository has no
cron and no job queue. A synchronous fan-out over the learner base cannot
complete inside one request. This constraint, not a preference, drives the
chunked design below.

The `User` model has no consent, unsubscribe, or communication-preference field
of any kind. The `AdminUser` model has no role or tier field; admin authorization
today is membership in the admin list, and all members are equal.

A `sendBulkEmails` helper exists on the email client and is unused by any route.
It is an in-process `Promise.allSettled` fan-out with no persistence and no
resumability, so it is not the dispatch mechanism, though the per-message send it
wraps is reused.

### Audience resolver

A dedicated module, the only thing in the system permitted to answer "who
receives this campaign." It takes an audience definition and returns a
deduplicated, suppression-filtered recipient list, plus a count. The same
function backs the pre-send count and the dispatch itself, so the number the
operator approves and the number the system sends to cannot diverge.

Supported audience kinds for this version: all learners, onboarded, premium, and
inactive, each optionally narrowed by a registration date range. The segment
definitions match the ones the admin analytics endpoint already uses, so the
operator sees the same populations they see elsewhere in the panel.

One correction is required. The existing filtered-user listing always applies a
`createdAt` window that defaults to the previous thirty days, which means its
"all users" result quietly omits every learner who registered earlier. The
resolver treats the date range as genuinely optional and applies no window unless
the operator sets one. Reusing the existing listing behaviour unchanged would
produce a broadcast that misses most of the learner base.

The resolver deduplicates by normalized email, drops records with a missing or
malformed address, and excludes every suppressed address. Suppression is applied
inside the resolver rather than at send time so that it cannot be bypassed by a
future caller that forgets to filter.

### Consent and suppression

The `User` model gains communication preferences covering, at minimum, whether
the learner accepts broadcast mail, when that state last changed, and what caused
the change. Absence of an explicit preference is treated as subscribed for
existing accounts; this is a stated product decision and a rollout gate, not a
silent default.

Broadcast mail is distinguished from account-essential mail. Unsubscribing
suppresses broadcasts only. Enrolment confirmations, payment receipts, and the
existing trigger emails are unaffected, and the existing trigger paths are not
routed through the suppression check.

Every broadcast body has an unsubscribe footer appended by the system rather than
by the operator, so a message cannot be sent without one. The link carries a
signed, single-purpose token that identifies one learner and authorizes one
action. It is not a session token, grants no read access, and cannot be used to
change any other field or to act on a different learner. The public unsubscribe
endpoint requires no login, which is the point, and is therefore rate-limited by
address and token.

A known limitation: Chitthi's send contract accepts only sender, recipient,
subject, and HTML body, so `List-Unsubscribe` and one-click `List-Unsubscribe-Post`
headers cannot be set without a change to Chitthi. This version ships the footer
link and records the header support as a follow-up, because mailbox providers
increasingly expect it for bulk mail.

### Campaign dispatcher

Two new records. A campaign holds the message, the audience definition, the
resolved count, the dispatching admin, the timestamps, and the state. A campaign
recipient holds one row per resolved learner with its own delivery state, attempt
count, last error category, and provider reference.

Dispatch is a resumable worker. A dispatch request claims a bounded chunk of
pending recipients, sends them, records each outcome, and returns progress. The
admin UI polls progress and drives subsequent chunks while it is open, and any
super-admin can resume an interrupted campaign later from the campaign detail
view. No single request is required to finish for the campaign to complete.

A recipient row is claimed by an atomic conditional update from pending to
sending. A row already claimed is never picked up by a second worker. This is
what makes concurrent workers, browser refreshes, double-clicked resume buttons,
and retried chunks all safe, and it is why an idempotency guarantee appears here
despite per-request idempotency keys being out of scope: resumability requires it.

Campaign state transitions are the contract:

```
draft ──▶ queued ──▶ sending ──▶ completed
                        │
                        ├──▶ completed_with_failures
                        └──▶ cancelled

recipient: pending ──▶ sending ──▶ sent
                          │
                          ├──▶ failed ──▶ (retry) pending
                          └──▶ skipped   (suppressed or invalid at claim time)
```

A campaign reaches a terminal state only when no recipient remains pending or
sending. Cancellation stops future chunks; it does not recall messages already
handed to the provider, and the UI says so.

Suppression is re-checked at claim time as well as at resolution time, so a
learner who unsubscribes while a long campaign is in flight is skipped rather
than mailed.

Chunk size and inter-chunk pacing are configuration, not constants in the call
site, because provider throughput is the limiting factor and Chitthi does not
enforce provider quotas on our behalf.

### Privileged admin tier

The `AdminUser` model gains a tier. Existing admins default to the ordinary tier;
no one is silently promoted by the migration. An ordinary admin may open the
broadcast section, list campaigns, and read a campaign's detail. Only a
super-admin may create a draft, send a test, dispatch, resume, retry, or cancel.

Enforcement is a server-side authorization wrapper applied to every mutating
broadcast route, layered on the existing admin JWT verification. The UI hides
controls the caller cannot use, and that is a convenience, not the control: a
direct request from an ordinary admin's valid token returns forbidden.

The broadcast routes use the strict admin wrapper, never the variant that also
accepts the machine ops secret. A seed script holding `ADMIN_SECRET` must not be
able to mail learners, and that exclusion is an invariant rather than an
incidental choice of import.

### API contracts

Admin-side, under the existing admin boundary: resolve an audience to a count
without sending; create and update a draft campaign; send a test copy to the
calling admin; dispatch, which transitions the campaign and claims the first
chunk; advance, which claims the next chunk and returns progress; retry failed;
cancel; list campaigns; and read one campaign with its aggregated delivery
counts. Responses use the existing API envelope.

Public-side, unauthenticated: resolve an unsubscribe token to a confirmation, and
apply the unsubscribe. Both are rate-limited.

Error categories are distinguished in responses so the UI can act on them rather
than printing a string: unauthenticated, forbidden, validation failure, audience
empty, campaign state conflict, transport failure, and internal error.

Listing a campaign's recipients returns delivery state and counts. It does not
return learner email addresses to the client, and no endpoint or log line in this
feature emits a learner address.

## Testing Decisions

A good test here asserts externally observable behaviour: what a caller receives,
what state a record ends in, who is refused. It does not assert private helper
names, internal call ordering, or component structure. No test contacts a real
provider; the transport is mocked, and no real mail is sent at any point.

**Required for this PRD: the audience resolver.** It is the deep module here — a
wide surface of segment, date, deduplication, and suppression logic behind a
narrow interface that returns a list and a count, testable entirely in isolation
with no transport and no UI. Its coverage must include each supported segment
against seeded data; the all-learners case proving that learners registered
outside the default thirty-day window are included, which is the specific defect
in the existing listing behaviour; deduplication of repeated and
differently-cased addresses; exclusion of missing and malformed addresses;
exclusion of suppressed learners; an empty audience returning zero rather than
erroring; and the count matching the resolved list exactly, since the operator's
approval depends on that equality.

Prior art: the existing admin route unit tests use Vitest with mocked HTTP
request objects and module-level mocks of the admin auth wrapper and the
database, and the existing bulk-email-client unit test covers partial-failure
fan-out. The integration tests for admin auth show the pattern for asserting
unauthenticated and forbidden responses. MSW is a dependency but is not wired
into the shared test setup, so these follow the module-mock pattern rather than
introducing a new one. Everything lives in the central testing app.

**Recommended but not selected.** Three areas carry risk that the resolver's
tests do not cover, and each is named here so the gap is a decision rather than
an oversight. The tier authorization on the dispatch route is the only thing
standing between an ordinary admin token and the entire learner base, and a
forbidden-response test is inexpensive. The unsubscribe token's signing and
verification determines whether one learner's link can act on another's record.
The dispatcher's atomic claim is what prevents duplicate sends under concurrent
or resumed workers, and duplicate mail to the whole learner base is not a
recoverable error. If these stay untested, that should be an accepted risk
recorded against the implementation issues, not an omission discovered later.

No Playwright coverage is included: the admin app has no e2e project today, and
standing one up is its own piece of work.

## Out of Scope

Scheduled and recurring sends; drip sequences and lifecycle automation; a
reusable template library with saved variables; per-learner personalization
beyond name substitution; A/B testing; open and click tracking; and
deliverability analytics.

Bounce and complaint handling, which needs delivery webhooks that Chitthi does
not expose. `List-Unsubscribe` header support, for the same reason. Any
extension of Chitthi itself, including a native batch endpoint, a queue, or
provider quota enforcement.

Channels other than email. A learner-facing notification-preferences page beyond
the single unsubscribe action. Migrating the existing trigger emails onto this
pipeline. Replacing the state-management or data-fetching stack.

Explicitly deferred security work, not because it lacks value but because it was
not selected for this scope: rate limiting across the other admin email routes, a
mandatory test-send gate before dispatch, a typed confirmation phrase, a general
per-request idempotency key scheme, a broader audit-log model spanning admin
actions, and a review of the `ADMIN_SECRET` machine-auth path beyond excluding it
from these routes. The campaign and recipient records give this feature a
per-campaign trail as a by-product of the dispatch design, which is narrower than
a real audit log and should not be mistaken for one.

Credential provisioning, production sends, and release sign-off remain human-owned.

## Further Notes

Three decisions are gates rather than details, and each should be settled before
implementation issues are cut.

Treating existing learners as subscribed by default is a product and compliance
position. It is the only way a first broadcast reaches anyone, since no consent
was ever collected, and it needs an explicit owner rather than an implicit one.

Someone has to be the first super-admin. The migration promotes no one, so
seeding the initial tier is a deliberate operational step through the existing
admin bootstrap path.

Sender identity is currently a hardcoded personal Gmail address in the offer
letter flows. A broadcast to the whole learner base from that address is a
deliverability problem regardless of the code quality above it. The sending
domain and from-address for broadcasts need confirming.

The vertical slices are: consent field and public unsubscribe with suppression;
the audience resolver with its count endpoint and tests; the admin tier and its
server-side enforcement; campaign and recipient records with chunked resumable
dispatch; and the broadcast UI with progress, resume, and history. Each is
independently demonstrable. The resolver slice is the one an agent can take
furthest without a product decision, since it depends only on the consent field
landing first.

Separate domains keep their existing parents. Leaderboard administration is
covered by issue #1274 and PR #1279 and is not duplicated here.

## Technical Specification

### Inputs and outputs

Inputs are an operator-authored subject and HTML body, an audience definition
consisting of a segment and an optional registration date range, and the
authenticated admin identity from the bearer token. Outputs are a resolved
recipient count, a persisted campaign with per-recipient delivery state,
dispatched messages, and a learner-visible unsubscribe action.

### Invariants

Audience resolution and dispatch use the same resolver, so the approved count and
the attempted sends agree. No suppressed learner is sent a broadcast, checked
both at resolution and at claim time. No recipient receives the same campaign
twice, guaranteed by the atomic pending-to-sending claim rather than by caller
discipline. Every broadcast body contains a working unsubscribe link, appended by
the system.

Authorization is evaluated server-side on every request and does not depend on
the client's rendered state. Broadcast mutations require the super-admin tier and
reject the machine ops secret. An unsubscribe token authorizes exactly one action
for exactly one learner and confers no other access.

Learner email addresses do not appear in logs, error responses, or client-facing
recipient listings. No request depends on completing within the function timeout
for the campaign to make progress.

### Failure behaviour

A transport failure for one recipient marks that row failed with an error
category and leaves the campaign running; it does not abort the chunk. A campaign
finishing with any failed rows reaches the completed-with-failures state, which
is surfaced to the operator with a retry-failed action that touches only those
rows.

A worker that dies mid-chunk leaves rows in the sending state; these are reclaimed
after a staleness threshold rather than being stranded, and reclaiming re-checks
suppression. A dispatch request against a campaign in the wrong state returns a
conflict naming the current state rather than silently succeeding. An audience
that resolves to zero recipients is rejected before the campaign leaves draft. An
unavailable or misconfigured email service fails the chunk without marking rows
sent.

### Acceptance checks

- A super-admin resolves an audience, sees a count, sends a test, dispatches, and reaches a terminal state, using synthetic data.
- The all-learners audience includes a seeded learner registered more than thirty days ago.
- An ordinary admin's valid token is refused on dispatch, resume, retry, and cancel, regardless of UI state, and a request bearing only the machine ops secret is refused on the same routes.
- A suppressed learner appears in neither the count nor the sends; a learner who unsubscribes mid-campaign is skipped rather than mailed.
- An interrupted campaign resumes and sends no learner a second copy; concurrent dispatch requests do not double-send.
- Validation, pending, empty, denied, and failure states each have distinct, accessible behaviour in the UI.
- A successful dispatch updates the campaign view without discarding the operator's filters or position.
- An unsubscribe token acts only on its own learner and cannot be replayed to alter another record.
- No learner address appears in any log line or error payload produced by the feature.

### Rollout gates

Confirm the default-subscribed position for existing learners and its owner.
Confirm the broadcast sending domain and from-address. Seed the first super-admin
through the existing bootstrap path. Land the consent field and public
unsubscribe before any dispatch capability is enabled, so the first broadcast
cannot precede the ability to opt out. Verify against synthetic data with the
transport mocked.

This document does not authorize a production send.
