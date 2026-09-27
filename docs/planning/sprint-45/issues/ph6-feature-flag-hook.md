# Analytics: useFeatureFlag hook with SSR-safe defaults

## Parent

PostHog epic (issue number assigned at publish)

## Context

PostHog brings feature flags and experiments. The first real customer is the
Learning Environment migration (LE3), which must be able to roll out per surface
and be reverted without a deploy. That gives the flag system a concrete first
consumer rather than shipping an unused hook.

## What to build

**`useFeatureFlag`** in `@tbe/hooks`:

- Reads a flag value from PostHog through the `posthogSink`.
- **SSR-safe default**: returns a caller-provided default during server render and
  before flags load, so there is no hydration flash or crash.
- **Documented fallback**: when PostHog is unreachable or flags cannot be fetched,
  returns the default and callers behave as pre-flag.
- Works when PostHog is unconfigured (returns default, no throw).

Consuming it in LE3 is that slice's job; here, ship the hook and its tests plus a
documented usage example.

## Where to look

`packages/hooks/src` (beside `useAuthAnalytics`, `useTracking`). Flag reads go
through the `posthogSink` from PH3. Tests in `apps/testing/src/unit/hooks`.

## Acceptance criteria

- [ ] `useFeatureFlag(key, default)` returns the default during SSR and before flags load.
- [ ] When PostHog is unreachable or unconfigured, it returns the default without throwing.
- [ ] When a flag resolves, it returns the resolved value.
- [ ] The fallback behavior is documented for consumers.
- [ ] Unit tests cover SSR default, unreachable fallback, and resolved value, with `posthog-js` mocked.

## How to verify

```bash
pnpm install
pnpm test:unit
pnpm quality:check
```

## Blocked by

PH3 (`posthogSink` is the flag source).

## Notes

This slice unblocks LE3 — the Learning Environment epic depends on it. Keep the
SSR-safe default front and centre; a flag hook that flashes or throws on the
server is worse than no flag.
