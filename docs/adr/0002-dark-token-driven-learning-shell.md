# Dark, token-driven Learning Environment shell

Status: accepted

## Context

The shared `LearningEnvironmentLayout` is already dark and serves OnCampus and
DSA Yatra, but it hardcodes `bg-black text-white`. Meanwhile the platform
learning surfaces (Shiksha, interview-prep, projects) are hand-rolled light
pages, and platform's Tailwind config defines none of the semantic tokens
(`background`, `foreground`, `muted`, `border`) that the shared learning atoms
like `ChapterLink` are already written against. Those classes resolve to nothing
in production today, so the current appearance is partly accidental.

## Decision

The Learning Environment shell chrome is dark and token-driven: one learning
theme expressed as CSS variables in `@tbe/components`, with the matching semantic
token map added to platform's Tailwind config. Surfaces consume the tokens rather
than hardcoding colors. This governs shell chrome only — the rendered content
area keeps its existing design.

## Consequences

- Fixes the accidental styling: the shared learning atoms resolve their colors on
  platform for the first time.
- Supersedes, for chrome only, the "changes must follow a reviewed design sample"
  gate recorded in `docs/planning/sprint-45/shiksha-learning-ux.md`. Content-area
  redesign remains behind that gate.
- A learner moving between products gets a consistent shell instead of a light
  page in one product and a dark one in another.

## Considered options

- **A `theme: 'light' | 'dark'` prop.** Rejected: preserves the split it was
  meant to remove and leaves platform's broken tokens unfixed.
- **Full dark redesign including content.** Rejected: that is the redesign the
  reviewed-sample gate exists to protect.
