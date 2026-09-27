# PostHog: platform pilot and validation against GA4

## Parent

PostHog epic (issue number assigned at publish)

## Context

With the sink, scrubbing, identity, consent, ingestion, and flag hook in place,
PostHog is enabled on **platform only** first. Before any other app sends data,
the event cohort is validated against GA4 so the data is trusted. This is the
"small validated event cohort" gate from the analytics-decision PRD.

## What to build

- Enable the `posthogSink` on platform via env config (other apps stay
  unconfigured, so they no-op).
- Confirm a small, named cohort of semantic events flows to PostHog: the
  activation funnel steps (signup → enrol → first chapter complete → Nth chapter)
  plus login/logout identity.
- **Validate against GA4**: for the cohort, confirm counts are consistent between
  GA4 and PostHog within an expected tolerance, and that identity attaches and
  resets correctly.
- Confirm session replay records on platform learning surfaces with masking on
  and respects consent and the EU/UK gate.
- Record the validation result (what matched, any discrepancy and its cause) so
  fan-out to other apps is a documented go/no-go.

Fan-out to other apps is **out of scope** here — it is a later env-config change
gated on this validation passing.

## Where to look

Platform env config and `.env` / deployment env for the PostHog key. The event
cohort maps to `ANALYTICS_EVENTS` in `@tbe/constants`. GA4 comparison uses the
existing GA reporting access (human-led; no invented data). Any automated checks
live in `apps/testing`.

## Acceptance criteria

- [ ] PostHog is enabled on platform only; other apps remain no-ops.
- [ ] The named activation-funnel cohort plus identity events are observed in PostHog.
- [ ] Cohort counts are validated against GA4 within tolerance, and the result is recorded.
- [ ] Replay records on platform learning surfaces with masking on and respects consent + EU/UK gate.
- [ ] A written go/no-go for fan-out is captured; no other app is enabled in this slice.

## How to verify

Enable on a platform preview/staging with a test PostHog project, walk the
activation funnel as a test user, and compare the cohort against GA4 for the same
window. Verify replay masking on a recorded session and confirm opt-out/EU
behavior.

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

## Blocked by

PH3 (`posthogSink`), PH4 (consent), and PH5 (ingestion/CSP).

## Notes

This slice is partly operational — the GA4 comparison uses authorized reporting
access and is human-led; do not invent or assert live numbers in code. Passing
this gate is what authorizes enabling PostHog on the other apps.
