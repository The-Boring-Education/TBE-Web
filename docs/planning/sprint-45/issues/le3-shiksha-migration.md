# Migrate the Shiksha learn page onto the shared Learning Environment

## Parent

Learning Environment epic (issue number assigned at publish)

## Context

With the tokens resolving (LE1) and the shell internals in place (LE2), the
Shiksha course learn page can finally move onto the shared Learning Environment.
Today `learn.tsx` is a hand-rolled light page: it maps its chapters twice — once
for a sticky desktop sidebar, once for a hand-rolled mobile drawer that is
inaccessible in every way a drawer can be — and it wraps itself in undefined
color classes.

This slice replaces that with the shared shell: the page hands the shell a
normalized `navigation` list and lets the shell render the drawer via
`useLearningSidebar`. It **closes #1296** (the accessible-drawer issue), because
the shell's drawer is the accessible one.

## What to build

Migrate `learn.tsx` to render inside `LearningEnvironmentLayout`, opting out of
the global platform `Layout` via the `getLayout` hatch from LE2 so there is one
navbar, not two. Feed the shell a single normalized chapter list through
`normalizeLearningNavigation`; delete both hand-rolled chapter mappings and the
hand-rolled mobile drawer. Preserve the page's existing content area, enrollment
checks, completion mutation, certificate flow, and points behavior exactly.

Gate the migration behind a feature flag read through `useFeatureFlag` (PH6) so
it can be enabled per surface and reverted without a deploy. When the flag is off
or PostHog is unreachable, the page falls back to its current layout.

## Closes #1296

The accessibility acceptance criteria from #1296 are satisfied by the shared
drawer, verified here on the migrated page:

- Dialog role and accessible name; labelled close control.
- Closed drawer contents are unreachable by keyboard and hidden from assistive tech.
- Open moves focus in, Escape closes, close returns focus to the trigger.
- Selecting a chapter closes the drawer and moves focus to content.
- Background is inert while the drawer is open.

## Where to look

The page is `apps/platform/src/pages/shiksha/[courseSlug]/learn.tsx`. The shell,
normalizer, and hook come from LE2 in `@tbe/components` / `@tbe/hooks`. The
feature-flag hook comes from PH6. The existing Shiksha enrolment E2E spec and
course mocks are in `apps/testing`.

## Acceptance criteria

- [ ] The Shiksha learn page renders inside `LearningEnvironmentLayout` with exactly one navbar.
- [ ] Both hand-rolled chapter mappings and the hand-rolled mobile drawer are gone; the page feeds one normalized `navigation` list to the shell.
- [ ] All #1296 accessibility criteria pass on the migrated page (keyboard open/navigate/dismiss, focus trap, focus return, inert background, labelled controls).
- [ ] Chapter selection, completion, certificate eligibility, and points behavior are unchanged, verified against current `development`.
- [ ] The migration is behind a `useFeatureFlag` flag; with the flag off, the page falls back to its pre-migration layout.
- [ ] A Playwright E2E completes open, navigate, and dismiss using the keyboard alone at a mobile viewport, asserting focus position at each step.
- [ ] The content area is not redesigned in this PR.

## How to verify

```bash
pnpm install
pnpm dev:platform        # localhost:3000, open a course, narrow the window
pnpm test:e2e
pnpm test:unit
pnpm quality:check
```

Put the mouse down and drive the drawer with Tab, Shift+Tab, Enter, and Escape.
Then toggle the flag off and confirm the page still works on the old layout.

## Blocked by

LE2 (shell internals) and PH6 (`useFeatureFlag`). Closes #1296.

## Notes

Verify the completion and points behavior against current `development`, not the
sprint-45 snapshot — leaderboard award-tracking merged afterwards. This should be
a thin migration precisely because LE2 did the heavy lifting; if it is not thin,
something belongs back in LE2.
