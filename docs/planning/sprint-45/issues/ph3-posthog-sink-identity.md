# PostHog: add the posthogSink and wire identify/reset into useAuthAnalytics

## Parent

PostHog epic (issue number assigned at publish)

## Context

With the registry (PH1) and scrubbing (PH2) in place, this slice adds PostHog as
the second sink and connects identity. Identity already has a home:
`useAuthAnalytics` calls `setAnalyticsUser` on login and `clearAnalyticsUser` on
logout for GA4. PostHog's `identify`/`reset` go in exactly the same place — no new
logout hook.

## What to build

**`posthogSink`** — a PostHog adapter registered behind the sink registry:

- Initializes `posthog-js` from env config, no-op when the key is absent.
- **Autocapture OFF** — the delegated `UI_CLICK` stream stays authoritative; do
  not let PostHog capture clicks.
- **Session replay ON** with `maskAllText: true` and `maskAllInputs: true`.
  (Canvas/image masking is deliberately not added — see `docs/adr/0003`.)
- Maps a scrubbed semantic event to `posthog.capture`.
- Contains its own errors so a PostHog outage never propagates.

**Identity wiring** — in `useAuthAnalytics`, alongside the existing GA4 calls:
call PostHog `identify` with the same pseudonymous user id on login, and `reset`
on logout. Login/signup timing reuses the existing pending-auth-analytics path.

Replay must respect consent, but the consent module itself is PH4 — here, gate
replay behind a hook/flag boundary that PH4 will fill, defaulting to off until
consent resolves.

## Where to look

`packages/utils/src/analytics.ts` (register the sink; `setAnalyticsUser` /
`clearAnalyticsUser`). `packages/hooks/src/useAuthAnalytics.ts` (identify/reset).
Login/signup pending path in `packages/auth/src/components/AuthCallback.tsx`. Add
`posthog-js` to the appropriate package. Tests extend
`apps/testing/src/unit/hooks/useAuthAnalytics.test.ts` and the analytics util
tests.

## Acceptance criteria

- [ ] `posthogSink` registers behind the registry and no-ops when the PostHog key is absent.
- [ ] Autocapture is off; a single UI click still yields exactly one event (via the delegated stream), not two.
- [ ] Session replay initializes with text and inputs masked.
- [ ] Login calls PostHog `identify`; logout calls `reset` — in `useAuthAnalytics`, beside the existing GA4 calls.
- [ ] A PostHog SDK/network error is contained to the sink and never reaches the caller.
- [ ] Replay does not start until consent resolves (defaults off; PH4 supplies the real gate).
- [ ] `posthog-js` is mocked in tests; no live calls.

## How to verify

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

Mock `posthog-js`; assert login/logout trigger `identify`/`reset`, and that one
simulated click produces one event.

## Blocked by

PH1 (registry) and PH2 (scrubbing).

## Notes

Keep the masking config in the sink, not scattered per app, so no app can
accidentally opt out of masking. The canvas/image gap is an accepted risk, not an
oversight — do not "fix" it here (see `docs/adr/0003`).
