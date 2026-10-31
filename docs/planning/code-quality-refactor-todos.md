# Code Quality Refactoring TODOs

**Audit date:** 2026-09-27. **Status:** Planning only; this document does not implement any cleanup.

Turn the code-quality audit into small, independently verifiable changes. Prioritize deleting unused code and consolidating proven duplication without changing business behavior. The original purge estimate is approximately **770 source lines**, before documentation and test additions; it is not a measured saving or a guaranteed current total.

## Scope and Evidence

- Treat the `@tbe/*` packages as internal to this repository; the owner confirmed no external-consumer compatibility requirement for this cleanup.
- Include unused demo/example modules when they have no runtime or documentation integration.
- Preserve authentication, payments, enrollment, quiz points, pagination, analytics, accepted props, and request/response contracts.
- Keep public routes, framework entry points, active providers, assets, and dependencies unless their removal is independently verified.
- Require separate approval for broad caller migrations, type consolidation, API extraction, or quality-policy rewrites. Merging this checklist is not approval to execute those changes.
- Do not introduce a new state framework, HTTP client, generic repository factory, or base component just to reduce apparent duplication.

The original findings came from scoped source searches, symbol references, package exports/dependencies, and selected test/configuration reads, not an exhaustive unused-code analyzer or runtime validation. Runtime tests and builds were not run during the audit. Record fresh evidence before each implementation batch.

### Snapshot Changes

Historical file/line links below use the retained [pre-update source snapshot, `cee13545`](https://github.com/The-Boring-Education/TBE-Web/commit/cee1354565c06b16ec626a40a5e061c3f5c80ab7). This documentation branch starts from [development at `2d4bdc2c`](https://github.com/The-Boring-Education/TBE-Web/commit/2d4bdc2caa18e6c2d4d7f55ad111dff3bea79a0a), which contains subsequent changes.

In particular, the old leaderboard hook and card have already been removed. The [current leaderboard hook](../../packages/gamification/src/useLeaderboard.ts) keys by period, limit, and user, and exposes a different return interface. **Do not reapply the historical leaderboard migration or restore the deleted modules.** Verify the current implementation and retire obsolete tasks instead. Other candidates must also be rechecked against the implementation branch.

Related tracker: [code stability backlog](../code-stability.md). Update overlapping entries when work lands instead of maintaining contradictory completion states.

## Phase 0: Baseline

- [ ] **G0.1 - Revalidate candidates.** Check imports, default/named exports, barrels, types, dynamic imports, package exports, scripts, tests, and framework entry points. Record the checked commit and actual callers for each candidate; close obsolete tasks with evidence.
- [ ] **G0.2 - Record executable baselines.** Run focused tests, explicit affected-app typechecks, and non-mutating lint. Record pre-existing failures separately; a failing unrelated baseline does not authorize unrelated fixes.
- [ ] **G0.3 - Define each batch.** List touched files, protected business behavior, expected net LOC, and its verification gate. Preserve existing worktree changes and avoid whole-repository auto-fixes.

**Acceptance:** Each selected task has a current reference check and an executable validation plan. No deletion is justified solely by a filename, deprecation comment, or absence of direct imports.

## Phase 1: Purge Candidates

These were source-supported candidates in the historical snapshot. "No callers" below describes that snapshot, not a guarantee about the current branch. Full-file deletions include only the named files; remove associated exports in the same batch.

| ID  | Historical source                                                                                                                                                                                                                                                                                       | Proposed deletion and evidence                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | [packages/components/src/containers/Cards/LoginCard.tsx:1](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/containers/Cards/LoginCard.tsx#L1)                                                                                     | Entire 82-line file. Only barrel/checklist references were found. Keep `LoginCardNew`, login primitives, and assets.                                                  |
| D2  | [apps/quizes/src/contexts/GamificationContext.tsx:1](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/apps/quizes/src/contexts/GamificationContext.tsx#L1)                                                                                                 | Entire 146-line file. Both exported symbols had definition-only references; the app used the packaged quiz wrapper.                                                   |
| D3  | [packages/components/src/common/GamificationDemo/index.tsx:1](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/common/GamificationDemo/index.tsx#L1)                                                                               | Entire 101-line demo. No consumer beyond the barrel was found. Retire with D4/D5.                                                                                     |
| D4  | [packages/components/src/common/GamificationDemo/GamificationProvider.tsx:1](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/common/GamificationDemo/GamificationProvider.tsx#L1)                                                 | Entire 100-line provider. References stayed inside the demo cluster and barrel. Keep live providers and shared celebration/toast primitives.                          |
| D5  | [packages/components/src/common/GamificationDemo/useGamifiedAction.ts:1](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/common/GamificationDemo/useGamifiedAction.ts#L1)                                                         | Entire 204-line implementation. Only the demo and deprecated barrel alias consumed it. Keep the live gamification-package hook.                                       |
| D6  | [apps/api/src/lib/utils/auth.ts:1](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/apps/api/src/lib/utils/auth.ts#L1)                                                                                                                                     | Entire 71-line API-local NextAuth fallback. References stayed inside the module/barrel. This is not the active JWT guard or the shared auth utility tested elsewhere. |
| D7  | [packages/utils/src/functions.ts:853](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/utils/src/functions.ts#L853)                                                                                                                               | Only `createIntersectionObserver`; declaration-only named references. No replacement needed.                                                                          |
| D8  | [packages/utils/src/functions.ts:870](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/utils/src/functions.ts#L870)                                                                                                                               | Only `preloadResource`; declaration-only named references. No replacement needed.                                                                                     |
| D9  | [packages/utils/src/functions.ts:878](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/utils/src/functions.ts#L878)                                                                                                                               | Only `chunkArray`; declaration-only named references. No replacement needed.                                                                                          |
| D10 | [packages/utils/src/functions.ts:995](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/utils/src/functions.ts#L995)                                                                                                                               | Only `getDifficultyConfig`; declaration-only named references. Keep the separate live `getDifficultyColor`.                                                           |
| D11 | [packages/hooks/src/index.ts:45](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/hooks/src/index.ts#L45) and [46](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/hooks/src/index.ts#L46) | Only the unused `usePDFFile` and `useResumeParser` barrel aliases. Keep the underlying hook, its internal caller, and its tests.                                      |

The estimate comprises 704 lines in six whole files, approximately 54 utility-body lines, and approximately 12 export lines. Recalculate after revalidation; moved code is not a deletion saving.

### Batch A: Utilities and Aliases

Depends on Phase 0.

- [ ] **P1-A1 - Remove D7:** `createIntersectionObserver` only.
- [ ] **P1-A2 - Remove D8:** `preloadResource` only.
- [ ] **P1-A3 - Remove D9:** `chunkArray` only.
- [ ] **P1-A4 - Remove D10:** `getDifficultyConfig` only; preserve `getDifficultyColor`.
- [ ] **P1-A5 - Remove D11:** unused barrel aliases; preserve [usePDFFile](../../packages/hooks/src/usePDFFile.ts) and [useResumeEvaluation](../../packages/hooks/src/useResumeEvaluation.ts).
- [ ] **P1-A6 - Verify:** surviving utility/resume tests, affected consumer compilation, no broken exports, and measured net-negative LOC.

### Batch B: Orphan UI and Demo Cluster

Depends on Phase 0. Serialize edits to the shared components barrel; the demo cluster is one atomic removal, not three independent deletions.

- [ ] **P1-B1 - Remove D1:** old login file and its export; preserve active login routes/components and assets.
- [ ] **P1-B2 - Remove D2:** orphan local quiz context; verify [quiz app wiring](../../apps/quizes/src/pages/_app.tsx) still mounts the packaged `GamificationWrapper`.
- [ ] **P1-B3 - Remove D3-D5:** demo entry, provider, action hook, and deprecated exports together. Keep the live [gamification package](../../packages/gamification/src/index.ts).
- [ ] **P1-B4 - Clean accompanying exports:** remove only the relevant `LoginCard`, `GamificationDemo`, old `GamificationProvider`, old `useGamificationContext`, and old `useGamifiedAction` exports in the [components barrel](../../packages/components/src/index.ts). Historical anchors: [60](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/index.ts#L60), [155](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/index.ts#L155), [249](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/index.ts#L249), [255](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/components/src/index.ts#L255).
- [ ] **P1-B5 - Verify:** login/quiz/provider checks and affected builds; update obsolete entries in the [testing checklist](../../apps/testing/testing.md), not tests for surviving modules.

### Batch C: Orphan API Auth Helper

Depends on Phase 0; can proceed independently of A/B while files do not overlap.

- [ ] **P1-C1 - Remove D6:** API-local fallback and only its `./auth` re-export in the [API utilities barrel](../../apps/api/src/lib/utils/index.ts); historical anchor [2](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/apps/api/src/lib/utils/index.ts#L2).
- [ ] **P1-C2 - Preserve live auth:** keep [shared auth utilities](../../packages/utils/src/auth.ts), [JWT ownership middleware](../../apps/api/src/middleware/userAuth.ts), accepted bearer/cookie flows, and dependencies still used elsewhere. Do not merge credential protocols as part of deletion.
- [ ] **P1-C3 - Verify:** auth utility/route tests and API typecheck/build against the baseline. A shared utility test alone is not proof of API authentication behavior.

## Phase 2: Structural Findings and Golden Paths

| Priority       | Finding                                                                                                                                                                                                                                                                       | Standardized pattern                                                                                                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1, revalidate | The historical leaderboard hook omitted the period from its key. That implementation is now removed. Separately, [useApi](../../packages/hooks/src/useApi.ts) mixes local response state with `fetchQuery` for reads and writes.                                              | Reuse `@tbe/query` in [packages/api](../../packages/api/package.json): query keys include all request-varying inputs; writes use mutations and explicit invalidation. Verify current leaderboard coverage instead of restoring old interfaces. |
| P2             | [Shared lint](../../packages/eslint-config/base.js) downgrades errors, [Next rules](../../packages/eslint-config/next.js) disable `no-explicit-any`, and [CI lint](../../.github/workflows/lint.yml) invokes an auto-fixing command. Typecheck task names differ across apps. | Non-mutating checks, explicit app coverage, and incremental strictness in cleaned scopes. A green aggregate command must actually cover the intended apps.                                                                                     |
| P2             | [Legacy UI props](../../packages/types/src/components.ts) and [component interfaces](../../packages/interface/src/Components.ts) diverge: `ButtonProps.text` is required in one but optional in the other; children, sizing, analytics, and `TextProps.style` also differ.    | Component props in `@tbe/interface`; API/domain DTOs in `@tbe/types`; server-specific Mongoose types remain server-side. Reconcile accepted contracts per symbol before deletion.                                                              |
| P2             | [Admin content management](../../apps/api/src/pages/api/v1/admin/content.ts) owns database aggregation, request dispatch, date interpretation, and HTTP errors.                                                                                                               | Thin authorization-appropriate handlers call focused query modules with typed data/error results. Preserve authorization, aggregation semantics, and response contracts.                                                                       |
| P2             | [useAPIResponseMapper](../../packages/hooks/src/useAPIResponseMapper.ts) mirrors synchronous mapping into state, accepts `any`, omits additional parameters from dependencies, and retains prior results on falsy input.                                                      | Characterize retained-data behavior before using existing pure mappers at the caller. A plain map or `useMemo` is not an automatically equivalent replacement.                                                                                 |

### Compatibility Rules

- Keep transient UI state local, remote data in the query cache, auth in the established auth module, and context for genuine shared UI coordination.
- Preserve existing cache policies during behavior-neutral migrations. New queries follow the documented five-minute `staleTime`; changing existing TTLs is a separately reviewed behavior change.
- Use explicit hook return interfaces and `unknown` plus narrowing at external input/error interfaces, not cosmetic casts or blanket `any` replacements.
- Do not merge the live quiz points/level context with the global celebration/toast context: their interfaces differ.
- Respect dependency direction: [gamification depends on hooks](../../packages/gamification/package.json), and [interface depends on types](../../packages/interface/package.json). Reverse compatibility re-exports would create cycles; migrate internal consumers directly.
- Keep one canonical public name per surviving interface. Avoid broad cosmetic renames, public URL changes, or merging unrelated product-specific UI libraries.

### Batch A: Verify the Current Leaderboard

The original migration is superseded on the publication base. Start from the current hook, not the deleted hook/card.

- [ ] **P2-A1 - Reconcile the historical finding:** inspect [current useLeaderboard](../../packages/gamification/src/useLeaderboard.ts), [query keys](../../packages/api/src/query-keys.ts), and [existing tests](../../apps/testing/src/unit/hooks/useLeaderboard.test.ts). Record that obsolete migration targets are retired; identify only remaining coverage gaps.
- [ ] **P2-A2 - Verify isolation:** reuse the [query test helpers](../../apps/testing/src/test-utils/query-wrapper.tsx) and one `QueryClient` to check period, limit, and user isolation. Reuse or extend existing regressions; add no duplicate tests merely to check this item.
- [ ] **P2-A3 - Verify current contracts:** preserve the current hook's board/entries/viewer/loading/error/refetch interface, request options, enabled behavior, and authenticated behavior. Check UI tab switching and current [leaderboard E2E coverage](../../apps/testing/src/e2e/platform/leaderboard.spec.ts).

### Batch B: Remaining Gamification Duplication

Depends on current-reference checks and any overlapping Phase 1 barrel edits.

- [ ] **P2-B1 - Compare contracts:** inventory consumers of the [legacy useGamification](../../packages/hooks/src/useGamification.ts) and [canonical hook](../../packages/gamification/src/useGamification.ts). Preserve user switching, thresholds, point totals, loading, errors, override-user support, and refetch behavior.
- [ ] **P2-B2 - Migrate live callers:** update only remaining consumers and [existing tests](../../apps/testing/src/unit/hooks/useGamification.test.ts); declare direct package dependencies where needed. Remove the legacy implementation/export only after its consumer inventory is empty. Do not add a reverse re-export through hooks.
- [ ] **P2-B3 - Verify effects:** test point refresh, analytics, celebrations, and failure behavior without changing award or idempotency rules.

### Batch C: Duplicate YouTube Link Helper

Can proceed independently of leaderboard work after Phase 1A while files do not overlap.

- [ ] **P2-C1 - Confirm equivalence:** compare `generateYouTubeSearchLink` in the [API utilities](../../apps/api/src/lib/utils/functions.ts) with the [shared utilities](../../packages/utils/src/functions.ts). Historical anchors: [API:474](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/apps/api/src/lib/utils/functions.ts#L474) and [shared:843](https://github.com/The-Boring-Education/TBE-Web/blob/cee1354565c06b16ec626a40a5e061c3f5c80ab7/packages/utils/src/functions.ts#L843).
- [ ] **P2-C2 - Consolidate:** retain the shared implementation, migrate only that import in [interview-prep queries](../../apps/api/src/lib/database/queries/interview-prep.ts), and remove the API copy/export. Reuse the existing `@tbe/utils` dependency.
- [ ] **P2-C3 - Verify:** extend [existing utility tests](../../apps/testing/src/unit/utils/functions.test.ts) for blank/whitespace input, trimming, reserved characters, and non-ASCII encoding. Preserve the suffix ` leetcode solution` and existing DSA helper behavior.

## Phase 3: Broader Refactors

- [ ] **P3-GATE - Obtain approval:** agree on a bounded caller/type/API/quality-policy batch before multi-file rewrites. The following tasks are not part of the documentation PR.

### Server State and Derived Data

- [ ] **P3-A1 - Inventory useApi callers:** after the purge, start with [useNotifications](../../packages/hooks/src/useNotifications.ts) reads and [useUsername](../../packages/hooks/src/useUsername.ts) input/race behavior. Use existing services, transports, and query keys.
- [ ] **P3-A2 - Migrate writes:** handle [useFeedback](../../packages/hooks/src/useFeedback.tsx), [useQuestionStarred](../../packages/hooks/src/useQuestionStarred.ts), and remaining action hooks with mutations and explicit invalidation. Preserve loading/error contracts and one-action-per-user-gesture behavior; `fetchQuery` can coalesce work that mutations would otherwise duplicate.
- [ ] **P3-A3 - Verify and retire:** cover disabled queries, user/input changes, concurrent submissions, analytics, and network failures. Delete `useApi` only when no callers remain and replacement tests protect its contracts.
- [ ] **P3-A4 - Characterize the mapper:** extend [useAPIResponseMapper tests](../../apps/testing/src/unit/hooks/useAPIResponseMapper.test.ts) for falsy transitions and changed additional parameters. Review [dashboard](../../apps/platform/src/pages/user/dashboard.tsx) and [project explore](../../apps/platform/src/pages/projects/explore.tsx) callers. Move any required retain-previous-data policy into the owning query/presentation interface before removing the wrapper; retain it if a safe simplification is not justified.

### Type and Query Ownership

- [ ] **P3-B1 - Reconcile props per family:** start with `ButtonProps`/`LinkButtonProps`, preserve accepted fields and analytics behavior, migrate UI consumers to `@tbe/interface`, compile affected consumers, then remove superseded declarations. Do not delete the entire legacy props file or add a dependency cycle.
- [ ] **P3-B2 - Characterize one admin query:** start with `getContentPerformance` in [admin content management](../../apps/api/src/pages/api/v1/admin/content.ts). Cover supported content types, date defaults, empty data, numeric aggregates, serialization, authorization, and failure responses.
- [ ] **P3-B3 - Extract and verify:** reuse a suitable query module, or add a focused admin-content query module if no existing owner fits. Queries must not own a Next response object. Reuse test fixtures and add a focused handler/query suite only where no suitable suite exists. Preserve existing admin authorization; expand to other actions only after this operation passes.

These changes primarily improve locality and testability. Moving lines between files is not a net deletion. Parallelize type and query work only when DTOs/barrels do not overlap.

### Quality Gates

- [ ] **P3-C1 - Make lint non-mutating:** change the CI gate from `pnpm lint` to `pnpm lint:check`. Ratchet strict rules and zero-warning checks by cleaned scope; remove `onlyWarn` only when the applicable baseline is ready. Do not auto-fix unrelated files to make a global gate green.
- [ ] **P3-C2 - Standardize typechecks:** align real app tasks on `check-types`, accounting for platform's `typecheck`, admin/onboarding's `type-check`, and apps lacking a script. Verify every intended app runs; do not add meaningless checks to folders without a TypeScript configuration.
- [ ] **P3-C3 - Correct test selection:** [Vitest configuration](../../apps/testing/vitest.config.ts) includes integration tests in the unfiltered `test:unit` command. Reconcile the stability backlog with actual CI selection. Remove duplicated API execution from [test:ci](../../apps/testing/package.json) only after confirming the selected-test inventory and coverage are unchanged.
- [ ] **P3-C4 - Approve exhaustive analysis separately:** configure an entry-point-aware unused-code analyzer for Next Pages/App Router, Vite, scripts, tests, exports, and dynamic roots before claiming a complete purge. Do not infer unused assets or dependencies from this document alone.

## Verification Reference

These commands are future implementation gates, **not results from this documentation PR**. Run from the repository root with existing test fixtures/local configuration. Never use production credentials, real payment actions, or deployment/migration commands for verification. Recheck script names and test paths as the branch evolves.

| Batch                | Focused command or check                                                                                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1-A                 | `pnpm --filter @tbe/testing test:unit src/unit/utils/functions.test.ts src/unit/hooks/usePDFFile.test.ts src/unit/hooks/useResumeEvaluation.test.ts`                                                                                                                       |
| P1-B                 | `pnpm --filter @tbe/testing test:unit src/unit/components/common/LoginWithGoogleButton.test.tsx src/unit/components/common/LoginRedirectButton.test.tsx src/unit/components/common/UserPointButton.test.tsx`; confirm packaged quiz provider wiring and live login routes. |
| P1-C                 | `pnpm --filter @tbe/testing test:unit src/unit/utils/auth.test.ts src/unit/api-routes/auth-session.test.ts src/unit/api-routes/auth-login.test.ts src/unit/api-routes/auth-token.test.ts src/unit/api-routes/auth-refresh.test.ts src/unit/api-routes/auth-logout.test.ts` |
| P2-A/B               | `pnpm --filter @tbe/testing test:unit src/unit/hooks/useLeaderboard.test.ts src/unit/hooks/useGamification.test.ts`; test the current hook interfaces with real query-cache isolation.                                                                                     |
| P2-C                 | `pnpm --filter @tbe/testing test:unit src/unit/utils/functions.test.ts src/unit/utils/dsaHelpers.test.ts src/unit/utils/dsaRoadmapAccessSummaries.regression.test.ts`; a mocked helper is not an encoding test.                                                            |
| Platform compilation | `pnpm --filter @tbe/platform typecheck`                                                                                                                                                                                                                                    |
| API compilation      | `pnpm --filter @tbe/api exec tsc --noEmit --incremental false -p tsconfig.json`                                                                                                                                                                                            |
| Quizzes compilation  | `pnpm --filter @tbe/quizes exec tsc --noEmit --incremental false -p tsconfig.json`                                                                                                                                                                                         |
| Build gates          | `pnpm build:api`, `pnpm build:platform`, `pnpm build:quizes`; expand to other affected consumers or the existing build matrix for shared changes.                                                                                                                          |
| Broader acceptance   | `pnpm --filter @tbe/testing test:unit` and `pnpm lint:check`, compared with the baseline. The former currently includes non-E2E integration suites.                                                                                                                        |
| Platform smoke       | `pnpm --filter @tbe/testing exec playwright test src/e2e/platform/smoke.spec.ts --project=platform`                                                                                                                                                                        |
| Quiz smoke           | `pnpm --filter @tbe/testing exec playwright test src/e2e/quizes/smoke.spec.ts --project=quizes`                                                                                                                                                                            |

Use existing [query test helpers](../../apps/testing/src/test-utils/query-wrapper.tsx), MSW handlers, and Mongo memory-server fixtures. Add behavior-specific tests where required rather than treating the commands above as complete coverage for every possible refactor. Browser checks should verify redirects, quiz points/provider wiring, and leaderboard transitions without arbitrary sleeps. Protect paid DSA page-two pagination if any broader query change reaches it.

## Definition of Done

- [ ] **DONE.1 - Preserve behavior:** required tests and affected compilation/build/smoke gates pass relative to the recorded baseline; explicitly report unavailable or blocked checks.
- [ ] **DONE.2 - Prove the removal:** no live references or new dependency cycles remain; migrated interfaces retain required behavior. Close superseded tasks with current evidence instead of repeating completed work.
- [ ] **DONE.3 - Report actual scope:** inspect the diff and record deleted/added/moved LOC separately. Pure deletion batches should be net-negative; justify tests or structural work that is not.
- [ ] **DONE.4 - Keep changes reviewable:** no unrelated files or user changes are included; broad rewrites have explicit approval and each batch has a rollback-sized diff.
- [ ] **DONE.5 - Update the tracker:** check tasks only when their implementation/verification is complete, link the corresponding PR, and reconcile the overlapping stability/testing backlog.
