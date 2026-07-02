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
| `packages/constants/src/analyticsEvents.ts`                     | **Single source of truth** — `ANALYTICS_EVENTS` registry   |
| `packages/utils/src/analytics.ts`                               | GA4 init, typed `trackEvent`, delegated listeners, helpers |
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

Defined in `packages/constants/src/analyticsEvents.ts` as `LEGACY_ANALYTICS_ACTIONS` and re-exported via `packages/interface/src/hooks.ts` as `TrackEventProps`. Used by gamification and container components.

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
4. **No MAU/retention/activation dashboards** — added `/api/v1/admin/growth-analytics` + tbe-admin Growth Analytics page at `/content/analytics/growth`
5. **Duplicate pageview** — removed duplicate `gtag('config')` from `Page.tsx` (pageviews handled by `useTracking` / `AnalyticsWrapper`)
6. **Scattered event strings** — centralized in `@tbe/constants` `ANALYTICS_EVENTS` registry; all apps migrated
7. **Per-app gaps** — added `dsa_question_view` (dsayatra), `resume_builder_complete` / `resume_share` (resume-yatra)

## GA4 Admin Console Checklist

One-time setup in the [Google Analytics](https://analytics.google.com) UI for the shared TBE GA4 property.

### A. Register `app_id` as a custom dimension

This lets you segment all reports by product/app. Every TBE app sends `app_id` automatically via `@tbe/utils` (`trackEvent` enrichment).

1. Open **Google Analytics** → select the **TBE GA4 property** (same property as `NEXT_PUBLIC_ANALYTICS_ID`).
2. Click **Admin** (gear, bottom left).
3. In the **Property** column: **Data display** → **Custom definitions**.
4. Click **Create custom dimension**.
5. Fill in:
   - **Dimension name:** `App ID` (display label only)
   - **Scope:** **Event**
   - **Event parameter:** `app_id` (must match exactly — lowercase, underscore)
   - **Description (optional):** TBE product slug (`platform`, `prep-yatra`, `quizes`, etc.)
6. **Save**.

**Verify**

1. **Admin** → **Data display** → **DebugView** (or install the [GA Debugger Chrome extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)).
2. Open any TBE app locally or in staging, click around / sign in.
3. In DebugView, open an event (e.g. `page_view`, `ui_click`) and confirm parameter **`app_id`** is present (e.g. `platform`, `prep-yatra`).

**Notes**

- Custom dimensions usually appear in standard reports within **24–48 hours**. DebugView is immediate.
- In **Explore** → free form, add **App ID** as a breakdown or filter once data is flowing.

### B. Enable User-ID (not a custom dimension)

`user_id` is set server-side in the browser via `setAnalyticsUser()` → `gtag('config', …, { user_id })`. Use GA4’s built-in User-ID feature — do **not** create a separate event-scoped dimension for it.

1. **Admin** → **Property** → **Data collection and modification** → **Data collection**.
2. Turn **User-ID** **ON** and accept the policy.
3. Optional: **Admin** → **Data display** → **Reporting identity** → use **Blended** or **Observed** for signed-in user stitching.

**Verify:** In DebugView, after login, events should show a **User-ID** value (not only `user_id` inside event params).

### C. Mark key events (conversions)

GA4 calls these **Key events** (formerly “conversions”).

1. **Admin** → **Property** → **Data display** → **Events**.
2. After live traffic has fired the events at least once, find:
   - `signup_success` → toggle **Mark as key event**
   - `user_activated` → toggle **Mark as key event**
3. If they are not listed yet, send test traffic (sign up + complete onboarding), refresh the Events list, or use **Key events** → **New key event** and enter the exact event name.

---

## Environment variables (all apps)

### Frontend / client tracking (every app)

Each deployed app needs its **measurement ID** and **product slug**. These send data **into** GA4 via gtag.

| App                                                                                  | Measurement ID env         | `app_id` env                 | Example values                                                        |
| ------------------------------------------------------------------------------------ | -------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| platform, prep-yatra, quizes, dsayatra, oncampus, resume-yatra, techyatra, resources | `NEXT_PUBLIC_ANALYTICS_ID` | `NEXT_PUBLIC_TBE_APP_ID`     | Same `G-XXXXXXXX` for all; slug per app (`platform`, `prep-yatra`, …) |
| onboarding (Vite)                                                                    | `VITE_ANALYTICS_ID`        | `VITE_TBE_APP_ID=onboarding` | Same `G-XXXXXXXX`; `onboarding`                                       |

**Where to set:** Vercel (or host) env for each app. Use the **same** `G-XXXXXXXX` measurement ID on every app so all products land in one GA4 property.

**Find measurement ID:** GA4 → **Admin** → **Property** → **Data collection and modification** → **Data streams** → select your web stream → **Measurement ID** (`G-XXXXXXXX`).

### Server-side reporting (API only — one set for the whole platform)

These power **`GET /api/v1/admin/growth-analytics`** and the **tbe-admin → Growth Analytics** page. They are **not** per-app — set once on `apps/api`.

| Variable                   | Used by    | Purpose                                                                  |
| -------------------------- | ---------- | ------------------------------------------------------------------------ |
| `GA4_PROPERTY_ID`          | `apps/api` | Numeric GA4 property ID for the Data API                                 |
| `GA4_SERVICE_ACCOUNT_JSON` | `apps/api` | Service account key JSON (single-line string) with Analytics read access |

**Where to set**

- Local: `apps/api/.env.local` (see `apps/api/.env.example`)
- Production: Vercel env for the **API** project only

---

## How to get `GA4_PROPERTY_ID`

The property ID is a **number**, not the `G-XXXXXXXX` measurement ID.

1. Open [Google Analytics](https://analytics.google.com) → select the TBE property.
2. **Admin** → **Property settings** (under Property column).
3. Copy **Property ID** (e.g. `123456789`).
4. Set in `apps/api`:

```bash
GA4_PROPERTY_ID=123456789
```

**Alternative:** In the GA4 URL when viewing the property:  
`https://analytics.google.com/analytics/web/#/p123456789/...` → property ID is `123456789`.

---

## How to get `GA4_SERVICE_ACCOUNT_JSON`

Create a Google Cloud service account that can **read** GA4 data via the [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1).

### Step 1 — Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Select the project linked to your GA4 property (or create one).
3. Enable **Google Analytics Data API**: **APIs & Services** → **Library** → search “Google Analytics Data API” → **Enable**.

### Step 2 — Service account + key

1. **IAM & Admin** → **Service Accounts** → **Create service account**.
2. Name e.g. `tbe-ga4-growth-analytics` → **Create and continue** (no extra roles needed on this step).
3. Open the new service account → **Keys** → **Add key** → **Create new key** → **JSON** → download the `.json` file.
4. Store the file securely; **never commit it** to git.

### Step 3 — Grant GA4 property access

1. GA4 → **Admin** → **Property** → **Property access management**.
2. **+** → **Add users**.
3. Enter the service account email (from the JSON, field `client_email`, e.g. `tbe-ga4-growth-analytics@my-project.iam.gserviceaccount.com`).
4. Role: **Viewer** (read-only is enough for growth analytics).
5. **Add**.

### Step 4 — Set env var on `apps/api`

The API parses `GA4_SERVICE_ACCOUNT_JSON` as a JSON string (`ga4Config.ts`).

**Local (`apps/api/.env.local`)** — minify the downloaded key to one line:

```bash
GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"...","universe_domain":"googleapis.com"}'
```

**Vercel / production** — paste the **entire JSON object as one line** into the `GA4_SERVICE_ACCOUNT_JSON` secret (no line breaks in the env value).

**Quick one-liner from the key file (macOS/Linux):**

```bash
jq -c . /path/to/service-account-key.json
```

Copy the output into the env var.

### Step 5 — Verify

1. Restart `apps/api` with both vars set.
2. Call (with admin auth):

```bash
curl -s -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  "http://localhost:3004/api/v1/admin/growth-analytics?type=mau&period=30d"
```

3. Expect `{ "status": true, "data": { "mau": ..., ... } }`.
4. If unset: **503** with message about `GA4_PROPERTY_ID` / `GA4_SERVICE_ACCOUNT_JSON`.
5. Or open **tbe-admin** → **Growth Analytics** and confirm charts load.

---

## Activation Definition (product default)

A user is **activated** when they fire `user_activated` within **7 days** of their first `signup_success` event. The activation dashboard reports cohort signup counts vs activated counts and the overall rate.

**In GA4 (optional ad-hoc check):** **Explore** → **Funnel exploration** → step 1 `signup_success`, step 2 `user_activated`, conversion window **7 days**, breakdown by **App ID**.
