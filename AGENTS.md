# AGENTS.md

## Cursor Cloud specific instructions

This is a Turborepo + **pnpm 10** monorepo (`packageManager: pnpm@10.30.3`, Node `>=20`). All standard
commands live in the root `package.json` scripts and `README.md`; prefer those over duplicating here.

### Network egress requirement (important, non-obvious)

Dependency installation requires outbound HTTPS to the npm registry, which is **not** on the default
Cloud Agent egress allowlist. If `pnpm install` fails with `ECONNRESET` / `ERR_PNPM_META_FETCH_FAIL`,
the network — not the repo — is the problem. Ask the user to allow these hosts in
**Cloud Agent → Network Access**:

- `registry.npmjs.org` — **required** (all JS deps; also how corepack fetches the pinned pnpm)
- `objects.githubusercontent.com` — GitHub release assets (prebuilt native binaries, e.g. `sharp`)
- `cdn.playwright.dev` (a.k.a. `playwright.azureedge.net`) — Playwright Chromium download run by
  `apps/testing`'s `postinstall`; needed for E2E (`pnpm test:e2e`)
- `fastdl.mongodb.org` — `mongodb-memory-server` binary used by unit/API tests in `apps/testing`

`pnpm` itself is installed via corepack using the pinned version, so `registry.npmjs.org` also
unblocks pnpm. Use `corepack enable && corepack prepare pnpm@10.30.3 --activate` before `pnpm install`.

### Services

One central backend serves all frontends:

- **`@tbe/api`** (port **3004**, `pnpm dev:api`) — Next.js API under `/api/v1/`, backed by MongoDB
  (Mongoose). **Every frontend depends on it** for auth (JWT + Google OAuth) and data.
- Frontends (start the one you're testing): `@tbe/platform` 3000, `@tbe/prep-yatra` 3001,
  `@tbe/quizes` 3002, `@tbe/techyatra` 3003, `@tbe/dsayatra` 3005, `@tbe/resume-yatra` 3006,
  `@tbe/oncampus` 3007, `@tbe/admin` 3008 (Vite), `@tbe/resources` 3010, `@tbe/onboarding` (Vite).
- Each app needs its own env file: copy the app's committed `.env.example` to `.env.local`.
  Frontends need at minimum `NEXT_PUBLIC_API_URL=http://localhost:3004/api/v1`; the API needs
  `MONGODB_URI`, `NEXTAUTH_SECRET` (or `AUTH_JWT_SECRET`), and `ADMIN_SECRET`.

### Gotchas

- **MongoDB**: the API needs a running MongoDB (default `mongodb://localhost:27017/tbe-platform`).
  There is no in-repo `docker-compose`; provide MongoDB yourself (local `mongod`, Docker, or Atlas).
  Tests do **not** need it — `apps/testing` uses `mongodb-memory-server`.
- **Onboarding port**: `README.md` says onboarding is on 3003, but it is a Vite app with no port
  override, so it actually runs on Vite's default **5173**. Port 3003 is used by `techyatra`.
- **Tests live only in `apps/testing`**: `pnpm test` (all), `pnpm test:unit`, `pnpm test:api`,
  `pnpm test:e2e`, `pnpm test:coverage`. Quality gate: `pnpm quality:check`
  (lint + format:check + check-types). `pnpm build` runs with `--concurrency=1` (memory-heavy).
