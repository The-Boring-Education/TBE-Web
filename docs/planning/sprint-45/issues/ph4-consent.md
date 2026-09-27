# Analytics: consent resolution — DNT/GPC, profile opt-out, EU/UK replay gate

## Parent

PostHog epic (issue number assigned at publish)

## Context

TBE has no consent mechanism today; GA4 initializes unconditionally and there is
no banner. Adding session replay raises the stakes. The decision is: no blocking
banner (India-first, protects conversion), but honour Do Not Track and Global
Privacy Control, offer a persistent profile opt-out, and geo-disable session
replay for EU/UK while still capturing events there.

## What to build

**`analyticsConsent`** — resolves a consent decision from:

- **DNT / GPC** browser signals → opt-out of capture.
- A **persistent profile opt-out** the learner can set (stored durably and read
  on init).
- A **coarse EU/UK region signal** → disable session replay specifically, while
  leaving event capture on.

Expose the decision so the registry suppresses capture when opted out, and the
`posthogSink` replay gate (PH3) starts replay only when consent allows and the
region permits. Add the profile opt-out control in profile settings, and note the
privacy-policy update as a required non-code follow-up.

## Where to look

Consent resolution belongs beside the analytics module in `@tbe/utils`; the
opt-out control goes in the platform profile settings UI. The registry
(`trackEvent`) and the `posthogSink` replay gate consume the decision. Tests in
`apps/testing`.

## Acceptance criteria

- [ ] A DNT or GPC signal resolves to opt-out and suppresses capture across all sinks.
- [ ] A persistent profile opt-out suppresses capture and survives reload.
- [ ] An EU/UK region signal disables session replay while events still capture.
- [ ] The `posthogSink` replay gate starts replay only when consent allows and region permits.
- [ ] A learner can set and clear the opt-out from profile settings.
- [ ] `analyticsConsent` is unit-tested for each signal in isolation; the privacy-policy update is tracked as a non-code follow-up.

## How to verify

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

Simulate DNT, GPC, a stored opt-out, and an EU region; assert capture and replay
behave per the matrix above.

## Blocked by

PH1 (the registry consumes the consent decision). Works with PH3's replay gate.

## Notes

Keep `analyticsConsent` as pure as possible — signal in, decision out — so it is
testable without a browser. The EU/UK gate disables replay only, not events; do
not conflate the two.
