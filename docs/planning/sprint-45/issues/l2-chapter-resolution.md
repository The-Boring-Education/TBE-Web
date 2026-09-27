## Parent

The-Boring-Education/TBE-Web#1291

## Context

A learner reading a Shiksha course expects the web to behave like the web: the
URL should say which chapter they are on, refreshing should keep them there,
sharing the link should send a friend to the same place, and the Back button
should go back.

Most of that already works. Chapter links are real navigations carrying the
chapter identifier, so selection reaches the URL and survives a refresh. **Do
not rebuild that.** Two specific things are broken.

### An unrecognised chapter id shows the wrong chapter's content

Open a learn URL with a chapter identifier that does not exist — a stale
bookmark, a link from before the course was re-edited, a typo — and the page
finds no matching chapter. So it renders no chapter heading. But the body falls
back to a page-level content value which the server fills with _the first
chapter's content_.

The result: the learner reads chapter one's text at a URL naming a completely
different chapter, with no heading anywhere to reveal the mismatch. Worse, the
per-chapter feedback widget is handed the unrecognised identifier as its
content id, so any rating they leave is filed against a chapter that does not
exist. That is corrupt data generated from a broken link.

### Back fails at exactly one boundary

Land on the learn URL with no chapter parameter, pick a chapter, press Back.
The URL returns to where it started but the page keeps showing the chapter you
picked. The effect that syncs selection from the router only runs when a
chapter parameter is present, so the empty case does nothing at all.

## What to build

Move chapter resolution to the server for the learn route. Validate the chapter
identifier in the server-side props and redirect an unrecognised one to the
canonical first-chapter URL.

Doing it server-side rather than patching it in the browser matters: the
mismatch never renders at all, and shared or stale links correct themselves in
the address bar instead of quietly showing the wrong thing. It also means a
learner never sees a flash of wrong content before a client-side repair.

Then make the bare learn URL resolve to the canonical first chapter when
reached via Back, exactly as it does on a first visit.

## Watch out

The server-side props helper you will be changing **is shared with the course
overview route**. Scope your change so overview behaviour is untouched, and
prove it with a test. This is the main review risk on this ticket.

Also make sure your redirect cannot loop. A redirect that lands on a URL which
itself redirects will take the page down.

## Where to look

The learning page and the course overview page are both in the platform app
under the Shiksha routes. The shared server-props helper lives in the utils
package. Browser tests go in `apps/testing` under the platform e2e directory.

## Acceptance criteria

- [ ] A request for the learn route carrying an unrecognised chapter identifier redirects to the canonical first-chapter URL.
- [ ] No rendered state ever pairs one chapter's heading with a different chapter's body.
- [ ] The per-chapter feedback widget never receives an unrecognised chapter identifier.
- [ ] Redirecting produces no navigation loop.
- [ ] Selecting a chapter then pressing Back returns to the previously displayed chapter, including when the previous history entry is the learn URL with no chapter parameter.
- [ ] Forward navigation restores the chapter it left.
- [ ] Refreshing on any chapter keeps that chapter selected, and a directly pasted valid chapter link opens that chapter.
- [ ] The course overview route's server-side behaviour is unchanged, covered by a test.
- [ ] Navigating between chapters performs no enrolment, completion, or certificate writes.
- [ ] Browser assertions cover direct links, refresh, Back and Forward, at both desktop and mobile widths.

## How to verify

```bash
pnpm install
pnpm dev:platform        # visit localhost:3000 and try a bad chapter id by hand
pnpm test:e2e
pnpm quality:check
```

Try it manually first. Paste a nonsense chapter id into a learn URL and watch
what renders — the bug is much clearer seen than described.

## Blocked by

The-Boring-Education/TBE-Web#1293

Both tickets work in the same region of the learning page. L1 lands first so
this one does not inherit its defect.

## Notes

Chapter selection already appears in the URL today. This ticket is about making
resolution authoritative and making history behave at the edges — it is not
about introducing URL-driven selection from scratch.
