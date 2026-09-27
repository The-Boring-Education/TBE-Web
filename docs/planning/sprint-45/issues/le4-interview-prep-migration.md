# Migrate the interview-prep sheet page onto the shared Learning Environment

## Parent

Learning Environment epic (issue number assigned at publish)

## Deferred

Not in the sprint-45 delivery window. Becomes a candidate once LE3 lands and the
Shiksha migration has proven the pattern. Do not add `ready-for-agent` until then.

## Context

The platform interview-prep sheet page is the sibling of the Shiksha learn page:
`SheetHeroContainer` + a custom mobile questions drawer + a sticky desktop aside +
`QuestionLink` + a Mark As Completed control. It is a hand-rolled light page for
the same reasons, and it duplicates the same drawer problem.

## What to build

Repeat the LE3 migration for interview-prep: feed the shell a normalized
`navigation` list of questions through `normalizeLearningNavigation`, render
inside `LearningEnvironmentLayout` via the `getLayout` opt-out, delete the
hand-rolled question mappings and drawer, and preserve completion and star
behavior. Reuse the same accessible drawer — do not write a new one.

## Where to look

`apps/platform/src/pages/interview-prep/[sheetSlug]/index.tsx`. The shared
`QuestionLink` / `LearningQuestionList` atoms are in
`packages/components/src/common/Learning/`. Tests in `apps/testing`.

## Acceptance criteria

- [ ] The interview-prep sheet page renders inside `LearningEnvironmentLayout` with one navbar.
- [ ] Questions feed the shell as one normalized `navigation` list; hand-rolled mappings and drawer removed.
- [ ] Drawer accessibility matches the LE3 bar (focus trap, focus return, inert background, labelled controls).
- [ ] Completion and star behavior are unchanged.
- [ ] Content area is not redesigned.
- [ ] E2E covers keyboard open/navigate/dismiss at a mobile viewport.

## Blocked by

LE3.

## Notes

Should be nearly mechanical after LE3. If it is not, the divergence is a signal
about what the `navigation` contract is still missing.
