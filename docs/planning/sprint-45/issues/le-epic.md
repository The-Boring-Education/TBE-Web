# Shared Learning Environment: one dark shell for every product

## What this is

Every TBE product has a learning experience — Shiksha courses, Projects, DSA
sheets, OnCampus subjects, interview-prep sheets. Today they do not share one.
OnCampus and DSA Yatra already sit inside a shared dark shell,
`LearningEnvironmentLayout` in `@tbe/components`. Shiksha, interview-prep, and
Projects are separate hand-rolled light pages, each with its own chapter list,
its own mobile drawer, and its own colors.

This epic finishes the job the shared shell was started for: make its theme
token-driven, make its sidebar pluggable, give it one accessible drawer, then
move the platform learning surfaces onto it. It is **consolidation of what
already exists**, not a new package.

## Why a contributor should care

- The shared chapter-list atoms in `@tbe/components` are written against semantic
  color tokens (`foreground`, `muted`, `border`) that platform never defined. On
  platform today those classes resolve to nothing — the Shiksha chapter list is
  styled by accident.
- The learning page maps its chapters twice, once for a desktop sidebar and once
  for a hand-rolled mobile drawer, while a shared list component sits unused. Every
  navigation fix has to be written twice.
- The shell's `sidebarContent` drawer prop has zero consumers, so the one piece
  built to be accessible is dead code, while the drawer learners actually use is
  the inaccessible hand-rolled one.

## The slices

Sprint 45 is slices 1 to 3. The rest are chained behind them and land later.

| Issue | Slice | Kind | Blocked by | Ready? |
| --- | --- | --- | --- | --- |
| LE1 | Semantic color tokens + shared dark learning theme | bug | nothing | yes |
| LE2 | Shell internals: navigation normalizer, headless sidebar hook, `getLayout` opt-out | enhancement | LE1 | no |
| LE3 | Migrate Shiksha learn page onto the shell (closes #1296) | enhancement | LE2, PH6 | no |
| LE4 | Migrate interview-prep | enhancement | LE3 | no |
| LE5 | Migrate Projects | enhancement | LE3 | no |
| LE6 | OnCampus and DSA adopt the navigation contract | enhancement | LE2 | no |

**Available right now: LE1.** It is a self-contained bug fix and unblocks the
rest.

LE3 is gated behind the `useFeatureFlag` hook from the PostHog epic (PH6), so the
Shiksha migration can be rolled out per surface and reverted without a deploy.
That is the one cross-epic dependency.

## Ground rules for all slices

- **Shell chrome only.** These slices make chrome dark and token-driven. The
  rendered content area of each surface is not restyled — that stays behind the
  reviewed-design gate in `shiksha-learning-ux.md`.
- **Never break learning history.** Completion, certificate, and points behavior
  must come out unchanged. Assert it.
- **One implementation.** Consolidate duplicated chapter/question lists onto the
  shared atoms; do not add a third.
- **No new modal library.** The accessible drawer is built on the dialog
  primitive already in the repo.
- **No `console.log`.** Use the project logger.

## Source

Requirements: `docs/planning/sprint-45/learning-environment.md`. Decisions:
`docs/adr/0002-dark-token-driven-learning-shell.md`. Glossary: `CONTEXT.md`.
