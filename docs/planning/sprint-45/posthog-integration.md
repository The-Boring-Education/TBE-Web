# PRD: PostHog Integration

Status: provider now selected. This supersedes the open-provider stance in
`analytics-decision.md`. Sprint 45 pilots on platform; other apps follow by env
config.

## Problem Statement

TBE can see page views and clicks through GA4, but it cannot answer the questions
that actually drive the product: where do learners drop off between signing up,
enrolling, and finishing chapters; whether a change to the learning experience
helps or hurts; and what a broken session actually looked like. Adding a second
analytics SDK naively — a separate init per app beside GA4 — would fragment
identity, double-count clicks against the existing delegated stream, and, if
session replay were enabled without care, quietly copy learners' personal data
into a third-party tool.

## Solution

Add PostHog as a second **sink** behind the existing analytics contract, not as a
parallel integration. GA4 keeps working; the same semantic events fan out to
both. PostHog provides activation and retention **funnels**, **feature flags and
experiments**, and **session replay** on learning surfaces. Autocapture stays off
so the existing delegated click stream remains authoritative. Replay masks text
and inputs; consent is handled by policy, a profile opt-out, and DNT/GPC rather
than a blocking banner, with replay geo-disabled for EU/UK. Roll out on platform
first, validate against GA4, then enable other apps by configuration.

## User Stories

1. As a product operator, I want a signup-to-first-chapter funnel, so that I can see where learners drop off instead of guessing.
2. As an operator, I want retention cohorts across products, so that I know whether learners come back.
3. As an operator, I want funnels built from server-confirmed events, so that completion counts reflect real learning rather than button intent.
4. As a product owner, I want feature flags, so that I can roll out the Learning Environment migration per surface and turn it off without a deploy.
5. As a product owner, I want experiments, so that a change to the learning flow can be measured against a control.
6. As a support engineer, I want session replay on learning pages, so that I can see what a learner saw when they report a broken flow.
7. As a learner, I want my typed text and form inputs masked in any recording, so that replay does not capture what I write.
8. As a learner, I want a way to opt out of analytics from my profile, so that I control whether I am tracked.
9. As a learner who sets Do Not Track or Global Privacy Control, I want that honoured, so that I do not have to ask twice.
10. As an EU or UK learner, I want session replay disabled for me, so that recording is not applied where consent expectations are strictest.
11. As a maintainer, I want one event definition to reach both GA4 and PostHog, so that a funnel and a report describe the same action.
12. As a maintainer, I want clicks counted once, so that turning on PostHog does not double every UI interaction against the existing delegated stream.
13. As a maintainer, I want analytics to no-op when unconfigured, so that a missing key never breaks an app.
14. As a maintainer, I want a provider outage contained, so that PostHog being down cannot throw into a learning workflow.
15. As a maintainer, I want a kill switch, so that I can stop analytics without a code change.
16. As a signed-in learner, I want my identity attached consistently, so that my sessions are not counted as several anonymous users.
17. As a learner signing out, I want analytics identity reset, so that the next person on the device is not linked to me.
18. As a maintainer, I want event payloads scrubbed of sensitive fields and query strings, so that analytics is not a second copy of private data.
19. As an operator, I want a validated event cohort on platform before fan-out, so that I trust the data before other apps send it.
20. As a maintainer, I want ad-blocker loss reduced via a reverse proxy, so that direct-to-PostHog blocking does not silently drop events.
21. As a security reviewer, I want the CSP updated for PostHog's script, connect, and worker origins, so that ingestion is allowed without weakening policy elsewhere.

## Implementation Decisions

Confirmed during planning:

- **Purpose**: funnels, feature flags/experiments, and session replay — all three.
- **Architecture**: a provider-neutral sink registry inside the existing
  analytics module (see `docs/adr/0001`). GA4 is sink one, PostHog is sink two.
  No call-site changes.
- **Autocapture OFF.** The delegated `UI_CLICK` stream stays the single source of
  UI-click data, so clicks are not double-counted.
- **Replay ON** everywhere it is enabled, with `maskAllText` and `maskAllInputs`.
- **Accepted risk (owner-approved, see `docs/adr/0003`)**: canvas and images are
  not masked. As a consequence replay is kept off resume-yatra and onboarding
  during rollout rather than relied upon to mask them.
- **Consent**: no blocking banner. Privacy-policy update, a persistent profile
  opt-out, DNT/GPC honoured, and session replay geo-disabled for EU/UK while
  events still capture there.
- **Hosting**: PostHog Cloud US, reached through a reverse proxy so ad blockers
  do not drop ingestion. CSP updated accordingly.
- **Rollout**: pilot on platform, validate the event cohort against GA4, then
  enable other apps by env config.

Modules to build or modify:

- **Sink registry** in `packages/utils/src/analytics.ts`: `trackEvent` fans out
  to registered sinks; each is env-gated, no-ops when unconfigured, contains its
  errors, and honours a kill switch.
- **`scrubEventProperties`** (pure): enforces the versioned property allowlist
  and strips query strings before dispatch.
- **`posthogSink`**: the PostHog adapter holding init config (autocapture off,
  masking on, replay settings) and mapping semantic events to `capture`.
- **`analyticsConsent`** (pure where possible): resolves DNT/GPC, the persistent
  profile opt-out, and the EU/UK replay gate into a consent decision.
- **`useFeatureFlag`** in `@tbe/hooks`: SSR-safe defaults and a documented
  fallback when PostHog is unreachable. First consumer is the Learning
  Environment migration flag.
- **Identity wiring**: PostHog `identify`/`reset` added alongside the existing
  `setAnalyticsUser`/`clearAnalyticsUser` calls in `useAuthAnalytics` — the same
  central place, no new logout hook.
- **Ingestion**: a shared Next.js rewrite helper in `@tbe/config` so every app
  proxies consistently; env vars added to `envConfig` and `turbo.json`; CSP
  updated with the matching change to the platform CSP test.

Slice order (sprint 45 = pilot on platform):

1. Sink registry (fan-out, no-op, error containment, kill switch).
2. `scrubEventProperties` (allowlist + query-string stripping).
3. `posthogSink` + identity wiring in `useAuthAnalytics`.
4. `analyticsConsent` (DNT/GPC, profile opt-out, EU/UK replay gate).
5. Ingestion: rewrite helper, env config, CSP + CSP test update.
6. `useFeatureFlag`, first consumer being the Learning Environment migration.
7. Platform pilot and validation against GA4.

## Testing Decisions

A good test asserts observable behavior: an event reaches both sinks, a disallowed
field never leaves the client, a consent signal suppresses replay, logout resets
identity. It does not assert private helper names. `posthog-js` is mocked; no live
provider calls in verification.

- **Sink registry**: fan-out to multiple sinks, no-op when unconfigured, one sink
  throwing does not stop the other, kill switch disables all.
- **`scrubEventProperties`**: rejects non-allowlisted and sensitive fields, strips
  query strings, passes allowlisted properties through unchanged.
- **`analyticsConsent`**: DNT/GPC produces opt-out, profile opt-out persists, EU/UK
  gate disables replay while leaving event capture on.
- **Identity**: extend `useAuthAnalytics` tests so login calls PostHog `identify`
  and logout calls `reset`, alongside the existing GA4 assertions.
- **`useFeatureFlag`**: SSR-safe default before load, documented fallback when
  PostHog is unreachable.

Prior art to extend rather than duplicate: `apps/testing/src/unit/utils/analytics.test.ts`,
`useAuthAnalytics.test.ts`, `analyticsEvents.test.ts`, and the platform
`contentSecurityPolicy.test.ts`.

## Out of Scope

Retiring GA4 or migrating the admin growth dashboard off the GA4 Data API,
turning on autocapture, enabling replay on resume-yatra or onboarding, a blocking
consent banner, self-hosting PostHog, bulk event backfill, importing customer
lists, and enabling apps beyond the platform pilot before the cohort is
validated.

## Further Notes

This PRD selects PostHog and therefore supersedes the deliberately open stance in
`analytics-decision.md`; that document is amended to point here. The provider is
chosen; GA4 is retained rather than replaced, and any future GA4 retirement is a
separate decision.

The reverse proxy must be added per app (the monorepo has roughly ten) and the
CSP change is required for the platform pilot; the platform already has a CSP
test that allowlists GA and will need updating in the same change.

The masking gap in `docs/adr/0003` is an accepted product risk, recorded so it is
not mistaken for an oversight. If risk tolerance changes, closing it is a config
change (block classes / route exclusion), not a redesign.

## Technical Specification

### Inputs

Env config: a PostHog project key and host (proxied), plus the existing GA and
app-id variables. A kill-switch flag. Client signals: DNT and GPC headers/APIs,
the persistent profile opt-out, and a coarse EU/UK region signal for the replay
gate.

### Outputs

Semantic events dispatched to every configured sink after scrubbing; PostHog
`identify`/`reset` on auth transitions; feature-flag values through
`useFeatureFlag`; session replay recordings on enabled learning surfaces with
text and inputs masked.

### Invariants

One semantic event definition reaches all sinks. A UI click produces exactly one
event via the delegated stream, never a second via autocapture. No event payload
leaves the client carrying a non-allowlisted field, a raw query string, an email,
a token, or form input text. Analytics with no configuration is a no-op. A sink's
failure is contained to that sink. Logout resets provider identity. Replay is
disabled where consent is opted out and for EU/UK regions.

### Failure Behavior

Missing PostHog configuration leaves the app fully functional with GA4
unaffected. A PostHog network or SDK error is swallowed inside `posthogSink` and
never propagates to the caller. If flags cannot be fetched, `useFeatureFlag`
returns its SSR-safe default and consumers fall back to pre-flag behavior. The
kill switch disables all sinks without a deploy.

### Acceptance Checks

- A single `trackEvent` call is observed by both the GA4 and PostHog sinks in a
  test with both configured.
- A contract test fails if an event payload contains a non-allowlisted or
  sensitive field, or an unstripped query string.
- With no PostHog key, the app renders and GA4 still receives events.
- One UI click yields exactly one click event, not two.
- Login triggers PostHog `identify`; logout triggers `reset`.
- A DNT/GPC signal or profile opt-out suppresses capture; an EU/UK region
  disables replay while events still flow.
- The platform CSP permits PostHog script, connect, and worker origins, and the
  CSP test reflects it.

### Rollout Gates

Complete the sink registry, scrubbing, and consent modules before enabling any
provider key. Enable PostHog on platform only, validate the event cohort against
GA4, and review data quality before fanning out to other apps by env config.
Replay stays off resume-yatra and onboarding.
