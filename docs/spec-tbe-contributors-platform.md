# Spec — TBE Contributors Program

| Field      | Value                                                                         |
| :--------- | :---------------------------------------------------------------------------- |
| Status     | Draft — pending PRD alignment                                                 |
| Companion  | [`docs/prd-tbe-contributors-platform.md`](./prd-tbe-contributors-platform.md) |
| Apps       | `apps/contributor`, `apps/admin`, `apps/api`                                  |
| Depends on | existing `DevRel*` models under `apps/api/src/lib/database/models/DevRel/`    |

This file is the index. Each numbered file below is a self-contained
chapter owned by one contributor so edits don't collide. If a chapter
contradicts the PRD, the PRD wins; if a chapter contradicts this
index, the chapter wins.

## Chapters

| #   | File                                                               | Owner area             | What it covers                                                                                                                                                     |
| :-- | :----------------------------------------------------------------- | :--------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | [data-model.md](./contributors/01-data-model.md)                   | backend / data         | `DevRelLead` + `DevRelTask` extensions, new `Contribution` and `FounderMessage` collections, indexes, the `completionTracking` migration.                          |
| 02  | [contribution-ledger.md](./contributors/02-contribution-ledger.md) | backend / data         | The append-only `ContributionLedger` collection, its query helper, idempotency, and the sum-equals-balance invariant. The one place correctness is non-negotiable. |
| 03  | [review-workflow.md](./contributors/03-review-workflow.md)         | backend / API          | The review transaction (approve / request_changes / reject / retract), its ordering, and transaction boundaries.                                                   |
| 04  | [domain-modules.md](./contributors/04-domain-modules.md)           | backend / shared       | The pure-function modules: Tier Resolver, Submission State Machine, Cohort Clock, Proof URL Classifier, Escalation Router.                                         |
| 05  | [api.md](./contributors/05-api.md)                                 | backend / API          | REST endpoints for leads and admins, request/response shapes, auth model.                                                                                          |
| 06  | [ui-contributor-app.md](./contributors/06-ui-contributor-app.md)   | frontend (contributor) | Pages, drawers, and state for `apps/contributor`.                                                                                                                  |
| 07  | [ui-admin.md](./contributors/07-ui-admin.md)                       | frontend (admin)       | The new "Contributors" section inside `apps/admin`.                                                                                                                |
| 08  | [rollout.md](./contributors/08-rollout.md)                         | program lead           | Phased work plan, out-of-scope list, risks, open questions.                                                                                                        |

## Vocabulary (binding, short form)

Full definitions live in the PRD. The one-liners engineers need in
front of their keyboards:

- **Contribution Point** — the point unit (`CP` in UI only).
- **Tier** — Contributor (0–49 CP) / Lead (50–99 CP) / Captain (100+ CP).
- **Contribution** — a submitted proof-of-work record.
- **Track** — `code | community`.
- **Cohort** — per-lead rolling, 4 calendar months.

Do not use _XP_ or _Level_ for anything in this program; those are
reserved for the learner-side gamification system (CONTEXT.md).

## How to edit this spec

- One commit per chapter whenever possible — makes review scoped.
- If a change touches more than one chapter, update the chapters, then
  touch this index last.
- A chapter has one named owner at the top. Non-owners can PR against
  it; the owner is the merge gatekeeper.
- When a chapter is implemented, don't delete it — turn its forward-
  looking prose past-tense and link out to the shipped code.
