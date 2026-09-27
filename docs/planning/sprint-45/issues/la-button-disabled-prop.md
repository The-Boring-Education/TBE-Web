## Parent

The-Boring-Education/TBE-Web#1291

## Context

`Button` is the shared button used across every app in this monorepo — the
platform, the quiz app, prep-yatra, all of them. Its props interface offers a
`disabled` boolean, so a developer writing a form or a gated action reasonably
writes `<Button disabled={...} />` and moves on.

It does nothing. The component never reads that prop. It decides whether the
button is interactive from two _other_ props, `active` and `isLoading`, and
`disabled` is quietly dropped on the floor.

This is worse than the prop simply not existing. A missing prop is a TypeScript
error you fix in ten seconds. A prop that type-checks, reads correctly in
review, and silently does nothing is a control somewhere in production that a
user can click when they should not be able to — and nobody knows which one.

We found this while reviewing the Shiksha learning page, which passes
`disabled` and gets nothing. It is almost certainly not the only caller.

## What to build

Pick one resolution and apply it consistently across the monorepo.

**Either** wire `disabled` through so it actually disables the rendered button,
**or** remove it from the props interface entirely so callers get a compile
error instead of silence.

Then find every existing caller passing `disabled` and reconcile each one with
whichever API survives. This is the important half of the task. Some of those
callers are relying on a control being non-interactive and are not getting it;
those are live bugs in other parts of the product that this ticket surfaces.

If you keep the prop, define how it interacts with `active` and `isLoading` —
today those two are combined to decide interactivity, and a third input needs
stated precedence rather than implied precedence.

## Where to look

The shared component lives in the components package under the common buttons
directory, and its props interface is in the interface package. Searching the
repository for `disabled` on button usages will find the callers. Paths drift;
search rather than trusting this paragraph.

## Acceptance criteria

- [ ] `disabled` either prevents interaction on the shared Button, or no longer exists in its props interface.
- [ ] If retained, its interaction with `active` and `isLoading` is defined and documented in the component's prop documentation comment.
- [ ] Every existing caller passing `disabled`, across all apps and packages, has been found and updated to the surviving API.
- [ ] Any caller that was silently depending on the no-op behaviour is called out in the pull request description rather than quietly changed. Reviewers need to know which live behaviours this ticket alters.
- [ ] Unit tests cover disabled and enabled cases, including the combination with `active` and `isLoading`.
- [ ] `pnpm quality:check` passes.

## How to verify

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

Unit tests belong in `apps/testing`. See the
[testing guide](https://github.com/The-Boring-Education/TBE-Web/blob/development/apps/testing/README.md).

## Notes

This is a shared-package change. Please keep it in its own pull request rather
than folding it into a feature branch — it affects every app, and it needs to
be reviewable on its own.

Scope discipline: do not redesign the Button API while you are in here. One
prop, resolved.

## Blocked by

None - can start immediately.
