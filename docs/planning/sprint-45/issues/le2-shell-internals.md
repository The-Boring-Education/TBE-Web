# Learning shell: navigation normalizer, headless sidebar hook, and a layout opt-out

## Parent

Learning Environment epic (issue number assigned at publish)

## Context

`LearningEnvironmentLayout` exists and is dark, but two things stop the platform
surfaces from adopting it. First, its sidebar is a single `sidebarContent:
ReactNode` slot that no surface passes today, so each surface builds its own
list and its own drawer. Second, platform's `_app.tsx` wraps **every** page in
the global `Layout` (Navbar + Footer) with no way to opt out, so dropping the
learning shell into a page would render two stacked navbars.

This slice builds the reusable internals so LE3 can migrate Shiksha cleanly. It
introduces **no visual change** on its own.

## What to build

Three pieces, all independently testable:

**1. `normalizeLearningNavigation` — a pure function.** Turns a surface's raw
chapters, sections, or questions into an ordered list of **navigation items**
(`id`, `label`, `status` of complete/incomplete, optional `locked`, optional
group key) plus derived total and completed counts. No React, no DOM.
Deterministic and total: empty or unknown input yields an empty list and zero
counts, never a throw.

**2. `useLearningSidebar` — a headless hook.** Owns the drawer's behavior and
renders nothing. Persistent at the `lg` breakpoint and above, modal below. Owns
open/close, Escape to close, focus trap while modal, focus return to the trigger
on close, and close-on-select. Returns state and prop-getters for a consumer to
wire onto its own elements. This hook carries the accessibility criteria that
were issue #1296.

**3. Extended `LearningEnvironmentLayout` + a `getLayout` opt-out.** Add a
`navigation` prop to the layout that renders the normalized items through the
shared list atoms inside the accessible drawer, while keeping `sidebarContent` as
the escape hatch for split-pane surfaces (DSA, OnCampus). Add a
`Component.getLayout`-style escape hatch to platform `_app.tsx` so a page can opt
out of the global `Layout`. Do not reintroduce a hardcoded per-route list — the
page declares its own layout.

## Where to look

The layout is `packages/components/src/layout/LearningEnvironmentLayout.tsx`. The
shared list atoms and `LearningSidebarPanel` are in
`packages/components/src/common/Learning/`. Platform's app shell is
`apps/platform/src/pages/_app.tsx`; DSA Yatra's per-route fullscreen check in
`apps/dsayatra/src/components/layout/Layout.tsx` shows the drift-prone pattern we
are replacing. Tests go in `apps/testing`.

## Acceptance criteria

- [ ] `normalizeLearningNavigation` returns correct order, status, and derived counts for chapter, question, and section inputs, and an empty list with zero counts for empty input.
- [ ] `useLearningSidebar` opens and closes, closes on Escape, traps focus while modal, returns focus to the trigger on close, and closes on item select.
- [ ] `useLearningSidebar` is persistent at `lg` and above and modal below.
- [ ] The layout accepts a `navigation` prop and renders it through the shared atoms in the accessible drawer.
- [ ] `sidebarContent` still works for split-pane surfaces (no regression for DSA/OnCampus).
- [ ] A platform page can opt out of the global `Layout` via the `getLayout` hatch, and other pages are unaffected.
- [ ] No visual change to any currently shipping surface in this PR.
- [ ] Unit tests for the normalizer and hook, and a component test for the layout drawer's dialog role and accessible name.

## How to verify

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

The normalizer and hook are testable without rendering an app — that is the
point of extracting them. Verify the `getLayout` hatch by opting a throwaway
platform page out and confirming it renders without the global navbar while a
normal page still has it.

## Blocked by

LE1 (semantic tokens must resolve before the shell renders correctly).

## Notes

This slice deliberately produces no visible change; its whole value is that LE3
becomes a thin migration. Keep the hook headless — no JSX — so its accessibility
can be tested in isolation.
