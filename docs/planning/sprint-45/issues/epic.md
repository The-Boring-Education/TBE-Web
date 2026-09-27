## What this is

**Shiksha** is the free course product inside The Boring Education platform. A
learner browses courses, enrols in one, reads it chapter by chapter, marks each
chapter complete as they go, earns points for doing so, and receives a
certificate once every chapter is done.

All of that happens on a single page: the course learning page. That one page
owns chapter navigation, the completion save, the course-completion check, the
certificate trigger, and the points award — together, in one component. That is
the root of the problem this epic addresses. Because those responsibilities are
tangled, a change that looks purely cosmetic can quietly corrupt a learner's
saved progress or hand out points that were never earned.

A source-inspection pass over that page turned up four real defects and two
genuine accessibility gaps. This epic tracks fixing them in six deliberately
small, independently reviewable slices.

## Why a contributor should care

These are not hypothetical. On the code as it stands today:

- A learner who finishes a course earns the completion award **again every time they click to another chapter**. Just reading back through a course you already finished inflates your points indefinitely.
- A learner who enrols using the button inside the locked course body **is not actually enrolled**. The page unlocks, they mark chapters complete, and every single save fails silently. They can spend an entire course believing their progress is being recorded when none of it is.
- Opening a stale or mistyped chapter link shows **the first chapter's text under a URL naming a different chapter**, with no heading to reveal the mismatch. Any feedback the learner leaves is filed against a chapter that does not exist.
- A keyboard user tabs straight **into the mobile chapter list while it is closed**, because the panel is only moved off-screen rather than removed. There is no way to see where focus went.

Every one of these is a learner losing work, losing trust, or losing their way.

## What we found that the plan got wrong

Worth reading before you pick up a ticket, because it tells you what _not_ to
build. Three behaviours the original plan asked for already work:

- Duplicate submissions during a save are already prevented; the shared button disables itself while loading.
- A completion response already applies to the chapter you were on when you clicked, not whichever chapter you have since navigated to.
- Chapter selection already lives in the URL and already survives a refresh.

If a ticket mentions one of these, it is asking for a **regression test** that
locks the behaviour in, not for an implementation. The ticket says so
explicitly where it applies. Please do not rewrite working code.

## The six slices

Tackle them in this order. They almost all touch the same page component, so
they are chained on purpose to keep diffs small and reviews honest.

| Issue                             | Slice                                               | Kind        | Blocked by | Ready? |
| --------------------------------- | --------------------------------------------------- | ----------- | ---------- | ------ |
| The-Boring-Education/TBE-Web#1292 | Honour or remove the ignored Button `disabled` prop | bug         | nothing    | yes    |
| The-Boring-Education/TBE-Web#1293 | Award course completion exactly once                | bug         | nothing    | yes    |
| The-Boring-Education/TBE-Web#1294 | Resolve chapter selection server-side, fix Back     | bug         | #1293      | no     |
| The-Boring-Education/TBE-Web#1295 | Real enrolment and visible save failures            | bug         | #1293      | no     |
| The-Boring-Education/TBE-Web#1296 | Accessible mobile chapter drawer                    | enhancement | #1294      | no     |
| The-Boring-Education/TBE-Web#1297 | Contain long content on narrow viewports            | enhancement | #1296      | no     |

**Available to pick up right now: #1292 and #1293.** The rest unlock as their
blockers close. #1292 touches only a shared package and can run alongside any
of the others.

None of these carry `good first issue`, deliberately. #1292 looks small but
changes a component every app in the monorepo consumes, and #1293 touches
points awards that feed the leaderboard. They are both well specified and very
much open to newcomers via `help wanted` — just not unsupervised-beginner
territory. #1297 is the gentlest of the six once its blocker lands.

We considered splitting the page component apart first so these could run in
parallel, and decided against it. That refactor would put the enrolment,
completion, and certificate behaviour at risk inside one large diff, which is
exactly the failure this epic exists to prevent.

## Ground rules for all six

- **Test what a learner can observe**, not internal helper names or component structure. All tests live in `apps/testing`.
- **Never break saved progress.** Completion history and certificate eligibility must come out unchanged. Several tickets ask you to assert this.
- **The server is the authority** on progress and awards. The page reflects server state; it does not invent it.
- **No visual redesign.** These tickets change behaviour. Layout and styling direction is a separate, human-reviewed decision.
- **No `console.log`.** Use the project logger.

## Getting set up

- [Repository README](https://github.com/The-Boring-Education/TBE-Web/blob/development/README.md) covers prerequisites, `pnpm install`, and running apps.
- The learning page lives in the platform app: `pnpm dev:platform`, then visit `localhost:3000`.
- [Testing guide](https://github.com/The-Boring-Education/TBE-Web/blob/development/apps/testing/README.md) covers the test apps and fixtures.
- Useful commands: `pnpm test:unit`, `pnpm test:e2e`, `pnpm test:e2e:ui` for the interactive Playwright runner, and `pnpm quality:check` before you open a pull request.

New to the codebase? Comment on the ticket you would like and ask; we would
rather answer questions up front than review a large wrong-direction diff.

## Source

Requirements: `docs/planning/sprint-45/shiksha-learning-ux.md`. Rationale,
evidence, and the full inspection record: `docs/planning/sprint-45/shiksha-learning-ux-issues.md`.
