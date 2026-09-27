# L5: Contain long chapter content on narrow viewports

Category: enhancement. Type: AFK. Proposed labels: `enhancement`.
Source: [Shiksha learning UX PRD](../shiksha-learning-ux.md), story 10.
Rationale: [issue breakdown](../shiksha-learning-ux-issues.md).

## What to build

Long code blocks and wide tables in chapter content can push the rendered page
wider than the viewport on narrow screens. When that happens the page itself
scrolls sideways, which moves the completion control and the chapter navigation
trigger out of reach. A learner reading a code-heavy chapter on a phone can lose
access to the controls that let them make progress or leave.

Contain that overflow inside the content container so overflowing elements
scroll within their own bounds and the page does not.

This is overflow behavior, not layout redesign. Content-density targets and
visual direction remain out of scope and human-reviewed.

## Acceptance criteria

- [ ] At a 375 pixel viewport, a chapter containing both a wide code block and a wide table produces no horizontal scrolling of the page itself.
- [ ] Overflowing elements scroll within their own bounds and remain readable.
- [ ] The completion control and the chapter navigation trigger stay reachable for such chapters.
- [ ] Code blocks remain selectable and copyable where they already were.
- [ ] Desktop rendering of the same content is unchanged.
- [ ] A browser test covers the narrow-viewport case with representative long content.

## Blocked by

- L4
