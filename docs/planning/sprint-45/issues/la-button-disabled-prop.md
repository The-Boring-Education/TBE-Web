# LA: Honor or remove the ignored `disabled` prop on the shared Button

Category: bug. Type: AFK. Proposed labels: `bug`, `ready-for-agent`.
Source: [Shiksha learning UX issue breakdown](../shiksha-learning-ux-issues.md).

## What to build

The shared `Button` component's props interface declares an optional `disabled`
boolean. The component never reads it. It gates interactivity on `active` and
`isLoading` instead, so any caller passing `disabled` gets no effect and no
warning. The prop looks like it works, which is worse than it not existing.

Pick one resolution and apply it consistently: either wire `disabled` through to
the rendered button's disabled state, or remove it from the interface entirely.
Then audit every caller across the monorepo that currently passes `disabled` and
reconcile each one with the surviving API. Some of those callers are relying on
a control being non-interactive and are silently not getting it.

This was found while reviewing the Shiksha learning page, but it is a shared
component defect affecting every app and must not ride along inside a
Shiksha page pull request.

## Acceptance criteria

- [ ] `disabled` either prevents interaction on the shared Button, or no longer exists in its props interface.
- [ ] If retained, its interaction with `active` and `isLoading` is defined and documented in the component's prop documentation.
- [ ] Every existing caller passing `disabled` across all apps and packages has been found and updated to the surviving API.
- [ ] Any caller that was depending on the no-op behavior is called out explicitly in the pull request description rather than silently changed.
- [ ] Unit tests cover the disabled and enabled cases, including the combination with `active` and `isLoading`.
- [ ] `pnpm quality:check` passes.

## Blocked by

None - can start immediately.
