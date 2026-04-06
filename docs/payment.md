# Payments guardrails (TBE Web)

This document describes how money moves through the platform, how products plug in, and what we enforce for security.

## Current stack

- **Gateway:** Cashfree (orders + payment session + webhooks).
- **API:** `apps/api` — `POST /api/v1/payment/create-order`, `GET /api/v1/payment/checkstatus`, `POST /api/v1/payment/webhook`, plus **quote** and **order status** routes documented below.
- **Client:** Cashfree JS SDK via `useCashfreePayment` (`packages/hooks`), shared UI via `PaymentCard` (`packages/components`), and a **single frictionless checkout** on Platform (`apps/platform/src/pages/checkout.tsx`).

## Subscription pricing (OSS-safe)

**Subscription list prices are not stored in source code.** They live in MongoDB in the **`SubscriptionPlan`** collection (`productType` + `planKey` + `amountInr`). This avoids accidental price commits in open-source PRs.

| Mechanism | Purpose |
|-----------|---------|
| **Admin HTTP API** | `GET/POST /api/v1/admin/subscription-plans` — requires header **`x-admin-secret: <ADMIN_SECRET>`** (same env as other admin routes). `POST` body: `{ "plans": [{ "productType", "planKey", "amountInr", "isActive?" }] }`. |
| **Seed script** | From `apps/api`: `pnpm seed:subscription-plans` — reads **gitignored** `scripts/subscription-plans.local.json` and POSTs to the admin API. Copy from `scripts/subscription-plans.example.json` and fill INR amounts. |
| **Runtime resolution** | `getSubscriptionPlanPriceFromDB` in `apps/api/src/lib/database/queries/subscription-plan.ts` |

## Product lines (how to map them)

| Product | `productType` | What `productId` means | Pricing source |
|--------|----------------|-------------------------|----------------|
| Interview Prep (per sheet) | `INTERVIEW_SHEET` | Mongo `_id` of the sheet | Sheet `price` in DB + optional sheet discount + coupon |
| Shiksha course | `SHIKSHA` | Course `_id` | Course `price` in DB + coupon |
| DSA Yatra (lifetime) | `DSA_YATRA` | Plan key: `lifetime` | **`SubscriptionPlan`** row (`DSA_YATRA` + `lifetime`) |
| On Campus (duration) | `ONCAMPUS` | `1months`, `3months`, `6months`, `12months` | **`SubscriptionPlan`** rows per key |
| PrepYatra | `PREPYATRA` | `1months`, `3months`, `6months`, `12months`, `lifetime` | **`SubscriptionPlan`** rows per key |

**Interview Prep “combined sheets” (e.g. React + Node):** model these as separate purchasable SKUs in admin (bundles) or keep one sheet per bundle. The payment system keys access by `(productType, productId)`; a bundle is just another `INTERVIEW_SHEET` document (or a future `productType` once defined in `PRODUCT_TYPE` and `PRODUCT_REGISTRY`).

## Single checkout URL (shareable)

Use `buildCheckoutUrl` from `@tbe/constants` or construct manually:

```text
/checkout?productType=ONCAMPUS&productId=3months&coupon=CAMPUS2026
```

- **Anyone can open the link.** Each user must **sign in** to pay (payment is always tied to the logged-in user).
- Optional `next` (relative path) redirects after success, e.g. `&next=/interview-prep/explore`.

Server-side **quotes** (no payment):

- `GET /api/v1/payment/quote?productType=…&productId=…&coupon=…&userId=…`  
  Returns `baseAmount`, `finalAmount`, and optional coupon metadata. Used by the checkout page to show the exact INR total.

## Server-side amount resolution (security)

**We do not trust the browser for price.** `POST /payment/create-order` resolves the payable amount with `resolveAuthoritativeOrderAmount` (`apps/api/src/lib/services/payment/resolveOrderAmount.ts`):

- One-time products: load price from Mongo (sheet / course).
- Subscriptions: load **`amountInr`** from **`SubscriptionPlan`** for `(productType, planKey)` where `planKey` matches `productId` (e.g. `lifetime`, `3months`).
- Coupons: validated with `validateCouponForProductFromDB`; discount applied on the server.

If no active plan row exists, quote/create-order returns a clear “pricing not configured” style error — **seed plans before going live.**

## Post-payment access

- Webhook: `apps/api/src/pages/api/v1/payment/webhook.ts` (signature verification + idempotency patterns as implemented).
- Enrollment: `processPostPaymentEnrollment` → `enrollmentHandlers` (sheet enroll, course enroll, subscription create) keyed by `PRODUCT_REGISTRY` in `apps/api/src/lib/constants/products.ts`.
- Subscription plan keys map through `planTypeMap` in `apps/api/src/lib/constants/api.ts` (includes `12months` for 1-year SKUs).

## API reference (payment + admin)

| Route | Auth | Purpose |
|-------|------|---------|
| `GET/POST /api/v1/payment/quote` | Public | Price quote |
| `GET /api/v1/payment/order-status?orderId=&userId=` | Query user must match payment owner | Payment row lookup |
| `GET /api/v1/admin/subscription-plans` | **`x-admin-secret`** | List all plan rows |
| `POST /api/v1/admin/subscription-plans` | **`x-admin-secret`** | Upsert plan rows |

## Operational checklist

1. **Production / staging:** upsert **`SubscriptionPlan`** via admin API or infra automation (never commit real amounts to git).
2. **Local dev:** copy `apps/api/scripts/subscription-plans.example.json` → `subscription-plans.local.json` (gitignored), set amounts, run API, then `pnpm seed:subscription-plans` with `ADMIN_SECRET` set.
3. Configure **coupons** in admin; scope with `applicableProducts` (sheet/course ids or plan keys like `3months`).
4. Keep **Cashfree** credentials and webhook secret only on the server.
5. **Return URL** for hosted flows is `PLATFORM_URL/payment/status?order_id=…` (see `buildOrderPayload` in API utils).

## Future hardening (recommended)

- Bind **order-status** and **checkstatus** to authenticated session instead of trusting `userId` query params.
- Extend **PROJECTS** / **WEBINAR** pricing in DB or catalog when those SKUs go live.
- Add automated tests around `resolveAuthoritativeOrderAmount`, admin subscription-plans, and quote/create-order for each `productType`.
