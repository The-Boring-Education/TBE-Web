# L4: One chapter list, wrapped in an accessible drawer

Category: enhancement. Type: AFK. Proposed labels: `enhancement`, `accessibility`.
Source: [Shiksha learning UX PRD](../shiksha-learning-ux.md), stories 8 and 9.
Rationale: [issue breakdown](../shiksha-learning-ux-issues.md).

## What to build

The learning page maps over its chapters twice, once for the mobile drawer and
once for the desktop sidebar, while a shared chapter list component already
exists in `@tbe/components` and is unused here. Collapse both onto that shared
component first, because every drawer fix currently costs double. The shared
component accepts one shared destination for all chapters and needs to accept a
per-chapter one, matching whatever URL shape L2 settles on. That dependency is
why this is blocked on L2 rather than on L1.

Then replace the hand-rolled mobile drawer with the accessible dialog-based
drawer already exported from `@tbe/components`, which supplies the accessibility
contract directly rather than requiring it to be reimplemented.

The current drawer has no dialog role, no accessible name, no Escape handling,
no focus containment, and no focus return, and its close control is an unlabeled
icon button. Most importantly, the panel stays mounted when closed and is only
moved off-screen visually, so keyboard users tab into an invisible chapter list
and lose their place with no way to tell where focus went.

This changes drawer mechanics, not visual direction. Keep the existing
appearance. Broader visual redesign remains out of scope and human-reviewed.

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
- [ ] Desktop sidebar behavior and appearance are unchanged.
- [ ] Chapter selection, completion, and certificate behavior are unchanged by this work.

## Blocked by

- L2
