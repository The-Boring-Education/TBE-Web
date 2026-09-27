# Re-scoped body for #1296

This is the replacement body for
[#1296](https://github.com/The-Boring-Education/TBE-Web/issues/1296). The
original ([l4-accessible-chapter-drawer.md](l4-accessible-chapter-drawer.md))
asked someone to fix the accessibility of the hand-rolled Shiksha mobile drawer.
That drawer is being **deleted** by the Learning Environment migration, so fixing
it in place would be wasted work and a merge conflict with that migration.

Re-scope: #1296 moves under the Learning Environment epic. Its accessibility
requirements become the acceptance criteria for the shared `useLearningSidebar`
hook (LE2), and the Shiksha migration (LE3) closes it. Its parent changes from
the Shiksha epic (#1291) to the Learning Environment epic. Its blocker changes
from #1294 to LE2.

At publish, replace the body of #1296 with everything below the line.

---

## Parent

Learning Environment epic (issue number assigned at publish)

## Context

On a phone, the Shiksha chapter list lives behind a slide-out drawer. It was
hand-rolled and is inaccessible in essentially every way a drawer can be: the
panel is never unmounted (a keyboard user Tabs into an off-screen list they
cannot see), there is no dialog role, no accessible name, no Escape handling, no
focus containment, no focus return, and the close control is an unlabelled icon.

Originally this ticket asked for that drawer to be fixed in place. It is no
longer scoped that way. The Learning Environment epic replaces the hand-rolled
drawer entirely with a shared, accessible one built on the dialog primitive
already in the repo, driven by the headless `useLearningSidebar` hook. So this
ticket is now the **accessibility contract that shared drawer must satisfy**, and
it is verified on the migrated Shiksha page.

## What this ticket now is

1. The accessibility acceptance criteria below are implemented once, in the
   shared `useLearningSidebar` hook and the `LearningEnvironmentLayout` drawer
   (LE2), not in the Shiksha page.
2. They are verified end-to-end when the Shiksha learn page is migrated onto the
   shell (LE3), which deletes the hand-rolled drawer.

Do not fix the hand-rolled drawer in place. Do not introduce a new modal library.
The right primitive is already exported from `@tbe/components`.

## Where to look

The shared shell and its drawer are in
`packages/components/src/layout/LearningEnvironmentLayout.tsx`; the hook is
`useLearningSidebar` (LE2). The Shiksha page that gets migrated is
`apps/platform/src/pages/shiksha/[courseSlug]/learn.tsx`. Tests go in
`apps/testing`.

## Acceptance criteria

- [ ] The shared drawer exposes a dialog role and an accessible name.
- [ ] When the drawer is closed, none of its contents are reachable by keyboard or exposed to assistive technology.
- [ ] Opening the drawer moves focus into it, Escape closes it, and closing returns focus to the control that opened it.
- [ ] Every control in the drawer, including the close control, has an accessible name.
- [ ] Selecting a chapter closes the drawer and moves focus to meaningful content.
- [ ] Background content cannot be interacted with while the drawer is open.
- [ ] These behaviors are implemented in `useLearningSidebar` / the shared layout, not duplicated in the Shiksha page.
- [ ] A browser test completes open, navigate, and dismiss using the keyboard alone at a mobile viewport, asserting focus position at each step, on the migrated Shiksha page.
- [ ] Desktop sidebar behaviour and appearance are unchanged.
- [ ] Chapter selection, completion, and certificate behaviour are unchanged.

## Blocked by

LE2 (the shared `useLearningSidebar` hook). Closed by LE3 (the Shiksha
migration).

## Notes

The focus-management behaviour largely comes from using the right primitive, so
the work is careful wiring and honest keyboard testing, not clever code. This
ticket keeps its `enhancement`, `help wanted`, and `UI/UX` labels; it does not
carry `ready-for-agent` until LE2 lands.
