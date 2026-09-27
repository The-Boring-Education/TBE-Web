# Analytics: turn trackEvent into a provider-neutral sink registry

## Parent

PostHog epic (issue number assigned at publish)

## Context

Analytics today dispatches straight to GA4 inside `packages/utils/src/analytics.ts`:
`trackEvent` enriches the event and calls `gtag`. To add PostHog without a second
per-app init and without editing every call site, dispatch needs to fan out to a
registry of **sinks**. GA4 becomes sink one; PostHog will be sink two (PH3). This
slice introduces the registry and moves GA4 behind it, with no behavior change
for GA4.

## What to build

A sink registry inside the analytics module. A **sink** is a registered
destination with a name, an `isEnabled()` gate (env-driven), and a `capture()`
method. `trackEvent` scrubs (PH2 will add real scrubbing; here just pass through)
and dispatches the enriched event to every enabled sink. Requirements:

- **No-op when unconfigured.** A sink with no env config reports disabled and is
  skipped; with no sinks configured at all, `trackEvent` is a safe no-op.
- **Error containment.** A sink throwing inside `capture()` must not stop other
  sinks or propagate to the caller.
- **Kill switch.** A single env flag disables all sinks without a code change.
- **GA4 unchanged.** Move the existing GA4 dispatch into a `ga4Sink` behind the
  registry; its emitted events and enrichment (`page_path`, `app_id`) are
  identical to today.

No call sites change. `trackEvent`'s signature is preserved.

## Where to look

`packages/utils/src/analytics.ts` (`trackEvent`, `initGA`, `setAnalyticsUser`,
`clearAnalyticsUser`). Event registry in `packages/constants/src/analyticsEvents.ts`.
Env resolution in `packages/constants/src/envConfig.ts`. Existing tests in
`apps/testing/src/unit/utils/analytics.test.ts`.

## Acceptance criteria

- [ ] `trackEvent` dispatches to a registry of sinks; GA4 dispatch lives in a `ga4Sink` behind it.
- [ ] With no sinks configured, `trackEvent` is a no-op and does not throw.
- [ ] A sink throwing in `capture()` does not stop other sinks and does not propagate to the caller.
- [ ] A kill-switch env flag disables all sinks.
- [ ] GA4's emitted events and enrichment are byte-for-byte what they are today (existing GA4 tests still pass).
- [ ] No `trackEvent` call site is modified.
- [ ] Tests assert fan-out to multiple sinks, no-op when unconfigured, per-sink error isolation, and the kill switch.

## How to verify

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

Register a fake second sink in a test and assert one `trackEvent` call reaches
both it and the GA4 sink.

## Blocked by

None — can start immediately.

## Notes

This is the keystone slice; everything else in the epic sits on it. Keep the sink
interface small — name, enabled gate, capture — so PostHog and any future
provider drop in without touching this again. See `docs/adr/0001`.
