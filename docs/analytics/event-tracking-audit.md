# TBE Event Tracking Audit

> Sprint 40 — Event Tracking Setup in Apps  
> Generated: 2026-07-02

## GA4 Property Topology

**Recommendation: single shared GA4 property** with the `app_id` event parameter (custom dimension) to segment by product.

| App               | Env var for measurement ID | `app_id` slug  |
| ----------------- | -------------------------- | -------------- |
| platform          | `NEXT_PUBLIC_ANALYTICS_ID` | `platform`     |
| prep-yatra        | `NEXT_PUBLIC_ANALYTICS_ID` | `prep-yatra`   |
| quizes            | `NEXT_PUBLIC_ANALYTICS_ID` | `quizes`       |
| dsayatra          | `NEXT_PUBLIC_ANALYTICS_ID` | `dsayatra`     |
| oncampus          | `NEXT_PUBLIC_ANALYTICS_ID` | `oncampus`     |
| resume-yatra      | `NEXT_PUBLIC_ANALYTICS_ID` | `resume-yatra` |
| techyatra         | `NEXT_PUBLIC_ANALYTICS_ID` | `techyatra`    |
| resources         | `NEXT_PUBLIC_ANALYTICS_ID` | `resources`    |
| onboarding (Vite) | `VITE_ANALYTICS_ID`        | `onboarding`   |

All apps use the same `NEXT_PUBLIC_ANALYTICS_ID` value in production (single property). The backend GA4 Data API reads from `GA4_PROPERTY_ID` + service-account credentials.

## Core Library

| File                                                            | Role                                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| `packages/utils/src/analytics.ts`                               | GA4 init, `trackEvent`, delegated listeners, named helpers |
| `packages/hooks/src/useTracking.ts`                             | Init GA + pageviews + `trackEvent` wrapper (Pages Router)  |
| `packages/components/src/common/Analytics/AnalyticsWrapper.tsx` | Init GA + pageviews (App Router)                           |
| `apps/onboarding/src/utils/analytics.ts`                        | Vite-specific GA init                                      |

## Events Dictionary

### Automatic (delegated)

| Event            | Trigger                          | Key params                                            |
| ---------------- | -------------------------------- | ----------------------------------------------------- |
| `page_view`      | Route change / `trackPageview`   | `page_path`                                           |
| `ui_click`       | Delegated click on buttons/links | `element_tag`, `element_id`, `click_label`, `surface` |
| `ui_form_submit` | Delegated form submit            | `form_name`, `surface`                                |

### Auth & lifecycle

| Event                  | Status                                             | Key params              |
| ---------------------- | -------------------------------------------------- | ----------------------- |
| `login_click`          | Wired (`LoginWithGoogleButton`)                    | `category`, `label`     |
| `login_redirect_click` | Wired                                              | —                       |
| `login_success`        | **Was missing — now wired via auth callback**      | `user_id`               |
| `signup_success`       | **Was missing — now wired via auth callback**      | `user_id`               |
| `logout`               | **Was missing — now wired via `useAuthAnalytics`** | `user_id`               |
| `user_activated`       | **Added** — fires on `onboarding_complete`         | `product_id`, `user_id` |

### Onboarding

| Event                 | File                                  |
| --------------------- | ------------------------------------- |
| `onboarding_next`     | `packages/hooks/src/useOnboarding.ts` |
| `onboarding_previous` | `packages/hooks/src/useOnboarding.ts` |
| `onboarding_submit`   | `packages/hooks/src/useOnboarding.ts` |
| `onboarding_complete` | `packages/hooks/src/useOnboarding.ts` |
| `onboarding_error`    | `packages/hooks/src/useOnboarding.ts` |

### Learning & content

| Event                                                                 | File(s)                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `course_view`, `enroll_click`                                         | `packages/utils/src/analytics.ts`                                         |
| `COURSE_CHAPTER_START`                                                | `ChapterLink.tsx`, platform shiksha page                                  |
| `quiz_start`, `quiz_question_answered`, `quiz_complete`, `quiz_score` | `packages/utils/src/analytics.ts`                                         |
| `quiz_session_start`, `quiz_answer_submit`, `quiz_session_complete`   | `packages/utils/src/quiz.ts`                                              |
| `quiz_results_view`                                                   | `apps/quizes/src/pages/results/[id]/index.tsx`                            |
| `prep_log_create/update/delete`                                       | `packages/utils/src/prepLogs.ts`, `packages/services/src/prep-logs.ts`    |
| `challenge_create/update/delete`, `challenge_log_create`              | `packages/utils/src/challenges.ts`, `packages/services/src/challenges.ts` |
| `skill_add`, `skill_remove`                                           | `AddSkillsModal.tsx`                                                      |
| `recruiter_contact_create/update/delete`                              | `packages/services/src/recruiters.ts`                                     |
| `share_resource`, `signup_click`                                      | `apps/resources` components                                               |

### Typed taxonomy (legacy `trackEvent({ action, category, label })`)

Defined in `packages/interface/src/hooks.ts` — `USER_LOGIN`, `COURSE_ENROLL`, `COURSE_CHAPTER_START`, etc. Used by gamification and container components.

## App × GA Init Coverage

| App          | GA init               | Global listeners | Pageviews | `app_id`       |
| ------------ | --------------------- | ---------------- | --------- | -------------- |
| platform     | `useTracking`         | Yes              | Yes       | `platform`     |
| prep-yatra   | `useTracking`         | Yes              | Yes       | `prep-yatra`   |
| dsayatra     | `useTracking`         | Yes              | Yes       | `dsayatra`     |
| oncampus     | `useTracking`         | Yes              | Yes       | `oncampus`     |
| resume-yatra | `useTracking`         | Yes              | Yes       | `resume-yatra` |
| quizes       | `AnalyticsWrapper`    | Yes              | Yes       | `quizes`       |
| techyatra    | `AnalyticsWrapper`    | Yes              | Yes       | `techyatra`    |
| resources    | `AnalyticsWrapper`    | Yes              | Yes       | `resources`    |
| onboarding   | `initGA` in `App.tsx` | Yes              | Yes       | `onboarding`   |

## Gaps Fixed in Sprint 40

1. **No GA4 `user_id`** — added `setAnalyticsUser` / `clearAnalyticsUser`
2. **Login/signup/logout helpers unused** — wired via auth callback + `useAuthAnalytics`
3. **No activation event** — added `user_activated` on onboarding complete
4. **No MAU/retention/activation dashboards** — added `/api/v1/admin/growth-analytics` + tbe-admin Growth Analytics page
5. **Duplicate pageview** — `Page.tsx` still fires gtag config (low priority; documented)

## GA4 Admin Console Checklist

Register these custom dimensions in GA4 (Event scope):

- `app_id` — product slug
- `user_id` — set via gtag config (User-ID feature)

Mark as conversions (optional):

- `signup_success`
- `user_activated`

## Activation Definition (product default)

A user is **activated** when they fire `user_activated` within **7 days** of their first `signup_success` event. The activation dashboard reports cohort signup counts vs activated counts and the overall rate.
