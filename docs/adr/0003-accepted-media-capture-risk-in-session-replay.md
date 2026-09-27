# Accepted media-capture risk in session replay

Status: accepted

## Context

Session replay is enabled with `maskAllText` and `maskAllInputs`, so typed text
and form fields are masked. Those options do **not** mask `<canvas>`, `<img>`, or
the URL bar. The monorepo includes resume-yatra (a resume builder whose preview
pane and uploaded content are rendered) and user avatars, so replay can record
personal data even with text and input masking on.

## Decision

Ship replay with text and input masking, and **accept** that canvas and images
are captured unmasked, rather than adding block classes on resume previews and
avatars or disabling replay on those routes. This was chosen deliberately during
planning by the product owner, not overlooked.

## Consequences

- Replay recordings can contain resume preview imagery and avatar images.
- This is the reason replay is, in practice, kept off resume-yatra and
  onboarding rather than relied upon to mask them.
- If the risk tolerance changes, the reversal is a config change (block classes /
  route exclusion), but recordings already captured under this decision would
  need review.

## Considered options

- **Block classes on media plus query-string scrubbing** to close the gap.
  Rejected by the owner as more machinery than the current risk level warrants.
- **Disable replay entirely on resume/onboarding routes.** Not adopted as the
  mechanism; the same protective effect is achieved by not enabling replay on
  those apps during rollout.

This ADR exists so a future reader does not mistake the unmasked-media behaviour
for a bug and "fix" a deliberately accepted trade-off.
