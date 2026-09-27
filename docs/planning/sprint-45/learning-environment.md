# PRD: Shared Learning Environment

Status: consolidation and migration, not a greenfield build. Sprint 45 covers the
first three slices; the remaining surfaces follow later.

## Problem Statement

A learner moving between TBE products meets a different learning experience in
each one. OnCampus and DSA Yatra already sit inside a shared dark shell; Shiksha,
interview-prep, and Projects are separate hand-rolled light pages, each with its
own chapter mapping, its own mobile drawer, and its own colors. The shared shell
that was meant to unify them exists but is only half-adopted: its sidebar prop
has no consumers, so its drawer is dead code, and platform never defined the
semantic color tokens that the shared learning atoms are written against, so
those pages are styled partly by accident. The result is duplicated
navigation code, inconsistent theming, and accessibility work that has to be
done more than once.

## Solution

Treat the existing `LearningEnvironmentLayout` as the one **Learning
Environment** and finish adopting it. Make its theme token-driven and its sidebar
pluggable, give it a headless, accessible drawer, then migrate the platform
learning surfaces onto it one at a time. No new package: this is consolidation of
what already exists. Shell chrome becomes consistently dark and token-driven; the
rendered content area of each surface is unchanged.

## User Stories

1. As a learner, I want the same shell around every course, sheet, and project I open, so that moving between products does not feel like moving between websites.
2. As a learner on any product, I want a consistently dark, readable learning shell, so that long study sessions are comfortable.
3. As a learner, I want the chapter list to look and behave the same everywhere, so that I do not relearn navigation per product.
4. As a mobile learner, I want to open and close the chapter list with touch or keyboard, so that navigation is usable on a phone.
5. As a keyboard user, I want focus to enter an open drawer, stay inside it, and return to its trigger when it closes, so that I never lose my place.
6. As a screen-reader user, I want the drawer to have a dialog role, an accessible name, and a labelled close control, so that it is announced correctly.
7. As a learner, I want selecting a chapter to close the drawer and move me to the content, so that selection has an obvious result.
8. As a learner opening a stale link, I want a deterministic chapter selection, so that a mistyped or old URL does not show one chapter under another chapter's title.
9. As a learner, I want my progress bar and completion controls to stay visible on narrow screens, so that long code blocks and tables do not push them off screen.
10. As a maintainer, I want one chapter-list implementation, so that a navigation fix lands in one place instead of being missed in a duplicate.
11. As a maintainer, I want the shell colors driven by tokens, so that the shared learning atoms stop rendering with unresolved classes on platform.
12. As a maintainer, I want a way to opt a platform page out of the global navbar and footer, so that a learning page does not render two stacked navbars.
13. As a maintainer, I want navigation normalization as a pure function, so that chapter, question, and section shapes can be tested without rendering an app.
14. As a maintainer, I want the drawer's disclosure and focus behavior in a headless hook, so that its accessibility is tested independently of any surface.
15. As a DSA or OnCampus learner, I want the split-pane workspace to keep working, so that consolidation does not regress the surfaces already on the shell.
16. As a product owner, I want the platform migration to go behind a feature flag, so that it can be rolled out per surface and reverted without a deploy.
17. As a learner without enrollment, I want an honest access state inside the shell, so that the environment does not imply protected content is available.
18. As a learner, I want completion, certificate, and points behavior unchanged by this work, so that a visual consolidation never touches my learning history.

## Implementation Decisions

Confirmed during planning:

- Consolidate and migrate onto the existing `LearningEnvironmentLayout`. Do not
  create a new package.
- Shell chrome is dark and token-driven (see `docs/adr/0002`). The content area
  of each surface is out of scope for restyling.
- The sidebar is **hybrid**: a typed `navigation` data contract is the default
  path for Shiksha, Projects, and interview-prep, and the existing
  `sidebarContent` slot is retained as an escape hatch for the DSA and OnCampus
  split-pane workspaces.
- The accessibility requirements of published issue #1296 become the acceptance
  criteria for the shared drawer. #1296 is re-scoped into this epic; #1297
  (content containment) stays a separate per-surface concern.
- The platform migration is gated by a PostHog feature flag consumed through
  `useFeatureFlag` (defined in the PostHog PRD), so the Learning Environment is
  that flag's first customer.

Modules to build or modify:

- **`normalizeLearningNavigation`** (pure): turns a surface's raw chapters,
  sections, or questions into an ordered list of **navigation items**
  (`id`, `label`, `status`, optional `locked`, optional group) plus derived
  total and completed counts. No React, no DOM.
- **`useLearningSidebar`** (headless hook): owns responsive disclosure
  (persistent at `lg` and above, modal below), open and close, Escape, focus
  trap while modal, focus return to the trigger, and close-on-select. Returns
  state and prop-getters; renders nothing.
- **Extended `LearningEnvironmentLayout`**: accepts a `navigation` prop (rendered
  through the shared list atoms and the accessible drawer) and a token-driven
  theme, while keeping `sidebarContent` for split-pane surfaces.
- **`getLayout` escape hatch** in platform `_app.tsx`: a page may opt out of the
  global `Layout` (Navbar + Footer) so a learning page does not stack two
  navbars. Replaces the drift-prone per-route list DSA Yatra uses today.
- **Semantic token map**: `background`, `foreground`, `muted`, `muted-foreground`,
  `border`, `card` added to platform Tailwind, backed by CSS variables shipped
  from `@tbe/components`, matching the tokens the shared atoms already reference.

Slice order (sprint 45 = slices 1 to 3):

1. Semantic tokens and shared dark learning theme. Standalone bug fix; no layout
   change.
2. Shell internals: `normalizeLearningNavigation`, `useLearningSidebar`, extended
   layout props, and the `getLayout` escape hatch. No visual change.
3. Migrate Shiksha `learn.tsx` onto the shell. Closes #1296.

Deferred: 4) interview-prep, 5) Projects, 6) OnCampus and DSA adopt the
`navigation` contract where it fits.

## Testing Decisions

A good test here asserts what a learner or maintainer can observe — the drawer
traps focus, an invalid chapter resolves deterministically, the normalizer
produces the right counts — not private helper names or component internals.

- **`normalizeLearningNavigation`**: Vitest unit tests over chapter, question,
  and section inputs, including empty, locked, and out-of-order cases, asserting
  item order, status, and derived counts.
- **`useLearningSidebar`**: hook tests for open/close, Escape, focus trap, focus
  return, and close-on-select, plus the responsive persistent-vs-modal switch.
  These carry #1296's acceptance criteria.
- **Extended `LearningEnvironmentLayout`**: component tests that the drawer
  exposes a dialog role and accessible name, that closed contents are not
  reachable, and that split-pane `sidebarContent` still renders.
- **Shiksha migration**: Playwright E2E completing open, navigate, dismiss using
  the keyboard alone at a mobile viewport, asserting focus position at each step,
  and asserting completion, certificate, and points behavior is unchanged.

Prior art to reuse rather than duplicate: the existing Shiksha enrolment E2E
spec and course mocks in `apps/testing`, and the shared learning atoms
(`ChapterLink`, `LearningChapterList`, `LearningSidebarPanel`) already exported
from `@tbe/components`.

## Out of Scope

Content-area visual redesign (still behind the reviewed-sample gate in
`shiksha-learning-ux.md`), a new content authoring or editor system, rewriting
gamification or certificate eligibility, changing enrollment policy, migrating
interview-prep or Projects (deferred slices), and the OnCampus/DSA `navigation`
adoption (deferred slice). Content containment on narrow viewports remains issue
#1297, tracked separately.

## Further Notes

`sidebarContent` has zero consumers today; every workspace app builds its sidebar
inside `children`, so the shared drawer is currently dead code. Keeping it as the
documented escape hatch is deliberate — it is the right primitive for split-pane
surfaces even though the data contract is the default path.

The platform `_app.tsx` wraps every page in the global `Layout` with no opt-out,
so slice 2's `getLayout` hatch is a prerequisite for slice 3, not an optional
nicety. Without it, migrating Shiksha yields two stacked navbars.

Leaderboard award-tracking merged to `development` after the sprint-45 snapshot;
any assertion about completion or points must be verified against current
`development`, consistent with the note in `shiksha-learning-ux.md`.

## Technical Specification

### Contract and Invariants

A **navigation item** has a stable `id`, a display `label`, a `status`
(`complete | incomplete`), an optional `locked` flag, and an optional group key.
`normalizeLearningNavigation` is deterministic and total: the same input yields
the same ordered output and derived counts, and unknown or empty input yields an
empty list with zero counts rather than throwing.

The shell renders in exactly one of two sidebar modes: the `navigation` data
contract (shell owns list rendering and the drawer) or the `sidebarContent` slot
(surface owns its pane). A surface supplies one, not both.

The drawer is modal below the `lg` breakpoint and persistent at or above it. When
modal and open, focus is contained and Escape closes it; when closed, its
contents are neither focusable nor exposed to assistive technology; on close,
focus returns to the trigger; selecting an item closes the drawer and moves focus
to meaningful content. Navigation performs no enrollment, completion, or
certificate writes.

Shell chrome colors resolve only from theme tokens; no chrome element hardcodes a
hex value or `bg-black`/`text-white`. A platform page opting out via `getLayout`
renders without the global Navbar and Footer.

### Failure Behavior

An unresolved theme token must not leave chrome unstyled: the theme provides
defaults so a surface that has not defined a token still renders a dark shell. An
invalid or unknown chapter identifier resolves to the agreed canonical fallback
and normalizes the URL without a navigation loop. If the migration flag cannot be
read, the surface falls back to its pre-migration layout rather than erroring.

### Acceptance Checks

- The shared learning atoms render with resolved colors on platform (no unstyled
  `muted`/`foreground` classes).
- `normalizeLearningNavigation` returns correct order and counts for chapter,
  question, and section inputs, and empty for empty input.
- Keyboard-only users can open, navigate, and dismiss the mobile drawer without
  losing focus; closed-drawer contents are unreachable.
- A migrated Shiksha learn page renders one navbar, not two.
- DSA and OnCampus split-pane workspaces are visually and behaviorally unchanged.
- Completion, certificate, and points behavior is unchanged by the migration.

### Rollout Gates

Land slice 1 (tokens) and confirm the atoms resolve before touching layout. Land
slice 2 (shell internals + `getLayout`) with no visual change before migrating
any surface. Gate the Shiksha migration behind the `useFeatureFlag` flag, verify
desktop and mobile, and keep content-area redesign out of these PRs unless a
reviewed design is supplied.
