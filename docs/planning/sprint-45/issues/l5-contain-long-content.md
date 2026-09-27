## Parent

The-Boring-Education/TBE-Web#1291

## Context

Shiksha chapters are programming lessons, so they are full of code blocks and
the occasional wide comparison table. On a phone, a long unwrapped line of code
makes the rendered content wider than the screen.

When that happens the _page itself_ starts scrolling sideways, not just the
code block. The learner swipes right to read the end of a line, and the
completion button and the chapter navigation trigger slide off out of reach.
They are reading a code-heavy chapter on the train and can no longer mark it
complete or jump to the next one without scrolling back.

The fix is to make the overflow belong to the element that overflows, rather
than to the whole page.

## What to build

Contain horizontal overflow inside the chapter content container, so
overflowing elements — code blocks, tables, anything wide — scroll within their
own bounds while the page does not.

Code must stay readable and stay selectable. Solving this by shrinking text
until it fits, or by wrapping code lines in a way that breaks their meaning,
is not the outcome we want.

## Keep it looking the same

This is overflow _behaviour_, not layout redesign. Content-density targets and
visual direction are a separate, human-reviewed decision and are out of scope
here. Desktop rendering should come out unchanged.

## Where to look

Chapter content is rendered through the MDX renderer used by the learning page
in the platform app. Browser tests go in `apps/testing` under the platform e2e
directory.

## Acceptance criteria

- [ ] At a 375 pixel viewport, a chapter containing both a wide code block and a wide table produces no horizontal scrolling of the page itself.
- [ ] Overflowing elements scroll within their own bounds and remain readable.
- [ ] The completion control and the chapter navigation trigger stay reachable for such chapters.
- [ ] Code blocks remain selectable and copyable wherever they already were.
- [ ] Desktop rendering of the same content is unchanged.
- [ ] A browser test covers the narrow-viewport case with representative long content.

## How to verify

```bash
pnpm install
pnpm dev:platform        # localhost:3000, then use device emulation at 375px
pnpm test:e2e
pnpm quality:check
```

Find a chapter with a genuinely long code line — or paste one into a fixture —
and confirm the page does not slide sideways. A useful assertion is comparing
the document's scroll width against the viewport width.

## Blocked by

The-Boring-Education/TBE-Web#1296

## Notes

The smallest ticket in this epic and a reasonable first contribution for
someone comfortable with CSS, though it does need a Playwright test to go with
it. It is sequenced last because it shares a page with the drawer work in
#1296; picking it up before that lands will cause conflicts.
