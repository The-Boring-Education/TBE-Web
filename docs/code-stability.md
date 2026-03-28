# TBE-Web code stability backlog

Parallel work tracker: pick an unchecked `[ ]` item, branch, implement, PR, then check the box in your PR description or a follow-up docs PR.

**Conventions:** Link PRs next to items when done. Prefer small, reviewable PRs per section.

---

## How to run tests locally

- Unit + API-style Vitest: `pnpm test:unit`, `pnpm test:api`, `pnpm test:ci` (from repo root; see [package.json](../package.json))
- Integration (in-repo folder): `pnpm --filter @tbe/testing test:integration`
- E2E: `pnpm test:e2e` / `pnpm test:e2e -- --project=<app>` (see [apps/testing/playwright.config.ts](../apps/testing/playwright.config.ts))

---

## 1. Refactoring

- [ ] **Finish splitting** [apps/api/src/lib/interfaces/database.ts](../apps/api/src/lib/interfaces/database.ts) into domain modules (`document-models`, `payloads`, `study-guide`, etc.); update all imports; remove duplication; keep a thin barrel if needed.
- [ ] **Deduplicate Gamification context**: single source in `@tbe/components` (or `@tbe/hooks` if app-agnostic); [apps/quizes](../apps/quizes) imports provider from package; delete or re-export-only local copy.
- [ ] **Reduce `any` in hot paths**: prioritize [apps/api/src/lib/database/queries/prepyatra.ts](../apps/api/src/lib/database/queries/prepyatra.ts), [apps/api/src/pages/api/v1/devrel/dashboard.ts](../apps/api/src/pages/api/v1/devrel/dashboard.ts), [apps/api/src/lib/interfaces/database.ts](../apps/api/src/lib/interfaces/database.ts) / new splits; then [packages/utils/src/functions.ts](../packages/utils/src/functions.ts) and shared hooks.
- [ ] **Standardize env names**: audit `MONGODB_URI` vs `MONGO_URI` usage across apps and [turbo.json](../turbo.json); document canonical names in one place.
- [ ] **API handler pattern**: extract repeated CORS/auth/DB connect blocks (where not already) into shared middleware/helpers in [apps/api/src](../apps/api/src); align with [.cursorrules](../.cursorrules) patterns.
- [ ] **Scripts vs lib**: ensure one-off scripts in [apps/api/scripts](../apps/api/scripts) reuse query layer; avoid divergent business logic.

---

## 2. Code quality

- [ ] **CI naming clarity**: rename or document that "Integration" workflow runs `test:api` (Vitest `src/api`), not `src/integration`; optionally add a job for `test:integration` with Mongo service or document memory-server-only scope.
- [ ] **Extend `test:ci`**: include `pnpm --filter @tbe/testing test:integration` once stable in CI; or split workflows: "API unit", "DB integration".
- [ ] **Vitest config**: remove `as any` on Vite react plugin; replace `tsconfigRaw: "{}"` with a proper tsconfig reference for workspace packages ([apps/testing/vitest.config.ts](../apps/testing/vitest.config.ts)).
- [ ] **ESLint cleanup**: address remaining `eslint-disable` files ([packages/utils/src/initMiddleware.ts](../packages/utils/src/initMiddleware.ts), [packages/components/src/prepyatra/showcase/RecruiterContactsShowcase.tsx](../packages/components/src/prepyatra/showcase/RecruiterContactsShowcase.tsx), etc.) with scoped rules or fixes.
- [ ] **Coverage**: raise thresholds gradually after adding tests; publish `coverage/` or CI summary artifact from Vitest.
- [ ] **TODO/FIXME sweep**: resolve or ticket items in e.g. [packages/components/src/quizes/GamificationCard.tsx](../packages/components/src/quizes/GamificationCard.tsx), [apps/api/src/lib/database/queries/enhancedQuiz.ts](../apps/api/src/lib/database/queries/enhancedQuiz.ts).

---

## 3. Tests — unit

### 3a. Packages

- [ ] **Hooks without tests**: add unit tests for `useStudyGuide`, `useDsaTopicSummaries` / `useDsaQuestionsForTopic`, `useLeaderboard`, `useGamification`, `usePyGamification`, `useAdmin`, `useCertificate`, `useCashfreePayment`, `usePaymentAccess`, `useResumeEvaluation`, `useQuestionStarred`, `useNotifications`, `useDailyPrepEncouragement`, `useUnskilledGraphData`, `useSkillPlaylist`, etc. ([packages/hooks/src](../packages/hooks/src)).
- [ ] **Utils**: extend coverage for [packages/utils/src](../packages/utils/src) beyond existing quiz/onboarding/dsa tests (auth, analytics edge cases).

### 3b. Components

- [ ] **High-traffic UI**: add RTL tests for critical `@tbe/components` containers (e.g. prep/workspace cards, payment flows) prioritizing regressions seen in production.
- [ ] **Quizzes app alignment**: after Gamification dedupe, add tests that assert provider wiring in [apps/quizes](../apps/quizes).

### 3c. API (handler-level unit tests)

- [ ] **Auth routes**: [apps/api/src/pages/api/v1/auth](../apps/api/src/pages/api/v1/auth) — login, token, session, refresh, logout, callbacks.
- [ ] **Admin routes**: dashboard, users, content, coupons, quiz analytics, mentorship — batch by domain.
- [ ] **Projects / webinar / youfocus / unskilled**: greenfield tests per handler group.
- [ ] **Interview prep** sub-routes: study-guide, aptitude, sheet CRUD, company-types, upload — fill gaps beyond [interview-prep-index](../apps/testing/src/unit/api-routes/interview-prep-index.test.ts) / [dsa-sheet](../apps/testing/src/unit/api-routes/dsa-sheet.test.ts).
- [ ] **Shiksha** nested chapter/bulk routes.
- [ ] **Payment**: extend edge-case coverage for webhook idempotency and signature checks ([apps/api/src/pages/api/v1/payment/webhook.ts](../apps/api/src/pages/api/v1/payment/webhook.ts)).

---

## 4. Tests — integration

- [ ] **Wire `src/integration` into CI** (MongoDB service container or consistent memory-server) and document required env vars.
- [ ] **Database query integration**: optional tests that call Mongoose models against `mongodb-memory-server` for critical queries (user enrollment, quiz attempt lifecycle, prep logs).
- [ ] **Migration suite**: expand [content-migrate.integration.test.ts](../apps/testing/src/integration/migration/content-migrate.integration.test.ts) for additional `ENTITY_MAP` entities and failure modes.

---

## 5. Tests — E2E

- [ ] **Expand Playwright matrix in CI** ([.github/workflows/test-e2e.yml](../.github/workflows/test-e2e.yml)): add jobs per app as `src/e2e/<app>/*.spec.ts` appear (prep-yatra, quizes, oncampus, onboarding, etc.).
- [ ] **Smoke flows per app**: login or public landing, one critical user journey (enrollment, quiz start, prep dashboard) — start with highest-traffic apps.
- [ ] **API + E2E contract**: optional tests against running `@tbe/api` for critical mobile/web clients (requires compose or scripted `dev`).

---

## 6. Observability & stability (optional follow-ups)

- [ ] **Flake policy**: document retry limits, timeouts ([playwright.config.ts](../apps/testing/playwright.config.ts)), and Vitest `hookTimeout` for CI.
- [ ] **Sentry/source maps**: verify release mapping for production apps (if applicable).

---

## Appendix — inventory (snapshot)

- API route files (~126): [apps/api/src/pages/api](../apps/api/src/pages/api)
- Vitest unit/api tests: [apps/testing/src/unit](../apps/testing/src/unit), [apps/testing/src/api](../apps/testing/src/api)
- E2E specs: [apps/testing/src/e2e](../apps/testing/src/e2e)
