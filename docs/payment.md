# Payments guardrails (TBE Web)

This document describes how money moves through the platform, how products plug in, and what we enforce for security.

## Current stack

- **Gateway:** Cashfree (orders + payment session + webhooks).
- **API:** `apps/api` — `POST /api/v1/payment/create-order`, `GET /api/v1/payment/checkstatus`, `POST /api/v1/payment/webhook`, plus **quote** and **order status** routes documented below.
- **Client:** Cashfree JS SDK via `useCashfreePayment` (`packages/hooks`), shared UI via `PaymentCard` (`packages/components`), and a **single frictionless checkout** on Platform (`apps/platform/src/pages/checkout.tsx`).

## Product lines (how to map them)

| Product | `productType` | What `productId` means | Pricing source |
|--------|----------------|-------------------------|----------------|
| Interview Prep (per sheet) | `INTERVIEW_SHEET` | Mongo `_id` of the sheet | Sheet `price` in DB + optional sheet discount + coupon |
| Shiksha course | `SHIKSHA` | Course `_id` | Course `price` in DB + coupon |
| DSA Yatra (lifetime) | `DSA_YATRA` | Plan key: `lifetime` | `SUBSCRIPTION_PLAN_PRICES.DSA_YATRA` in API |
| On Campus (duration) | `ONCAMPUS` | Plan key: `1months`, `3months`, `6months`, `12months` | `SUBSCRIPTION_PLAN_PRICES.ONCAMPUS` |
| PrepYatra | `PREPYATRA` | Same plan keys as today (`1months`, `3months`, `6months`, `12months`, `lifetime`) | `SUBSCRIPTION_PLAN_PRICES.PREPYATRA` |

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
- Subscriptions: load from `subscriptionPlanCatalog.ts` (`SUBSCRIPTION_PLAN_PRICES`).
- Coupons: validated with `validateCouponForProductFromDB`; discount applied on the server.

Tuning prices for subscriptions is done in **`apps/api/src/lib/services/payment/subscriptionPlanCatalog.ts`** (keep marketing pages and coupons aligned).

## Post-payment access

- Webhook: `apps/api/src/pages/api/v1/payment/webhook.ts` (signature verification + idempotency patterns as implemented).
- Enrollment: `processPostPaymentEnrollment` → `enrollmentHandlers` (sheet enroll, course enroll, subscription create) keyed by `PRODUCT_REGISTRY` in `apps/api/src/lib/constants/products.ts`.
- Subscription plan keys map through `planTypeMap` in `apps/api/src/lib/constants/api.ts` (includes `12months` for 1-year SKUs).

## New API helpers

| Route | Purpose |
|-------|---------|
| `GET/POST /api/v1/payment/quote` | Price quote for checkout and shareable links |
| `GET /api/v1/payment/order-status?orderId=&userId=` | Resolve payment row after redirect (requires matching `userId`) |

## Operational checklist

1. Update **`SUBSCRIPTION_PLAN_PRICES`** when list prices change.
2. Configure **coupons** in admin; scope with `applicableProducts` (use sheet/course ids or plan keys like `3months` for subscriptions).
3. Keep **Cashfree** credentials and webhook secret only on the server.
4. **Return URL** for hosted flows is `PLATFORM_URL/payment/status?order_id=…` (see `buildOrderPayload` in API utils).

## Future hardening (recommended)

- Bind **order-status** and **checkstatus** to authenticated session instead of trusting `userId` query params.
- Extend **PROJECTS** / **WEBINAR** pricing in DB or catalog when those SKUs go live.
- Add automated tests around `resolveAuthoritativeOrderAmount` and quote/create-order for each `productType`.
