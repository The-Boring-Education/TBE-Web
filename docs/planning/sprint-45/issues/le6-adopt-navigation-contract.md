# OnCampus and DSA Yatra: adopt the navigation contract where it fits

## Parent

Learning Environment epic (issue number assigned at publish)

## Deferred

Not in the sprint-45 delivery window. Becomes a candidate once LE2 lands. Do not
add `ready-for-agent` until then.

## Context

OnCampus and DSA Yatra already use `LearningEnvironmentLayout`, but they build
their sidebars **inside** `children` as persistent split panes rather than
through the shell's sidebar. That is legitimate for split-pane workspaces — which
is exactly why LE2 keeps `sidebarContent` as an escape hatch. This slice is about
moving the parts that are really just navigation lists onto the shared
`navigation` contract, without forcing the split-pane workspaces into a shape
that does not fit them.

## What to build

Audit the OnCampus and DSA learning surfaces (`InterviewSheetWorkspace`,
core-subjects, DSA sheet pages, aptitude) and, where a sidebar is genuinely a
flat or grouped navigation list, move it onto `normalizeLearningNavigation` + the
shell drawer. Where a surface is a true split-pane workspace (topics → questions
→ detail), leave it on `sidebarContent` and document why. The goal is one
navigation implementation for list-style sidebars, not forcing every workspace
into the drawer.

## Where to look

`apps/oncampus/src/components/InterviewSheetWorkspace.tsx`,
`apps/oncampus/src/pages/coresubjects/[[...params]].tsx`,
`apps/oncampus/src/pages/dashboard/dsa-prep/[sheetSlug].tsx`,
`apps/oncampus/src/pages/aptitude/index.tsx`, and `apps/dsayatra/src/pages/sheets.tsx`
(`DsaPrepWorkspace`). Tests in `apps/testing`.

## Acceptance criteria

- [ ] Every list-style sidebar in OnCampus and DSA renders through the shared `navigation` contract, not a hand-rolled list.
- [ ] Genuine split-pane workspaces remain on `sidebarContent`, with a one-line note in the PR on why each stayed.
- [ ] No behavioral or visual regression to the DSA/OnCampus workspaces.
- [ ] Mark-complete, star, lock, and freemium-upsell behaviors are unchanged.

## Blocked by

LE2.

## Notes

This is the slice that proves the hybrid decision was right: it should reduce
duplication for list sidebars while leaving split panes alone. If you find
yourself fighting the contract to fit a split pane, that is the signal to keep it
on the escape hatch.
