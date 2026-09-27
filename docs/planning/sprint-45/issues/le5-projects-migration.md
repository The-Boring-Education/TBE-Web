# Migrate the Projects page onto the shared Learning Environment

## Parent

Learning Environment epic (issue number assigned at publish)

## Deferred

Not in the sprint-45 delivery window. Becomes a candidate once LE3 lands. Do not
add `ready-for-agent` until then.

## Context

The platform Projects page uses an older light pattern: `Section` +
`ProjectHeroContainer` + a `FlexContainer` sidebar built from `Accordion` /
`AccordionLinkItem` (sections containing chapters), with no mobile drawer at all.
It is the one surface with an implicit "next": marking a chapter complete
auto-advances to the next incomplete chapter.

## What to build

Migrate Projects onto `LearningEnvironmentLayout`. This surface has **grouped**
navigation (sections → chapters), so it exercises the navigation item `group`
key: normalize sections and chapters into grouped navigation items and let the
shell render them. Preserve the auto-advance-on-complete behavior and the
MDX-driven mark-complete action.

## Where to look

`apps/platform/src/pages/projects/[projectSlug]/index.tsx`. Grouped rendering
should reuse the shared list atoms rather than the `Accordion` primitives if the
`navigation` contract can express sections; if a genuine accordion is needed,
raise it against the contract rather than forking the shell. Tests in
`apps/testing`.

## Acceptance criteria

- [ ] The Projects page renders inside `LearningEnvironmentLayout` with one navbar.
- [ ] Sections and chapters feed the shell as grouped normalized navigation items.
- [ ] Auto-advance-to-next-incomplete-chapter on completion is preserved.
- [ ] Mark-complete and MDX content behavior are unchanged.
- [ ] Drawer accessibility matches the LE3 bar where a mobile drawer is introduced.
- [ ] Content area is not redesigned.

## Blocked by

LE3.

## Notes

This is the surface most likely to stress the `navigation` contract's grouping.
If grouping is awkward, that feedback belongs in LE2's contract, not in a
Projects-only workaround.
