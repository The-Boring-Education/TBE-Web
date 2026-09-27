# Analytics: scrub event properties against an allowlist before dispatch

## Parent

PostHog epic (issue number assigned at publish)

## Context

Once events fan out to more than one sink, and especially once session replay is
in play, it matters even more that event payloads never carry private data. A
learner's email, an access token, form input text, resume contents, or a raw
query string must never leave the client inside an event. Today enrichment adds
`page_path` from the URL — which can itself carry query-string identifiers.

## What to build

`scrubEventProperties` — a pure function applied inside `trackEvent` before
dispatch to any sink. It:

- Enforces a **versioned allowlist** of property keys; keys not on the allowlist
  are dropped.
- **Strips query strings** from any URL-bearing property (including the enriched
  `page_path`) so identifiers in query params never ship.
- Drops known-sensitive shapes outright (email-like, token-like, long free-text)
  as a defense-in-depth backstop even if allowlisted by mistake.
- Passes allowlisted, clean properties through unchanged.

Wire it into `trackEvent` so every sink receives already-scrubbed properties.

## Where to look

`packages/utils/src/analytics.ts` (`trackEvent` enrichment path). The event
registry and its param shapes are in `packages/constants/src/analyticsEvents.ts`
(`ANALYTICS_EVENTS`, `AnalyticsEventParamsMap`) — the allowlist should be derived
from / consistent with these. Tests in `apps/testing`.

## Acceptance criteria

- [ ] Non-allowlisted property keys are dropped before dispatch.
- [ ] Query strings are stripped from URL-bearing properties, including `page_path`.
- [ ] Email-like, token-like, and long free-text values are dropped even if the key is allowlisted.
- [ ] Allowlisted, clean properties pass through unchanged.
- [ ] Scrubbing runs before any sink sees the event (verified with a fake sink).
- [ ] A contract test fails if a sensitive field or an unstripped query string reaches a sink.

## How to verify

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

Feed `trackEvent` a payload containing an email, a token, and a URL with a query
string; assert the fake sink receives none of them.

## Blocked by

PH1 (the registry is where scrubbing is wired in).

## Notes

This is the privacy backstop the analytics-decision PRD asked for. It is a pure
function on purpose — the allowlist logic should be testable without a browser or
a sink. See `docs/planning/sprint-45/analytics-decision.md` for the original
allowlist requirements.
