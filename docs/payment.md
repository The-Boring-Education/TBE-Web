# Payments guardrails (TBE Web)

This document describes how money moves through the platform, how products plug in, what we enforce for security, and **how to configure subscription plans and manually verify** that payment and coupon APIs behave correctly.

## Current stack

- **Gateway:** Cashfree (orders + payment session + webhooks).
- **API:** `apps/api` — `POST /api/v1/payment/create-order`, `GET /api/v1/payment/checkstatus`, `GET /api/v1/payment/order-status`, `GET|POST /api/v1/payment/quote`, `POST /api/v1/payment/webhook`.
- **Client:** Cashfree JS SDK via `useCashfreePayment` (`packages/hooks`), shared UI via `PaymentCard` (`packages/components`), and checkout on Platform (`apps/platform/src/pages/checkout.tsx`).

---

## 1. How to set up payment plans for a product

Pricing is resolved **on the server** in `resolveAuthoritativeOrderAmount` (`apps/api/src/lib/services/payment/resolveOrderAmount.ts`). The path depends on the product line.

### A. One-time products (price on the document)

| Product                | `productType`     | Where price lives                  | `productId` in checkout |
| ---------------------- | ----------------- | ---------------------------------- | ----------------------- |
| Interview Prep (sheet) | `INTERVIEW_SHEET` | Sheet document `price` in MongoDB  | Sheet `_id`             |
| Shiksha course         | `SHIKSHA`         | Course document `price` in MongoDB | Course `_id`            |

**Steps:** Ensure the sheet or course exists, `price` is a positive number, and the item is in a state your app expects for purchase. No `SubscriptionPlan` row is used.

### B. Subscription SKUs (price in `SubscriptionPlan`)

These use the **`SubscriptionPlan`** collection: one document per `(productType, planKey)` with **`amountInr`** (INR). `planKey` is stored **normalized to lowercase** in the DB (`getSubscriptionPlanPriceFromDB`).

| Product   | `productType` | Typical `productId` (= plan key)                        |
| --------- | ------------- | ------------------------------------------------------- |
| DSA Yatra | `DSA_YATRA`   | `lifetime`                                              |
| On Campus | `ONCAMPUS`    | `1months`, `3months`, `6months`, `12months`             |
| PrepYatra | `PREPYATRA`   | `1months`, `3months`, `6months`, `12months`, `lifetime` |

**Ways to upsert plans (pick one):**

1. **Admin HTTP API (recommended for staging/production)**
   - `GET /api/v1/admin/subscription-plans` — list all rows.
   - `POST /api/v1/admin/subscription-plans` — body: `{ "plans": [{ "productType", "planKey", "amountInr", "isActive?" }] }`.
   - Header on every admin call: **`x-admin-secret: <ADMIN_SECRET>`** (same as other admin routes; `ADMIN_SECRET` must be set on the API).

2. **Local seed script**
   - From `apps/api`: copy `scripts/subscription-plans.example.json` → **`scripts/subscription-plans.local.json`** (gitignored).
   - Set real **`amountInr`** values per SKU.
   - With the API running and `ADMIN_SECRET` in env: `pnpm seed:subscription-plans`.
   - The script POSTs to `SEED_API_URL` or `API_URL` or `NEXT_PUBLIC_API_URL`, defaulting to **`http://localhost:3004/api/v1`** if unset.

**Important:** List prices are intentionally **not** committed to git (OSS-safe). If a plan row is missing or inactive, quote/create-order returns an error like _plan pricing not configured_ — upsert plans before testing paid checkout for subscription products.

### C. Coupons and “which product” they apply to

- Coupons are validated with `validateCouponForProductFromDB` (`apps/api/src/lib/database/queries/coupon.ts`).
- **`applicableProducts`:** if the array is **empty**, the coupon applies to any product (subject to min amount, expiry, usage). If **non-empty**, it must include the same **`productId`** string you pass to quote/checkout (for subscriptions, that is usually the **plan key**, e.g. `3months`, not the Mongo `_id` of a course).

---

## 2. How to test that everything works (manual verification)

Use this as a **smoke checklist** without relying on automated tests. Replace `API` with your API base (e.g. `http://localhost:3004/api/v1`).

### Prerequisites

- MongoDB reachable; **`ADMIN_SECRET`** set on the API.
- For **quote-only** checks: DB + API are enough.
- For **create-order** and browser checkout: **`CASHFREE_CLIENT_ID`**, **`CASHFREE_SECRET_KEY`**, **`CASHFREE_BASE_URL`** (sandbox or production per Cashfree docs), and **`NEXT_PUBLIC_PLATFORM_URL`** (used in `buildOrderPayload` return URL).
- Webhook end-to-end: Cashfree must reach **`POST /api/v1/payment/webhook`** (public URL in staging or tunnel in local dev).

### Step 1 — Subscription plans are present

```bash
curl -sS -H "x-admin-secret: $ADMIN_SECRET" "$API/admin/subscription-plans"
```

Expect `200` and a list of `{ productType, planKey, amountInr, isActive, ... }` for every SKU you sell.

### Step 2 — Quote returns the same totals the server would charge

Subscription example (no coupon):

```bash
curl -sS "$API/payment/quote?productType=ONCAMPUS&productId=3months"
```

With coupon (optional):

```bash
curl -sS "$API/payment/quote?productType=ONCAMPUS&productId=3months&coupon=YOURCODE&userId=USER_MONGO_ID"
```

Expect `status: true` and `data` with **`baseAmount`**, **`finalAmount`**, and when a coupon applies, **`couponCode`** / **`appliedCoupon`**.

Interview sheet / course: use real IDs:

```bash
curl -sS "$API/payment/quote?productType=INTERVIEW_SHEET&productId=SHEET_OBJECT_ID"
```

If you get `400` with _plan pricing not configured_, fix `SubscriptionPlan` for that `productType` + `productId` (plan key). If _Interview sheet not found_ / _Course not found_, the ID or type is wrong.

### Step 3 — Coupon validate API

```bash
curl -sS -X POST "$API/coupon/validate" \
  -H "Content-Type: application/json" \
  -d '{"code":"YOURCODE","productId":"3months","productType":"ONCAMPUS","userId":"USER_MONGO_ID"}'
```

Expect `200` with `status: true` and coupon metadata when the code is valid for that product; `400` when not applicable, expired, or exhausted.

### Step 4 — Create order (Cashfree)

`POST /api/v1/payment/create-order` with JSON body:

- `userId`, `productId`, `productType`, `customerName`, `customerEmail`
- optional `couponCode`

```bash
curl -sS -X POST "$API/payment/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"USER_MONGO_ID",
    "productId":"3months",
    "productType":"ONCAMPUS",
    "customerName":"Test User",
    "customerEmail":"test@example.com"
  }'
```

Expect `200`, **`orderId`**, **`paymentLink`**, **`paymentSessionId`**. Open `paymentLink`, complete payment in Cashfree test mode if applicable.

### Step 5 — After payment: order status and access

By order id (requires the owning user):

```bash
curl -sS "$API/payment/order-status?orderId=ORDER_ID&userId=USER_MONGO_ID"
```

Purchase flag for a product (optional `productType` for tighter matching):

```bash
curl -sS "$API/payment/checkstatus?userId=USER_MONGO_ID&productId=3months&productType=ONCAMPUS"
```

Expect **`purchased: true`** (or equivalent in `sendAPIResponse` shape) after webhook marks the payment successful and enrollment runs.

### Step 6 — Webhook

Success path: Cashfree sends **`POST /api/v1/payment/webhook`**; the handler updates payment status and calls **`processPostPaymentEnrollment`** for the product type (`PRODUCT_REGISTRY` in `apps/api/src/lib/constants/products.ts`). If enrollment fails, check API logs even when Cashfree shows paid.

### Single checkout URL (shareable)

Use `buildCheckoutUrl` from `@tbe/constants` or:

```text
/checkout?productType=ONCAMPUS&productId=3months&coupon=CAMPUS2026
```

Anyone can open the link; the user must **sign in** before paying. Optional `next` redirects after success.

---

## 3. API reference — payment + coupons + admin plans

| Route                                                  | Auth                                                 | Purpose                                                   |
| ------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------- |
| `GET` or `POST` `/api/v1/payment/quote`                | Public                                               | Server-side price quote (`baseAmount`, `finalAmount`)     |
| `POST` `/api/v1/payment/create-order`                  | Public body                                          | Creates Cashfree order + DB payment row                   |
| `GET` `/api/v1/payment/checkstatus`                    | Query: `userId`, `productId`; optional `productType` | Whether user purchased that SKU                           |
| `GET` `/api/v1/payment/order-status`                   | Query: `orderId`, `userId`                           | Payment row by order id (owner must match)                |
| `POST` `/api/v1/payment/webhook`                       | Cashfree signature                                   | Updates status + enrollment                               |
| `POST` `/api/v1/coupon/validate`                       | Public JSON body                                     | Validates coupon for `code` + `productId` + `productType` |
| `GET`/`POST` `/api/v1/admin/coupon`                    | **`x-admin-secret`**                                 | List / create coupons                                     |
| `GET`/`PUT`/`DELETE` `/api/v1/admin/coupon/[couponId]` | **`x-admin-secret`**                                 | Read / update / delete coupon                             |
| `GET`/`POST` `/api/v1/admin/subscription-plans`        | **`x-admin-secret`**                                 | List / upsert subscription plan prices                    |

**Coupon admin:** `POST` body requires `code`, `description`, `discountPercentage` (1–100), `expiryDate` (future), and accepts `maxUsage`, `minimumAmount`, `applicableProducts`, `isActive`. Optional header **`x-admin-user-id`** sets `createdBy`; otherwise a placeholder id is used — see `apps/api/src/pages/api/v1/admin/coupon/index.ts`.

---

## 4. Product lines (quick map)

| Product                    | `productType`     | What `productId` means     | Pricing source                  |
| -------------------------- | ----------------- | -------------------------- | ------------------------------- |
| Interview Prep (per sheet) | `INTERVIEW_SHEET` | Mongo `_id` of the sheet   | Sheet `price` + optional coupon |
| Shiksha course             | `SHIKSHA`         | Course `_id`               | Course `price` + coupon         |
| DSA Yatra (lifetime)       | `DSA_YATRA`       | `lifetime`                 | **`SubscriptionPlan`**          |
| On Campus                  | `ONCAMPUS`        | `1months` … `12months`     | **`SubscriptionPlan`** per key  |
| PrepYatra                  | `PREPYATRA`       | duration keys + `lifetime` | **`SubscriptionPlan`** per key  |

**Interview Prep bundles:** model as separate purchasable items; access is keyed by `(productType, productId)`.

---

## 5. Security notes

- **Amounts are never taken from the client for charging** — `create-order` uses `resolveAuthoritativeOrderAmount` only.
- **Order-status** requires `userId` matching the payment owner to limit order-id probing.
- **Admin routes** require `x-admin-secret` and will fail fast if `ADMIN_SECRET` is missing server-side.
- Keep **Cashfree** credentials and webhook verification secret only on the server.
- **Return URL** for hosted checkout: `PLATFORM_URL/payment/status?order_id=…` (see `buildOrderPayload` in API utils).

---

## 6. Operational checklist

1. **Production / staging:** upsert **`SubscriptionPlan`** via admin API or automation (never commit real INR to git).
2. **Local dev:** `subscription-plans.local.json` + `pnpm seed:subscription-plans` with `ADMIN_SECRET` set.
3. Configure **coupons** in admin; scope with **`applicableProducts`** (sheet/course ids or plan keys like `3months`).
4. Configure **Cashfree** env vars and webhook URL for the deployed API.
5. After deploy, run the **manual verification** steps in section 2 for one SKU per product line you care about.

---

## 7. Future hardening (recommended)

- Bind **order-status** and **checkstatus** to authenticated session instead of trusting `userId` query params where feasible.
- Extend **PROJECTS** / **WEBINAR** catalog pricing in DB when those SKUs go live (see `resolveAuthoritativeOrderAmount` and `PRODUCT_REGISTRY`).
- Add automated coverage around `resolveAuthoritativeOrderAmount`, admin subscription-plans, and quote/create-order per `productType` if desired.
