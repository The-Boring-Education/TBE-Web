# L2: Resolve chapter selection server-side and fix Back at the URL boundary

Category: bug. Type: AFK. Proposed labels: `bug`.
Source: [Shiksha learning UX PRD](../shiksha-learning-ux.md), stories 1, 2 and 3.
Rationale: [issue breakdown](../shiksha-learning-ux-issues.md).

## What to build

Chapter selection already reaches the URL and already survives a refresh. Two
gaps remain, and one of them is the content mismatch the PRD explicitly forbids.

**An unrecognized chapter identifier renders the wrong content.** The page finds
no matching chapter, so it renders no chapter heading, while the body falls back
to the page-level content value that the server props populate with the first
chapter's content. The learner sees the first chapter's body at a URL naming a
different chapter. The per-chapter feedback widget is handed the unrecognized
identifier as its content id, so learner feedback is filed against a chapter
that does not exist.

**Browser Back fails at one boundary.** The effect that synchronizes selection
from the router only runs when a chapter query value is present. Landing on the
learn URL with no chapter parameter, selecting a chapter, then pressing Back
returns the URL to its original state but leaves the selected chapter displayed.

Validate the chapter identifier in the server props for the learn route and
redirect an unrecognized one to the canonical first-chapter URL, so shared and
stale links correct themselves before hydration rather than rendering a
mismatch and repairing it afterwards. Make the bare learn URL resolve to the
canonical first chapter on Back exactly as it does on first load.

The server props helper is shared with the course overview route. Scope the
change so overview behavior is unaffected, and prove that with a test.

Selection already appears in the URL today, so this is not about introducing
URL-driven selection. It is about making resolution authoritative and making
history behave at the edges.

## Acceptance criteria

- [ ] A request for the learn route carrying an unrecognized chapter identifier redirects to the canonical first-chapter URL.
- [ ] No rendered state ever pairs one chapter's heading with a different chapter's body.
- [ ] The per-chapter feedback widget never receives an unrecognized chapter identifier.
- [ ] Redirecting produces no navigation loop.
- [ ] Selecting a chapter and then pressing Back returns to the previously displayed chapter, including when the previous history entry is the learn URL with no chapter parameter.
- [ ] Forward navigation restores the chapter it left.
- [ ] Refreshing on any chapter keeps that chapter selected, and a directly pasted valid chapter link opens that chapter.
- [ ] The course overview route's server-side behavior is unchanged, covered by a test.
- [ ] Navigation performs no enrollment, completion, or certificate writes.
- [ ] Browser assertions cover direct links, refresh, Back and Forward at both desktop and mobile widths.

## Blocked by

- L1
