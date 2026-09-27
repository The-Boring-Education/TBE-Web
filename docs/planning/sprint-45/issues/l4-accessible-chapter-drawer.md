## Parent

The-Boring-Education/TBE-Web#1291

## Context

On a phone, the Shiksha chapter list lives behind a slide-out drawer. It was
hand-rolled, and it is inaccessible in essentially every way a drawer can be.

The most serious problem: **the panel is never unmounted**. When "closed" it is
still fully present in the page, just pushed off-screen with a CSS transform. A
keyboard user pressing Tab walks straight into a chapter list they cannot see,
with no visual indication of where their focus has gone. They are lost, and
nothing on screen explains why pressing Enter navigated them somewhere.

On top of that, the drawer has no dialog role, no accessible name, no Escape
handling, no focus containment, and no focus return to whatever opened it. Its
close control is an icon with no label, so a screen reader announces an unnamed
button.

This is a meaningful share of learners. Assistive-technology users and
keyboard-only users cannot currently navigate a course on mobile.

## Why this ticket is bigger than it sounds

The learning page maps over its chapters **twice** — once for the mobile
drawer, once for the desktop sidebar — while a shared chapter list component
already exists in `@tbe/components` and is not used here at all. Every fix in
this area currently has to be written twice and can be fixed in one place and
missed in the other.

So do the consolidation first, then the accessibility work on a single list.

## What to build

**Step one.** Collapse both the mobile and desktop chapter lists onto the
existing shared chapter list component, so there is one implementation. That
component currently accepts a single shared destination for every chapter and
needs to accept a per-chapter one. Match whatever URL shape L2 settles on —
that dependency is why this ticket is blocked on L2 rather than on L1.

**Step two.** Replace the hand-rolled drawer with the accessible dialog-based
drawer already exported from `@tbe/components`. It is built on a proper dialog
primitive and gives you the focus trap, Escape handling, focus return, and
`aria-modal` behaviour directly, rather than requiring you to reimplement a
focus trap by hand. Please do not hand-roll one, and please do not introduce a
new modal library — the right primitive is already in the repository and
already exported.

## Keep it looking the same

This ticket changes drawer _mechanics_, not visual direction. The drawer should
look essentially as it does today when you are done. Broader visual redesign of
the learning experience is a separate, human-reviewed decision and is
explicitly out of scope here. A pull request that also restyles the drawer will
be asked to split.

## Where to look

The learning page is in the platform app under the Shiksha course routes. The
shared chapter list component and the dialog-based drawer are both in
`packages/components` and both exported from its root. Tests go in
`apps/testing`.

## Acceptance criteria

- [ ] Both the mobile and desktop chapter lists render through the shared chapter list component, with no duplicated chapter mapping left in the page.
- [ ] Each chapter link carries its own destination, consistent with the URL shape established in L2.
- [ ] The mobile drawer exposes a dialog role and an accessible name.
- [ ] When the drawer is closed, none of its contents are reachable by keyboard or exposed to assistive technology.
- [ ] Opening the drawer moves focus into it, Escape closes it, and closing returns focus to the control that opened it.
- [ ] Every control in the drawer, including the close control, has an accessible name.
- [ ] Selecting a chapter closes the drawer and moves focus to meaningful content.
- [ ] Background content cannot be interacted with while the drawer is open.
- [ ] A browser test completes open, navigate, and dismiss using the keyboard alone at a mobile viewport, asserting focus position at each step.
- [ ] Desktop sidebar behaviour and appearance are unchanged.
- [ ] Chapter selection, completion, and certificate behaviour are unchanged by this work.

## How to verify

```bash
pnpm install
pnpm dev:platform        # localhost:3000, open a course, narrow the window
pnpm test:e2e
pnpm quality:check
```

Test it the way the bug is experienced: put the mouse down entirely and use
only Tab, Shift+Tab, Enter, and Escape. Then try the closed drawer — today you
can Tab into it, and that is the headline fix.

## Blocked by

The-Boring-Education/TBE-Web#1294

## Notes

Good ticket for someone who cares about accessibility and wants a change with
a directly felt user impact. The focus-management behaviour largely comes from
using the right primitive, so the work is more about careful wiring and honest
testing than about clever code.
