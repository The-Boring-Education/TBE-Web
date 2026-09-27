# Provider-neutral analytics sink registry

Status: accepted

## Context

TBE already has a working GA4 integration: a typed event registry
(`ANALYTICS_EVENTS`), a delegated click stream, and identify/reset wired through
`useAuthAnalytics`. Sprint 45 adds PostHog for funnels, feature flags, and
session replay. The naive path is a second, independent `posthog-js` init in
each app, sitting beside the GA4 code.

## Decision

`trackEvent` dispatches to a registry of **sinks** rather than to a single
provider. GA4 is sink one, PostHog is sink two. Each sink is env-gated, no-ops
when unconfigured, and contains its own errors so a provider outage cannot throw
into a learning workflow. Call sites do not change; adding or removing a provider
is a registry change, not an edit to every emit site.

## Consequences

- A single event definition stays authoritative across providers, so a funnel in
  PostHog and a report in GA4 describe the same action rather than diverging.
- Autocapture stays off; the delegated click stream remains the one source of
  UI-click data, so clicks are not double-counted across sinks.
- The existing analytics unit tests extend to assert fan-out and per-sink
  isolation rather than being rewritten.

## Considered options

- **Independent per-app PostHog init.** Rejected: fragments identity and event
  naming across ten apps and duplicates the click stream.
- **Replace GA4 outright.** Rejected for now: it strands the admin growth
  dashboard that reads the GA4 Data API and discards a validated baseline before
  PostHog data is trusted. Retiring GA4 is a later, separate decision.
