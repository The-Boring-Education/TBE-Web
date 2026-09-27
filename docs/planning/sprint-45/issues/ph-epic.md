# PostHog: funnels, flags, and replay as a second analytics sink

## What this is

TBE runs on GA4 today: a typed event registry, a delegated click stream, and
identify/reset wired through `useAuthAnalytics`. It can see page views and
clicks, but it cannot answer the questions that move the product — where learners
drop off between signup, enrolment, and finishing chapters; whether a change
helps or hurts; and what a broken session actually looked like.

This epic adds **PostHog** for activation/retention **funnels**, **feature flags
and experiments**, and **session replay** — added as a second **sink** behind the
existing analytics contract, not as a parallel per-app SDK. GA4 keeps working;
the same semantic events fan out to both.

This selects PostHog as the provider and supersedes the open-provider stance in
`analytics-decision.md`.

## Why it is shaped this way

- **One event, many sinks.** A naive second init per app would fragment identity
  across ten apps and duplicate the click stream. The sink registry keeps one
  event definition authoritative across providers (`docs/adr/0001`).
- **Autocapture stays off.** The existing delegated `UI_CLICK` stream is the one
  source of click data. Turning on PostHog autocapture would double every click.
- **Replay masks text and inputs**, but not canvas or images — a deliberately
  accepted risk (`docs/adr/0003`), which is why replay stays off resume-yatra and
  onboarding during rollout.
- **Consent by policy, not a banner.** Privacy-policy update, a profile opt-out,
  DNT/GPC honoured, and replay geo-disabled for EU/UK.

## The slices

Sprint 45 is the platform pilot: PH1–PH7 enabling PostHog on platform only, then
validating against GA4 before any fan-out.

| Issue | Slice | Kind | Blocked by | Ready? |
| --- | --- | --- | --- | --- |
| PH1 | Provider-neutral sink registry | enhancement | nothing | yes |
| PH2 | `scrubEventProperties` (allowlist + query-string strip) | enhancement | PH1 | no |
| PH3 | `posthogSink` + identify/reset in `useAuthAnalytics` | enhancement | PH1, PH2 | no |
| PH4 | `analyticsConsent` (DNT/GPC, opt-out, EU/UK replay gate) | enhancement | PH1 | no |
| PH5 | Ingestion: reverse-proxy helper, env config, CSP | enhancement | PH3 | no |
| PH6 | `useFeatureFlag` hook (first consumer: LE migration) | enhancement | PH3 | no |
| PH7 | Platform pilot + validation against GA4 | enhancement | PH3, PH4, PH5 | no |

**Available right now: PH1.** It changes only the shape of dispatch and leaves
GA4 behavior identical.

PH6 is the cross-epic dependency: the Learning Environment migration (LE3) is
gated behind the flag hook this slice ships.

## Ground rules for all slices

- **No call-site changes.** Adding PostHog is a registry change, not an edit to
  every `trackEvent` caller.
- **Fail safe.** Missing config is a no-op; a provider error is contained to its
  sink; the app never breaks because analytics is down.
- **No private data leaves the client.** The allowlist and query-string scrubbing
  are enforced before dispatch.
- **Mock the SDK.** No live PostHog calls in tests.
- **No `console.log`.** Use the project logger.

## Source

Requirements: `docs/planning/sprint-45/posthog-integration.md`. Decisions:
`docs/adr/0001` (sink registry) and `docs/adr/0003` (accepted replay risk).
Superseded prior stance: `docs/planning/sprint-45/analytics-decision.md`.
Glossary: `CONTEXT.md`.
