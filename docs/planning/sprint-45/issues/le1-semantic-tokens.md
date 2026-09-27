# Learning shell: define the semantic color tokens the shared atoms already use

## Parent

Learning Environment epic (issue number assigned at publish)

## Context

The shared learning atoms in `@tbe/components` — `ChapterLink`,
`LearningSidebarPanel`, and friends — are written against shadcn-style semantic
color classes: `text-foreground`, `text-muted-foreground`, `bg-muted`,
`border-border`, `bg-card`, `bg-background`. Those tokens are defined in the
shared reference Tailwind config and in DSA Yatra's CSS variables, but **platform
never defined them**. On platform, `apps/platform/tailwind.config.js` extends
`colors` with brand hex values only — there is no `background`, `foreground`,
`muted`, or `border`, and there are no `:root` CSS variables.

The consequence: on the Shiksha learn page today, those classes resolve to
nothing. The chapter list renders with missing colors. `learn.tsx` even wraps
itself in `bg-background ... text-foreground`, both of which are undefined on
platform. The current appearance is partly accidental.

This slice fixes that, and only that. No layout changes, no component moves.

## What to build

Define one **learning theme** as CSS variables shipped from `@tbe/components`,
and add the matching semantic token map to platform's Tailwind config so the
tokens resolve. The theme is dark (see `docs/adr/0002`). Cover at least the
tokens the shared atoms already reference: `background`, `foreground`, `card`,
`muted`, `muted-foreground`, `border`, and `primary` (platform already has
`primary`).

The theme must provide sensible defaults so that a surface which has not set a
token still renders a coherent dark shell rather than an unstyled one.

## Keep it to tokens

This is a bug fix, not a redesign. When you are done the shared learning atoms
should render with real, resolved colors on platform. Do not move components, do
not touch the layout, do not restyle content. A pull request that also migrates a
page will be asked to split — that is LE3.

## Where to look

Platform Tailwind config is at `apps/platform/tailwind.config.js`. The shared
reference config that already has these tokens is `packages/config/tailwind.config.js`.
DSA Yatra's CSS-variable definitions are in `apps/dsayatra/src/index.css`. The
atoms that consume the tokens are in `packages/components/src/common/Learning/`.
Tests go in `apps/testing`.

## Acceptance criteria

- [ ] `background`, `foreground`, `card`, `muted`, `muted-foreground`, and `border` resolve to defined values on platform.
- [ ] The shared learning atoms (e.g. `ChapterLink`) render with resolved colors on a platform learning page — no unstyled `muted`/`foreground` classes.
- [ ] The learning theme is defined once in `@tbe/components` as CSS variables and consumed by platform Tailwind, not copy-pasted per app.
- [ ] A surface that has not overridden a token still renders a coherent dark shell.
- [ ] No layout, component structure, or content styling changes in this PR.
- [ ] A test asserts the token classes used by the shared atoms resolve to non-empty values.

## How to verify

```bash
pnpm install
pnpm dev:platform        # localhost:3000, open a course learn page
pnpm test:unit
pnpm quality:check
```

Open a Shiksha course learn page before and after. Before, the chapter list has
missing colors; after, it renders correctly against the dark theme.

## Blocked by

None — can start immediately.

## Notes

This is the foundation slice. LE2 and everything after it assume the tokens
resolve. Good pickup for someone comfortable with Tailwind theming and CSS
variables.
