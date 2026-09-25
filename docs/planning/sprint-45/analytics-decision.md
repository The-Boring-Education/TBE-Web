# PRD: Product Analytics Contract and Provider Decision

Status: deliberately decision-gated; neither PostHog nor Statsig is selected.

## Problem Statement

The sprint summary calls for Statsig, while its task board calls for PostHog.
The code already has GA4 instrumentation and reporting-related utilities.
Adding multiple SDKs before defining the measurement question can fragment
identity, duplicate events, and introduce unnecessary privacy or operational cost.

## Solution

Define the measurement and experimentation needs, event ownership, privacy rules,
and evaluation criteria first. Preserve existing GA4 behavior. Compare a PostHog
pilot, a Statsig-focused experiment setup, and GA4-only improvement against those
requirements before selecting implementation work.

## User Stories

1. As a product operator, I want a named measurement question, so that instrumentation supports a decision rather than collecting events indiscriminately.
2. As an operator, I want consistent app and event identifiers, so that cross-product reports are interpretable.
3. As an operator, I want event definitions and owners, so that similarly named events mean the same thing.
4. As an operator, I want successful learning distinguished from button clicks, so that usage is not confused with completed learning.
5. As a learner, I want sensitive content and credentials excluded, so that analytics does not become another copy of my private data.
6. As a learner, I want consent and opt-out behavior respected, so that SDK initialization matches the approved policy.
7. As a learner signing out, I want account identity reset, so that another user on the device is not linked to my activity.
8. As an operator, I want anonymous-to-authenticated identity behavior documented, so that counts are not inflated or merged incorrectly.
9. As a maintainer, I want analytics failure not to block learning, so that provider availability does not become application availability.
10. As an operator, I want a small validated event cohort, so that I can verify data quality before expansion.
11. As a maintainer, I want a kill switch and no-op behavior without configuration, so that rollout can be stopped safely.
12. As an operator, I want feature flags and experiments assessed separately from reporting, so that the provider choice matches actual needs.
13. As a maintainer, I want existing GA4 reports preserved, so that a pilot does not silently break current analysis.

## Implementation Decisions

Confirmed by the user: leave the provider decision open. Use a provider-neutral
analytics contract boundary; do not add PostHog or Statsig dependencies as part of
this planning pass. The current code uses GA4 and shared event utilities.

Proposed evaluation criteria: reporting needs, experiments/flags, consent,
identity, retention/residency, cost and volume controls, SDK footprint, export,
operational ownership, and compatibility with existing GA4 events.

Recommended initial contract, subject to policy approval:

- Explicit semantic events with a version, app identifier, event name, timestamp, and an allowlisted property set.
- No emails, access tokens, form input text, resume contents, source code, or raw query strings in event payloads.
- Session replay and automatic DOM capture disabled unless separately reviewed.
- One owner per event and a documented rule preventing duplicate automatic/manual emissions.
- Server-verified completion events distinguished from client navigation or intent events.

## Testing Decisions

Reuse analytics event-constant, utility, hook, and delegated-listener tests. Test
payload allowlists, query-string stripping, consent gating, identity reset,
duplicate prevention, SSR safety, missing configuration, and provider failure.
Mock any selected SDK. Human validation in the chosen provider's test workspace
is a later gate and requires authorized access; no live analytics data is read or
invented during planning.

## Out of Scope

Choosing a provider implicitly, running experiments, bulk event backfill, live
session recording, importing customer lists, new tracking without policy review,
and asserting product performance without a real analytics report.

## Further Notes

The user explicitly chose to keep the provider decision open. This parent should
not carry `ready-for-agent`. The existing "Audit All TBE Products" task remains a
separate human-led report using authorized GA data; SDK installation is not a
substitute for that report.

Decision outputs required: measurement questions, provider, pilot app/events,
identity/consent policy, retention and residency, budget guardrails, owner, and
success criteria for expanding or ending the pilot.

## Technical Specification

### Contract and Invariants

Define semantic events independently of the SDK transport. Validate/sanitize
properties before dispatch. Event names and property keys are a versioned
allowlist. Any authenticated identifier must follow the approved pseudonymous
identity policy; omit personal data and arbitrary object payloads.

Initialization and dispatch must be safe during server rendering, with absent
configuration, before consent, and after opt-out. Logout resets provider identity
as required by the approved identity model. Provider errors are contained and do
not throw into learning workflows.

Document whether each event is client-observed, server-confirmed, or derived in
reporting. Do not use the same name for all three. Retain GA4 behavior until a
separate migration is approved; a second sink must not duplicate the same event
inside a provider.

### Acceptance Checks

- The decision record compares the actual product needs against each provider option.
- A contract test rejects disallowed private fields and sensitive query parameters.
- Missing provider configuration leaves the application functional.
- An approved pilot emits one semantic event per intended action.
- Logout and consent transitions follow the approved identity policy.
- Existing GA4 contract tests remain valid or have a reviewed migration plan.

### Rollout Gates

Complete the provider/privacy decision, approve a small event set, validate in a
test environment, and review data quality before expansion. No provider-specific
agent issue is ready until these gates are resolved.
