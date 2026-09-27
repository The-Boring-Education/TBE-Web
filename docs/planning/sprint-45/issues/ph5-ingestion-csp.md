# PostHog: reverse-proxy ingestion, env config, and CSP

## Parent

PostHog epic (issue number assigned at publish)

## Context

A meaningful share of direct-to-PostHog traffic is dropped by ad blockers. A
reverse proxy through the app's own origin avoids that, but it must be added
consistently across the monorepo's apps and needs Content-Security-Policy
changes. Platform already has a CSP test that allowlists GA and will need
updating in the same change.

## What to build

- A **shared Next.js rewrite helper** in `@tbe/config` that proxies PostHog
  ingestion through the app origin, so every app opts in the same way rather than
  each hand-rolling a rewrite.
- **Env config**: add the PostHog project key and (proxied) host to
  `envConfig` in `@tbe/constants`, and declare the new public env vars in
  `turbo.json` (both `build` and `build:cloud-run` env lists).
- **CSP**: extend the platform CSP to permit PostHog's `script-src`,
  `connect-src`, and `worker-src` origins (proxied where applicable), and update
  `apps/testing/src/unit/platform/contentSecurityPolicy.test.ts` to match.
- Host is PostHog Cloud US.

## Where to look

`packages/config` for the rewrite helper; `packages/constants/src/envConfig.ts`
and `turbo.json` for env; the platform CSP source and
`apps/testing/src/unit/platform/contentSecurityPolicy.test.ts` for policy. The
`.env.example` files should document the new vars.

## Acceptance criteria

- [ ] A shared rewrite helper in `@tbe/config` proxies PostHog ingestion through the app origin; platform adopts it.
- [ ] PostHog key and proxied host are in `envConfig` and declared in `turbo.json` for both build targets.
- [ ] Platform CSP permits PostHog `script-src`, `connect-src`, and `worker-src`; `contentSecurityPolicy.test.ts` is updated and passes.
- [ ] New env vars are documented in the relevant `.env.example` files.
- [ ] With the proxy in place, ingestion succeeds through the app origin (verified against a mocked endpoint in tests).

## How to verify

```bash
pnpm install
pnpm test:unit         # includes the CSP test
pnpm dev:platform      # confirm ingestion path resolves through the proxy
pnpm quality:check
```

## Blocked by

PH3 (`posthogSink` must exist to have something to proxy).

## Notes

Put the rewrite in a shared helper so the other apps get the proxy for free at
fan-out time rather than each reinventing it. The CSP test is the guardrail that
stops a future change from silently breaking ingestion — update it, do not delete
it.
