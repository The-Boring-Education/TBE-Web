# Security Audit & Remediation Spec

> Spec-driven remediation backlog for the TBE codebase. Each finding is a self-contained spec with acceptance criteria, remediation todos, and required tests. Work items are tracked as checkboxes so this doc doubles as a living TODO list.

- **Status:** Draft (findings identified, remediation pending)
- **Last audited:** 2026-07-14
- **Owner:** _unassigned_
- **Related docs:** [code-stability.md](../code-stability.md), [research-embed-html-image-content.md](../research-embed-html-image-content.md)

---

## 1. Overview

### Scope

This audit covers the entire TBE codebase across three repositories:

- **TBE-Web** (this repo) — Turborepo monorepo, Next.js 14 (Pages Router), all apps under `apps/*` and shared `packages/*`.
- **vidya-pod** — Next.js 15 (App Router) + Supabase registration/sponsor app.
- **The-Boring-Agents** — Python FastAPI + LangGraph AI content-generation service.

### Method

Four independent read-only audits were run in parallel, each focused on a domain:

1. Authentication & authorization (JWT, sessions, OAuth, admin gating, IDOR).
2. Injection & input validation (NoSQL injection, XSS, SSRF, mass assignment, rate limiting).
3. Secrets management, configuration & information exposure.
4. Dependency vulnerabilities, security headers & platform/build config.

Findings were then deduplicated and consolidated into the specs below. Each finding has a stable ID (`SEC-NNN`) so it can be referenced in issues, PRs, and commits.

### Severity legend

- **Critical** — Remotely exploitable now, leads to data breach, account takeover, or abuse of infrastructure. Fix immediately (P0).
- **High** — Serious weakness that is exploitable under common conditions or a strong defense-in-depth gap. Fix this cycle (P1).
- **Medium** — Exploitable with preconditions, or hardening that materially reduces risk (P2).
- **Low** — Best-practice / hygiene items with limited direct impact (P3).

### Summary counts

- Critical: 10 (`SEC-001`–`SEC-010`)
- High: 10 (`SEC-011`–`SEC-020`)
- Medium: 8 (`SEC-021`–`SEC-028`)
- Low: 3 (`SEC-029`–`SEC-031`)
- **Total: 31 findings**

Dependency scan (`pnpm audit`, TBE-Web): **95 advisories — 2 critical, 38 high, 42 moderate, 13 low**, driven mainly by outdated Next.js in `apps/api` and `apps/oncampus` (13.5.6).

### Testing requirement

Per the workspace rule "for every line of testable code, there should be tests," every remediation that changes behavior must ship with tests (unit / integration / e2e) in [apps/testing](../../apps/testing). Each spec lists the required tests. Run the full suite before marking a finding done.

---

## 2. Priority remediation order

- **P0 — Stop active abuse & data exposure:** `SEC-001`, `SEC-002`, `SEC-003`, `SEC-007`, `SEC-008`, `SEC-006`, `SEC-018`.
- **P1 — Close auth/authz architecture gaps:** `SEC-004`, `SEC-005`, `SEC-011`, `SEC-012`, `SEC-013`, `SEC-014`, `SEC-010`, `SEC-017`.
- **P1 — Patch known CVEs:** `SEC-009`, `SEC-020`.
- **P2 — Injection, headers & hardening:** `SEC-015`, `SEC-016`, `SEC-019`, `SEC-021`–`SEC-028`.
- **P3 — Hygiene & defense-in-depth:** `SEC-029`, `SEC-030`, `SEC-031`.

---

## 3. Findings

## Critical

### SEC-001 Hardcoded `"TBEAdmin"` admin-secret fallback

- [x] **SEC-001 resolved**

- **Severity:** Critical
- **Category:** Broken access control / hardcoded credential
- **Repo / App:** TBE-Web · `apps/api`

**Affected files**

- [apps/api/src/pages/api/v1/prepyatra/prep-log/index.ts](../../apps/api/src/pages/api/v1/prepyatra/prep-log/index.ts) (L194-199)

**Spec**

The mentor-feedback PATCH handler compares the `x-admin-secret` header against `process.env.ADMIN_SECRET || "TBEAdmin"`. If the env var is unset (or in any environment where it is missing), the well-known string `"TBEAdmin"` grants admin access. The comparison also uses `!==`, which is not timing-safe. This diverges from the hardened `adminMiddleware` in [apps/api/src/middleware/api.ts](../../apps/api/src/middleware/api.ts) which fails closed and uses `crypto.timingSafeEqual`.

**Acceptance criteria**

- No source file contains the literal `"TBEAdmin"` fallback.
- Request is rejected with 500 (misconfiguration) or 401 when `ADMIN_SECRET` is unset — never granted.
- Secret comparison uses `crypto.timingSafeEqual`.
- Route reuses the shared `adminMiddleware` / `ensureAdminAccess` helper instead of an inline check.

**Remediation todos**

- [ ] Remove the `|| "TBEAdmin"` fallback.
- [ ] Replace the inline `!==` check with the shared `adminMiddleware` from `apps/api/src/middleware/api.ts`.
- [ ] Fail closed (return 500) when `ADMIN_SECRET` is not configured.

**Tests required**

- Integration: request with correct secret → 200; wrong secret → 401; missing env → rejected (never 200).
- Unit: timing-safe comparison helper.

---

### SEC-002 Hardcoded `x-admin-secret` shipped in admin client bundle

- [x] **SEC-002 resolved**

- **Severity:** Critical
- **Category:** Secret exposure in client / broken access control
- **Repo / App:** TBE-Web · `apps/admin`

**Affected files**

- [apps/admin/src/api/prepLogsApi.ts](../../apps/admin/src/api/prepLogsApi.ts) (L11-16, L45-50)
- [apps/admin/src/api/challengesApi.ts](../../apps/admin/src/api/challengesApi.ts) (L28-33)

**Spec**

The admin SPA embeds `"x-admin-secret": "TBEAdmin"` directly in bundled JavaScript. Any visitor who loads the app can read the secret from the network tab or JS bundle. Combined with `SEC-001`, this fully compromises secret-gated admin endpoints. The correct pattern is JWT admin auth (`withVerifiedAdminAuth`) via the existing axios bearer interceptor in [apps/admin/src/lib/axios.ts](../../apps/admin/src/lib/axios.ts).

**Acceptance criteria**

- No `x-admin-secret` header (or any secret) is present in any `apps/admin` source or build output.
- Admin API calls authenticate with a verified JWT `Authorization: Bearer` token.
- Corresponding API routes enforce `withVerifiedAdminAuth`.

**Remediation todos**

- [ ] Remove hardcoded `x-admin-secret` from `prepLogsApi.ts` and `challengesApi.ts`.
- [ ] Route these calls through the JWT-bearing axios instance (`apps/admin/src/lib/axios.ts`).
- [ ] Migrate the corresponding server routes to `withVerifiedAdminAuth` (see `SEC-021`).

**Tests required**

- Integration: admin call without JWT → 401; with valid admin JWT → 200; with non-admin JWT → 403.
- Build check / grep test: bundle contains no `TBEAdmin` literal.

---

### SEC-003 Unauthenticated email relay & trigger endpoints

- [x] **SEC-003 resolved**

- **Severity:** Critical
- **Category:** Broken access control / abuse (spam, phishing)
- **Repo / App:** TBE-Web · `apps/api`

**Affected files**

- [apps/api/src/pages/api/v1/email/send.ts](../../apps/api/src/pages/api/v1/email/send.ts) (L10-88)
- [apps/api/src/pages/api/v1/email/triggers.ts](../../apps/api/src/pages/api/v1/email/triggers.ts) (L10-59)
- [apps/api/src/pages/api/v1/email/external.ts](../../apps/api/src/pages/api/v1/email/external.ts) (L13-70)

**Spec**

These POST handlers send email (arbitrary `to_email`, `subject`, `html_content`, or trigger + data) through the platform's email provider with no authentication, no `from_email` allowlist, and no rate limiting. An attacker can send phishing/spam from TBE infrastructure, damaging domain reputation and users.

**Acceptance criteria**

- All three endpoints require an authenticated internal caller (admin JWT or a service-to-service token).
- `from_email` is restricted to an allowlist of TBE-owned domains.
- `to_email` is format-validated; `trigger` is validated against an enum.
- Per-IP / per-recipient rate limiting is applied.

**Remediation todos**

- [ ] Gate `send.ts`, `triggers.ts`, `external.ts` with `withVerifiedAdminAuth` or an internal service token.
- [ ] Add zod validation for bodies (email format, trigger enum, required fields).
- [ ] Enforce `from_email` domain allowlist.
- [ ] Add rate limiting (see `SEC-024`).

**Tests required**

- Integration: unauthenticated POST → 401; authenticated valid payload → 200; disallowed `from_email` → 400; invalid trigger → 400.
- Integration: exceeding rate limit → 429.

---

### SEC-004 Unauthenticated content-write endpoints

- [x] **SEC-004 resolved**

- **Severity:** Critical
- **Category:** Broken access control / mass assignment
- **Repo / App:** TBE-Web · `apps/api`

**Affected files**

- [apps/api/src/pages/api/v1/interview-prep/upload.ts](../../apps/api/src/pages/api/v1/interview-prep/upload.ts) (L19-229)
- [apps/api/src/pages/api/v1/interview-prep/dsa-sheet/index.ts](../../apps/api/src/pages/api/v1/interview-prep/dsa-sheet/index.ts) (L18-64)
- [apps/api/src/pages/api/v1/quiz/index.ts](../../apps/api/src/pages/api/v1/quiz/index.ts) (L64-238)
- [apps/api/src/pages/api/v1/shiksha/index.ts](../../apps/api/src/pages/api/v1/shiksha/index.ts) (L38-55)
- [apps/api/src/pages/api/v1/shiksha/[courseId]/index.ts](../../apps/api/src/pages/api/v1/shiksha/[courseId]/index.ts) (L69-92)
- [apps/api/src/pages/api/v1/projects/index.ts](../../apps/api/src/pages/api/v1/projects/index.ts) (L30-50)
- [apps/api/src/pages/api/v1/webinar/index.ts](../../apps/api/src/pages/api/v1/webinar/index.ts) (L17-18)
- [apps/api/src/pages/api/v1/notification/index.ts](../../apps/api/src/pages/api/v1/notification/index.ts) (L17-183)

**Spec**

Multiple write endpoints publish content (interview sheets, DSA questions, quizzes, courses, projects, webinars, notifications) directly to the production database with no authentication. Course create/update pass the entire `req.body` to the DB (mass assignment) via [apps/api/src/lib/database/queries/shiksha.ts](../../apps/api/src/lib/database/queries/shiksha.ts) (L40-44). Attackers can pollute or deface production content.

**Acceptance criteria**

- All content-write endpoints require admin auth or a service token.
- No handler spreads raw `req.body` into a DB write; fields are mapped via an explicit allowlist.
- Each endpoint validates its body with zod (see `SEC-025`).

**Remediation todos**

- [ ] Add `withVerifiedAdminAuth` (or agent service token) to each listed write endpoint.
- [ ] Replace raw-body DB writes with allowlisted field maps.
- [ ] Add zod schemas per endpoint.

**Tests required**

- Integration per endpoint: unauthenticated write → 401; authorized valid → 200/201; extra/unexpected fields ignored (mass-assignment guard).

---

### SEC-005 Systemic IDOR — user-scoped routes trust client-supplied `userId`

- [x] **SEC-005 resolved**

- **Severity:** Critical
- **Category:** Broken object-level authorization (IDOR)
- **Repo / App:** TBE-Web · `apps/api`

**Affected files (representative)**

- [apps/api/src/pages/api/v1/user/index.ts](../../apps/api/src/pages/api/v1/user/index.ts) (GET L39-123, PATCH L226-270)
- [apps/api/src/pages/api/v1/user/dashboard.ts](../../apps/api/src/pages/api/v1/user/dashboard.ts) (L30-74)
- [apps/api/src/pages/api/v1/user/shiksha/enroll.ts](../../apps/api/src/pages/api/v1/user/shiksha/enroll.ts) (L44-75)
- [apps/api/src/pages/api/v1/user/interview-prep/sheet.ts](../../apps/api/src/pages/api/v1/user/interview-prep/sheet.ts) (L48-57)
- [apps/api/src/pages/api/v1/user/dsayatra/progress.ts](../../apps/api/src/pages/api/v1/user/dsayatra/progress.ts) (L103-198)
- [apps/api/src/pages/api/v1/user/playlists/index.ts](../../apps/api/src/pages/api/v1/user/playlists/index.ts) (L66-73)
- [apps/api/src/pages/api/v1/prepyatra/prep-log/index.ts](../../apps/api/src/pages/api/v1/prepyatra/prep-log/index.ts) (L37-305)
- [apps/api/src/pages/api/v1/quiz/[id]/submit.ts](../../apps/api/src/pages/api/v1/quiz/[id]/submit.ts) (L56-62)
- [apps/api/src/pages/api/v1/prepyatra/onboarding.ts](../../apps/api/src/pages/api/v1/prepyatra/onboarding.ts) (L31-129)
- [apps/api/src/pages/api/v1/techyatra/onboarding.ts](../../apps/api/src/pages/api/v1/techyatra/onboarding.ts) (L20-57)

**Spec**

User-scoped read/write routes take `userId` from the request body/query and act on it with no verification that it matches the authenticated principal. Any user can read or modify any other user's profile, enrollments, progress, playlists, prep logs, and quiz submissions by changing the `userId`. The correct pattern already exists in [apps/api/src/pages/api/v1/payment/create-order.ts](../../apps/api/src/pages/api/v1/payment/create-order.ts) (L80-108), which verifies the bearer JWT and enforces `userId === authenticatedUserId`.

**Acceptance criteria**

- A shared `withAuthenticatedUser` wrapper verifies the JWT signature and exposes `authenticatedUserId` (from `payload.sub`).
- Every user-scoped route derives identity from the token and rejects (403) any mismatch with a client-supplied `userId` — or ignores client `userId` entirely and uses the token subject.
- Applied across all `/user/*`, `/prepyatra/*`, `/techyatra/*`, and `/quiz/*` mutation/read routes handling personal data.

**Remediation todos**

- [ ] Create a shared `withAuthenticatedUser` middleware using `verifyAuthenticatedUser` from `apps/api/src/middleware/admin.ts`.
- [ ] Refactor listed routes to use token identity; return 403 on ownership mismatch.
- [ ] Audit remaining `/user/*` routes for the same pattern and convert them.

**Tests required**

- Integration per route: user A cannot read/modify user B's data (→ 403); user A can act on own data (→ 200); no/invalid token → 401.

---

### SEC-006 Unauthenticated PII enumeration

- [x] **SEC-006 resolved**

- **Severity:** Critical
- **Category:** Sensitive data exposure
- **Repo / App:** TBE-Web · `apps/api`

**Affected files**

- [apps/api/src/pages/api/v1/prepyatra/prep-log/users-for-reminder.ts](../../apps/api/src/pages/api/v1/prepyatra/prep-log/users-for-reminder.ts) (L22-100)
- [apps/api/src/pages/api/v1/user/index.ts](../../apps/api/src/pages/api/v1/user/index.ts) (GET L39-123)
- [apps/api/src/pages/api/v1/devrel/applications/status/[email].ts](../../apps/api/src/pages/api/v1/devrel/applications/status/[email].ts) (L32-59)
- [apps/api/src/lib/database/queries/user.ts](../../apps/api/src/lib/database/queries/user.ts) (L15-23)

**Spec**

`users-for-reminder` returns `_id`, `name`, and `email` for all Prep Yatra users with no authentication — a bulk email harvest. The `user` GET returns the full Mongoose user document (including `contactNo` and internal fields) to unauthenticated callers. The devrel status route returns application status and interview links by email with no auth.

**Acceptance criteria**

- Bulk/reminder endpoints require cron/internal auth (signed job token or admin auth).
- Single-user reads require authentication and return a minimal public-profile DTO, not the full document.
- PII fields (email, phone) are only returned to the owner or an admin.

**Remediation todos**

- [ ] Gate `users-for-reminder.ts` behind a cron/internal token.
- [ ] Add auth to `user` GET and return a public-profile DTO from `getUserByIdFromDB`.
- [ ] Add auth/ownership check to the devrel status route.

**Tests required**

- Integration: unauthenticated call → 401; authorized call returns only allowlisted fields (no `contactNo`/internal fields for non-owner).

---

### SEC-007 vidya-pod: unauthenticated admin API + hardcoded client credentials

- [ ] **SEC-007 resolved**

- **Severity:** Critical
- **Category:** Broken access control / hardcoded credentials
- **Repo / App:** vidya-pod (cross-repo)

**Affected files**

- `vidya-pod/app/api/admin/route.ts` (L4-19)
- `vidya-pod/src/components/admin-page.tsx` (L6-7, L24-31)
- `vidya-pod/src/components/register-page.tsx` (L8-9)

**Spec**

`GET /api/admin` returns all teachers, students, proctors, and sponsor orders (`select("*")`) with no server-side authentication. The only gate is a client-side check against hardcoded credentials `ADMIN_ID = "sachin"` / `ADMIN_PASSWORD = "sachin"` visible in the JS bundle. All registrant PII is effectively public.

**Acceptance criteria**

- `/api/admin` enforces server-side authentication (session/JWT/API key) before returning any data.
- No admin credentials exist in client code.
- Admin auth is validated server-side against a secret from environment variables.

**Remediation todos**

- [ ] Remove `ADMIN_ID`/`ADMIN_PASSWORD` from `admin-page.tsx` and dead copies in `register-page.tsx`.
- [ ] Add a server auth route that verifies credentials from server-only env and issues a signed session cookie.
- [ ] Protect `/api/admin` with that session check; scope the Supabase query to needed columns (not `*`).

**Tests required**

- Integration: unauthenticated `/api/admin` → 401; authenticated → 200 with expected shape.
- Build/grep test: no `sachin` literal in bundle.

---

### SEC-008 vidya-pod: Supabase RLS allows public read/write on sensitive tables

- [ ] **SEC-008 resolved**

- **Severity:** Critical
- **Category:** Database access control (RLS misconfiguration)
- **Repo / App:** vidya-pod (cross-repo)

**Affected files**

- `vidya-pod/supabase-schema.sql` (L48-67)

**Spec**

RLS is enabled but policies allow anonymous `SELECT` on `teachers`, `students`, `proctors`, `sponsor_orders` (`USING (true)`) and anonymous `UPDATE` on `sponsor_orders`. Any holder of the anon key (shipped to the browser) can read all PII and tamper with order status.

**Acceptance criteria**

- No `USING (true)` SELECT policy remains on PII tables.
- Reads happen only through authenticated server routes using the service-role key.
- `sponsor_orders` UPDATE is restricted to a verified server context (webhook secret / service role).
- INSERT policies restrict to validated fields only.

**Remediation todos**

- [ ] Drop public SELECT policies on `teachers`, `students`, `proctors`, `sponsor_orders`.
- [ ] Replace anon-key reads with service-role access inside authenticated admin routes.
- [ ] Restrict `sponsor_orders` UPDATE to server/webhook context.

**Tests required**

- Integration: anon key SELECT on each table → denied; server-role read → allowed.
- Integration: anon UPDATE on `sponsor_orders` → denied.

---

### SEC-009 Outdated Next.js 13.5.6 (auth-bypass CVE) + 95 npm advisories

- [ ] **SEC-009 resolved**

- **Severity:** Critical
- **Category:** Vulnerable dependencies
- **Repo / App:** TBE-Web · `apps/api`, `apps/oncampus` (+ monorepo-wide)

**Affected files**

- [apps/api/package.json](../../apps/api/package.json) (L35 — `next: "^13.2.4"` → 13.5.6)
- [apps/oncampus/package.json](../../apps/oncampus/package.json) (L25 — `next: "13.5.6"`)
- [apps/testing/package.json](../../apps/testing/package.json) (L65 — `vitest: ^2.1.8`, critical dev advisory)

**Spec**

`pnpm audit` reports 95 advisories (2 critical, 38 high). `next@13.5.6` falls inside the "Authorization Bypass in Next.js Middleware" range (`>=13.0.0 <13.5.9`) plus SSRF/cache-poisoning highs. `vitest@2.1.8` has a critical advisory (`<3.2.6`, dev/UI server file read/exec).

**Acceptance criteria**

- `apps/api` and `apps/oncampus` upgraded to a patched Next.js (14.2.x latest or 15.5.16+).
- `vitest` upgraded to ≥ 3.2.6.
- `pnpm audit` shows zero critical advisories; high advisories triaged/documented.

**Remediation todos**

- [ ] Upgrade `apps/api` and `apps/oncampus` off Next 13.5.6 (align on 14.2.x or 15.5.16+).
- [ ] Upgrade `vitest` to ≥ 3.2.6.
- [ ] Re-run `pnpm audit`; document any remaining accepted advisories.

**Tests required**

- Full unit/integration/e2e suite passes post-upgrade (regression).
- CI: add `pnpm audit --audit-level=critical` gate.

---

## High

### SEC-011 JWT access/refresh tokens stored in non-httpOnly, non-Secure cookies

- [ ] **SEC-011 resolved**

- **Severity:** High
- **Category:** Session management / token theft
- **Repo / App:** TBE-Web · `packages/auth`

**Affected files**

- [packages/auth/src/token.ts](../../packages/auth/src/token.ts) (L5-10)

**Spec**

`setTokens` writes access and refresh tokens via `document.cookie` with only `SameSite=Lax` — no `HttpOnly` and no `Secure`. Any XSS can exfiltrate both tokens; the refresh token has a ~30-day lifetime. Contrast with the NextAuth cookies in [apps/api/src/pages/api/auth/[...nextauth].ts](../../apps/api/src/pages/api/auth/[...nextauth].ts) (L38-50) which are correctly `httpOnly` + `secure`.

**Acceptance criteria**

- Tokens are set as `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`) cookies from server-side auth routes.
- Client JS cannot read the raw tokens; session state is read via `/auth/session`.

**Remediation todos**

- [ ] Set tokens from server auth endpoints (`/auth/token`, `/auth/refresh`) with `HttpOnly; Secure; SameSite`.
- [ ] Remove client-side `document.cookie` token writes.
- [ ] Update client to derive session from a server session endpoint.

**Tests required**

- Integration: login response `Set-Cookie` has `HttpOnly` and `Secure` flags.
- E2E: token not accessible via `document.cookie`.

---

### SEC-012 `@tbe/auth` `withAuth` decodes JWT without signature verification

- [x] **SEC-012 resolved**

- **Severity:** High
- **Category:** Broken authentication (token forgery)
- **Repo / App:** TBE-Web · `packages/auth`, `apps/api`

**Affected files**

- [packages/auth/src/middleware/withAuth.ts](../../packages/auth/src/middleware/withAuth.ts) (L29-51, L74-90)
- Used at [apps/api/src/pages/api/v1/interview-prep/core-subjects/index.ts](../../apps/api/src/pages/api/v1/interview-prep/core-subjects/index.ts) (L44)

**Spec**

`withAuth` only base64-decodes the JWT payload and checks `exp`; it does not verify the signature. An attacker can forge any `sub`/`email` and bypass auth on routes using this middleware. `withAdminAuth` in the same file then trusts an unverified `email` against a static allowlist.

**Acceptance criteria**

- API routes verify JWT signatures using `verifyToken` / `verifyAuthenticatedUser` from [apps/api/src/lib/auth/jwt.ts](../../apps/api/src/lib/auth/jwt.ts).
- `withAuth` is removed or renamed (e.g. `withDecodedAuth`) and forbidden on protected API routes.

**Remediation todos**

- [ ] Replace `withAuth` usage on API routes with signature-verifying middleware.
- [ ] Rename/deprecate the decode-only helper and document it as non-authenticating.
- [ ] Grep for other `withAuth`/`withAdminAuth` usages and convert.

**Tests required**

- Unit: forged (unsigned/tampered) token → rejected.
- Integration: route with forged token → 401.

---

### SEC-013 OAuth open-redirect + overly permissive redirect allowlist

- [x] **SEC-013 resolved**

- **Severity:** High
- **Category:** OAuth / open redirect / token leakage
- **Repo / App:** TBE-Web · `apps/api`

**Affected files**

- [apps/api/src/pages/api/v1/auth/callback/google.ts](../../apps/api/src/pages/api/v1/auth/callback/google.ts) (L15-28, L126-130)
- [apps/api/src/pages/api/v1/auth/login.ts](../../apps/api/src/pages/api/v1/auth/login.ts) (L8-28)

**Spec**

`redirectWithError` parses the `state` JWT payload **without verifying its signature** and redirects to `payload.redirect_uri`; the catch block uses attacker-controlled `state` on any failure (open redirect). Separately, `isAllowedRedirect` allows any `*.vercel.app` hostname — an attacker can deploy a Vercel app and receive OAuth codes/tokens for users who complete login.

**Acceptance criteria**

- `state` is only trusted after `verifyToken` succeeds; on failure, redirect to a fixed allowlisted error page.
- `redirect_uri` allowlist is an explicit set (env `ALLOWED_AUTH_ORIGINS`) with no blanket `*.vercel.app` in production.

**Remediation todos**

- [ ] Verify `state` signature before reading `redirect_uri` in the error path.
- [ ] Replace the `.vercel.app` wildcard with an explicit production allowlist.
- [ ] Default error redirects to a fixed, safe URL.

**Tests required**

- Unit: tampered `state` → no redirect to attacker URL.
- Integration: disallowed `redirect_uri` → rejected; allowlisted → accepted.

---

### SEC-014 CORS allow-all fallback (TBE-Web API + FastAPI)

- [x] **SEC-014 resolved**

- **Severity:** High
- **Category:** CORS misconfiguration
- **Repo / App:** TBE-Web · `apps/api`; The-Boring-Agents (cross-repo)

**Affected files**

- [apps/api/src/lib/utils/cors.ts](../../apps/api/src/lib/utils/cors.ts) (L5-11)
- [apps/api/src/middleware.ts](../../apps/api/src/middleware.ts) (L22-27)
- `The-Boring-Agents/src/api/app.py` (L44-51)

**Spec**

When `ALLOWED_ORIGINS` is unset/empty the TBE API reflects any origin (`origin: true` and the edge middleware echoes the request `Origin`). FastAPI uses `allow_origins=["*"]` with `allow_credentials=True`. Both fail open.

**Acceptance criteria**

- Production requires `ALLOWED_ORIGINS`; unknown origins are rejected (fail closed).
- FastAPI uses an explicit allowlist; `allow_credentials` only with explicit origins.

**Remediation todos**

- [ ] Fail closed in `cors.ts` and `middleware.ts` when `ALLOWED_ORIGINS` is missing in production.
- [ ] Set explicit origins in FastAPI CORS and disable `*`.

**Tests required**

- Integration: request from disallowed origin gets no CORS-allow header; allowlisted origin does.

---

### SEC-015 NoSQL operator injection + user-controlled RegExp (ReDoS)

- [x] **SEC-015 resolved**

- **Severity:** High
- **Category:** Injection
- **Repo / App:** TBE-Web · `apps/api`

**Affected files**

- [apps/api/src/pages/api/v1/unskilled/evaluation.ts](../../apps/api/src/pages/api/v1/unskilled/evaluation.ts) (L20-36)
- [apps/api/src/lib/database/queries/unskilled.ts](../../apps/api/src/lib/database/queries/unskilled.ts) (L264-268)
- [apps/api/src/pages/api/v1/unskilled/job.ts](../../apps/api/src/pages/api/v1/unskilled/job.ts) (L139-150)

**Spec**

`experience.min`/`experience.max` from `req.body` are passed straight into MongoDB comparison operators, allowing operator injection (e.g. `{ "$gt": "" }`). `role`/`location` query params are compiled into `new RegExp(value, "i")` without escaping — enabling ReDoS and query manipulation.

**Acceptance criteria**

- Scalar fields are validated as numbers (zod) and rejected if objects/arrays.
- Regex metacharacters are escaped (or exact-match/text-index search used); pattern length capped; `limit` bounded.

**Remediation todos**

- [ ] Add zod schema coercing `experience.min/max` to numbers; reject non-scalars.
- [ ] Escape/limit user regex or switch to a text index in `job.ts`.
- [ ] Cap `limit`/`page` values.

**Tests required**

- Integration: operator-injection payload → 400 (not executed).
- Unit: regex escaping helper; malicious pattern does not hang.

---

### SEC-016 Stored XSS — MDX/HTML rendered without sanitization

- [x] **SEC-016 resolved**

- **Severity:** High
- **Category:** Cross-site scripting (XSS)
- **Repo / App:** TBE-Web · `packages/components`, `apps/resources`, `apps/oncampus`

**Affected files**

- [packages/components/src/common/MDXRenderer/index.tsx](../../packages/components/src/common/MDXRenderer/index.tsx) (L23-28, L355-371, L461)
- [apps/resources/src/components/ResourceArticle.tsx](../../apps/resources/src/components/ResourceArticle.tsx) (L49-54)
- [packages/components/src/containers/Cards/QuestionDetailPanel.tsx](../../packages/components/src/containers/Cards/QuestionDetailPanel.tsx) (L248-250)
- [packages/components/src/containers/Cards/AptitudeQuestionCard.tsx](../../packages/components/src/containers/Cards/AptitudeQuestionCard.tsx) (L104-108)
- [apps/oncampus/src/components/CoreSubjectMDXRenderer.tsx](../../apps/oncampus/src/components/CoreSubjectMDXRenderer.tsx) (L392)

**Spec**

`MarkdownIt` is configured with `html: true` and output is injected via `dangerouslySetInnerHTML` with no sanitization. The custom `link_open` rule emits an unquoted, unvalidated `href` (allowing `javascript:` and attribute breakout). Malicious content in the DB (writable via `SEC-004` endpoints) executes in users' browsers. Related design context: [research-embed-html-image-content.md](../research-embed-html-image-content.md).

**Acceptance criteria**

- All rendered HTML is sanitized with an allowlist (e.g. DOMPurify) before `dangerouslySetInnerHTML`.
- `href` values are quoted, escaped, and allowlisted to `http`/`https`/`mailto`; `javascript:`/`data:` rejected.
- A CSP with `script-src 'self'` is present (see `SEC-019`).

**Remediation todos**

- [ ] Introduce a shared sanitizer and apply it to every `dangerouslySetInnerHTML` render path.
- [ ] Fix the `link_open` rule to quote/escape and allowlist schemes.
- [ ] Consider disabling `html: true` where raw HTML is not required.

**Tests required**

- Unit: sanitizer strips `<script>`, `onerror=`, `javascript:` hrefs.
- Component/e2e: malicious markdown does not execute.

---

### SEC-017 vidya-pod: client-controlled payment amount

- [ ] **SEC-017 resolved**

- **Severity:** High
- **Category:** Broken business logic / price tampering
- **Repo / App:** vidya-pod (cross-repo)

**Affected files**

- `vidya-pod/app/api/sponsor/route.ts` (L8-36)

**Spec**

The sponsor order route reads `amount` from the client body and passes it to the payment provider as `order_amount`. An attacker can set `amount: 1` regardless of the selected `plan`.

**Acceptance criteria**

- Order amount is derived server-side from `plan` using `vidya-pod/src/constants/pricing.ts`; client `amount` is ignored.
- Invalid `plan` values are rejected.

**Remediation todos**

- [ ] Look up amount from server-side pricing by `plan`.
- [ ] Validate `plan` with zod; reject unknown plans.

**Tests required**

- Integration: tampered `amount` ignored; order uses canonical price. Unknown plan → 400.

---

### SEC-018 Unauthenticated destructive delete (YouFocus)

- [x] **SEC-018 resolved**

- **Severity:** High
- **Category:** Broken access control (destructive)
- **Repo / App:** TBE-Web · `apps/api`

**Affected files**

- [apps/api/src/pages/api/v1/youfocus/explore.ts](../../apps/api/src/pages/api/v1/youfocus/explore.ts) (L73-89)

**Spec**

`handleDeletePlaylistBySkill` deletes playlists by a `q` query param with no authentication or ownership check. Any caller can delete content.

**Acceptance criteria**

- The DELETE handler requires admin auth (or owner authorization).
- Errors do not leak internal details.

**Remediation todos**

- [ ] Add `withVerifiedAdminAuth` (or ownership check) to the DELETE path.
- [ ] Validate `q`.

**Tests required**

- Integration: unauthenticated DELETE → 401; authorized → 200.

---

### SEC-019 Missing security headers (no CSP; HSTS only on API edge)

- [x] **SEC-019 resolved**

- **Severity:** High
- **Category:** Security headers / hardening
- **Repo / App:** TBE-Web (all Next apps) + vidya-pod; The-Boring-Agents docs exposure

**Affected files**

- [apps/platform/next.config.js](../../apps/platform/next.config.js) (no `headers()`)
- [apps/platform/vercel.json](../../apps/platform/vercel.json) (L12-22, cache headers only)
- [apps/quizes/vercel.json](../../apps/quizes/vercel.json) (L9-38, partial, no CSP/HSTS)
- [apps/api/src/middleware.ts](../../apps/api/src/middleware.ts) (L10-16, HSTS scoped to `/api/*` only)
- `vidya-pod/next.config.mjs` (empty)
- `The-Boring-Agents/src/api/app.py` (L38-42, L103 — `/docs` exposed in prod)

**Spec**

There is **no Content-Security-Policy anywhere** in TBE-Web or vidya-pod. HSTS is only applied to API routes, not user-facing pages. FastAPI exposes `/docs`, `/redoc`, `/openapi.json` in production with no guard.

**Acceptance criteria**

- All Next apps set CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (shared config).
- FastAPI disables docs endpoints when `ENVIRONMENT=production`.

**Remediation todos**

- [ ] Add a shared security-headers config (via `next.config.js` `headers()` or `vercel.json`) applied to every app.
- [ ] Define and roll out a CSP (start report-only, then enforce).
- [ ] Set `docs_url=None, redoc_url=None, openapi_url=None` in prod for FastAPI.

**Tests required**

- Integration/e2e: response headers include CSP/HSTS/X-Frame-Options on representative routes.
- Pytest: `/docs` returns 404 in production config.

---

### SEC-020 Next 15 apps below patched 15.5.16; vidya-pod on canary

- [x] **SEC-020 resolved**

- **Severity:** High
- **Category:** Vulnerable dependencies
- **Repo / App:** TBE-Web · `apps/prep-yatra`, `apps/resume-yatra`; vidya-pod (cross-repo)

**Affected files**

- [apps/prep-yatra/package.json](../../apps/prep-yatra/package.json) (L67 — `next: 15.5.9`)
- [apps/resume-yatra/package.json](../../apps/resume-yatra/package.json) (L67 — `next: 15.5.9`)
- `vidya-pod/package.json` (L25 — `next: ^15.4.0-canary.0`)

**Spec**

`pnpm audit` flags cache-poisoning/RSC advisories for `next >=13.4.6 <15.5.16`. prep-yatra/resume-yatra pin 15.5.9; vidya-pod resolves to 15.5.15 and pins a canary range in a payments-adjacent app.

**Acceptance criteria**

- All Next 15 apps upgraded to ≥ 15.5.16 stable.
- No canary/pre-release Next in production apps.

**Remediation todos**

- [ ] Bump prep-yatra and resume-yatra to Next 15.5.16+.
- [ ] Pin vidya-pod to a stable Next 15.5.16+.

**Tests required**

- Regression suite passes; `pnpm audit` clears these advisories.

---
