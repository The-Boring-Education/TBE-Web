# Payments Guardrails & Pricing (TBE Web)

This document describes the complete payment system — how money flows, product pricing, freemium gating, guardrails for dev-centric users, and **how to configure, test, and verify** everything end-to-end.

---

## Architecture Overview

```
User → Pricing Page (DSA Yatra / OnCampus / PrepYatra)
  ↓
[SELECT PLAN] → Platform Checkout (/checkout?productType=X&productId=Y)
  ↓
[LOGIN if needed]
  ↓
API: POST /payment/create-order
  ├── resolveAuthoritativeOrderAmount() (server-side pricing)
  ├── Validates coupon (optional)
  ├── Creates Cashfree order
  ├── Saves Payment doc (status=PENDING)
  └── Returns: {orderId, paymentLink, paymentSessionId}
  ↓
[CASHFREE PAYMENT FLOW via SDK]
  ↓
Cashfree → POST /payment/webhook
  ├── Validates signature
  ├── Updates Payment.status = SUCCESS|FAILED
  └── processPostPaymentEnrollment()
        ├── enrollInSheet / enrollInCourse / createSubscription
        └── Updates User subscription status
  ↓
Payment Status Page (/payment/status?order_id=X)
  ├── Lottie success animation
  └── Redirect to dashboard
```

---

## Current Stack

- **Gateway:** Cashfree (orders + payment session + webhooks)
- **API:** `apps/api` — payment endpoints under `/api/v1/payment/`
- **Client:** Cashfree JS SDK via `useCashfreePayment` hook, checkout on Platform app
- **Animations:** Lottie (payment success), Framer Motion (pricing page, lock overlay)

---

## 1. Product Types & Pricing

### A. One-Time Products (price on the document)

| Product                | `productType`     | Price Source                       | `productId`  |
| ---------------------- | ----------------- | ---------------------------------- | ------------ |
| Interview Prep (sheet) | `INTERVIEW_SHEET` | Sheet document `price` in MongoDB  | Sheet `_id`  |
| Shiksha course         | `SHIKSHA`         | Course document `price` in MongoDB | Course `_id` |

### B. Subscription Products (price in `SubscriptionPlan`)

Uses the **`SubscriptionPlan`** collection with these fields:

| Field               | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `productType`       | Product enum (DSA_YATRA, ONCAMPUS, PREPYATRA, etc.)       |
| `planKey`           | Normalized lowercase key (e.g. `lifetime`, `3months`)     |
| `displayName`       | User-facing name (e.g. "Lifetime Access", "3-Month Plan") |
| `description`       | Short description for pricing cards                       |
| `amountInr`         | Authoritative INR price (matches Cashfree order_amount)   |
| `originalAmountInr` | Original price for strike-through display (0 = none)      |
| `accessType`        | `ONE_TIME` or `SUBSCRIPTION`                              |
| `durationMonths`    | Duration in months (0 = lifetime)                         |
| `features`          | String array shown on pricing cards                       |
| `isPopular`         | Whether this plan is highlighted/recommended              |
| `isActive`          | Whether plan is available for purchase                    |
| `sortOrder`         | Display order on pricing page                             |

| Product   | `productType` | Typical Plans                                           |
| --------- | ------------- | ------------------------------------------------------- |
| DSA Yatra | `DSA_YATRA`   | `lifetime` (one-time)                                   |
| On Campus | `ONCAMPUS`    | `1months`, `3months`, `6months`, `12months`             |
| PrepYatra | `PREPYATRA`   | `1months`, `3months`, `6months`, `12months`, `lifetime` |

---

## 2. Freemium Guardrail System (DSA Yatra)

### Bucket Limits for Free Users

| Bucket       | Free Limit | Description                            |
| ------------ | ---------- | -------------------------------------- |
| `EASY`       | 3          | 3 easy questions per topic             |
| `MEDIUM`     | 2          | 2 medium questions per topic           |
| `HARD`       | 1          | 1 hard question per topic              |
| `REAL_WORLD` | 1          | 1 real-world problem (separate bucket) |

**Total free access:** 7 questions per bucket cycle (3E + 2M + 1H + 1RW).

### How Gating Works

1. **Server-side:** `applyDSAFreemiumGating()` in `packages/constants/src/dsaFreemium.ts` marks questions as `isLocked: true` based on per-difficulty caps.

2. **API response stripping:** For locked questions, the API removes sensitive fields:
   - ❌ `answer` — solution details
   - ❌ `sections` — detailed breakdown
   - ❌ `resources` — YouTube, LeetCode, blog URLs
   - ❌ `notes` — user notes

   Locked questions only expose: `_id`, `title`, `difficulty`, `domain`, `topics`, `companyTypes`, `order`, `isRealWorldProblem`, `isLocked`

3. **Security:** This is important because the product is dev-centric — developers can inspect network requests. Answer details are **never sent** for locked questions.

### Client-Side Gating

- `usePaymentStatus` hook checks if user has active subscription
- `usePaymentAccess` hook combines payment status with enrollment for access control
- `PaymentLockOverlay` component shows accessible modal dialog with `role="dialog"`, `aria-modal="true"`, and focus management

---

## 3. Setting Up Payment Plans

### Option 1: Admin HTTP API (recommended for staging/production)

```bash
# List all plans
curl -sS -H "x-admin-secret: $ADMIN_SECRET" "$API/admin/subscription-plans"

# Upsert plans
curl -sS -X POST -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  "$API/admin/subscription-plans" \
  -d '{
    "plans": [{
      "productType": "DSA_YATRA",
      "planKey": "lifetime",
      "displayName": "Lifetime Access",
      "description": "One-time payment for permanent access",
      "amountInr": 499,
      "originalAmountInr": 1999,
      "accessType": "ONE_TIME",
      "durationMonths": 0,
      "features": ["Complete DSA question bank", "All future updates"],
      "isPopular": true,
      "sortOrder": 1
    }]
  }'
```

### Option 2: Local Seed Script

1. Copy `apps/api/scripts/subscription-plans.example.json` → `subscription-plans.local.json` (gitignored)
2. Set real `amountInr` values
3. Run: `pnpm seed:subscription-plans` (with `ADMIN_SECRET` set)

---

## 4. Manual Testing Checklist

### Prerequisites

- MongoDB reachable, `ADMIN_SECRET` set
- For create-order: `CASHFREE_CLIENT_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_BASE_URL`
- For checkout UI: `NEXT_PUBLIC_PLATFORM_URL`

### Step 1 — Verify Plans Are Seeded

```bash
curl -sS -H "x-admin-secret: $ADMIN_SECRET" "$API/admin/subscription-plans"
# Expect: list with productType, planKey, amountInr, displayName, features, etc.
```

### Step 2 — Get Price Quote

```bash
# Subscription (no coupon)
curl -sS "$API/payment/quote?productType=DSA_YATRA&productId=lifetime"

# With coupon
curl -sS "$API/payment/quote?productType=ONCAMPUS&productId=3months&coupon=CODE&userId=USER_ID"

# One-time product
curl -sS "$API/payment/quote?productType=INTERVIEW_SHEET&productId=SHEET_ID"
```

### Step 3 — Validate Coupon

```bash
curl -sS -X POST "$API/coupon/validate" \
  -H "Content-Type: application/json" \
  -d '{"code":"CODE","productId":"3months","productType":"ONCAMPUS","userId":"USER_ID"}'
```

### Step 4 — Create Order

```bash
curl -sS -X POST "$API/payment/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"USER_ID",
    "productId":"lifetime",
    "productType":"DSA_YATRA",
    "customerName":"Test User",
    "customerEmail":"test@example.com"
  }'
# Expect: orderId, paymentLink, paymentSessionId
```

### Step 5 — Check Payment Status After Webhook

```bash
# By order ID
curl -sS "$API/payment/order-status?orderId=ORDER_ID&userId=USER_ID"

# By product purchase flag
curl -sS "$API/payment/checkstatus?userId=USER_ID&productId=lifetime&productType=DSA_YATRA"
# Expect: purchased: true after successful payment
```

### Step 6 — Test Freemium Gating

```bash
# Get DSA questions as non-subscriber (no auth or non-paid user)
# Locked questions should NOT contain 'answer', 'sections', or 'resources'
curl -sS "$API/interview-prep/dsa-sheet?page=1&limit=10"
# Verify: isLocked=true questions have title + metadata only
```

---

## 5. API Reference

| Route                                            | Auth                    | Purpose                                |
| ------------------------------------------------ | ----------------------- | -------------------------------------- |
| `GET/POST /api/v1/payment/quote`                 | Public                  | Server-side price quote                |
| `POST /api/v1/payment/create-order`              | Bearer token            | Creates Cashfree order + DB payment    |
| `GET /api/v1/payment/checkstatus`                | Query params            | Whether user purchased a SKU           |
| `GET /api/v1/payment/order-status`               | Query: orderId + userId | Payment status by order ID             |
| `POST /api/v1/payment/webhook`                   | Cashfree signature      | Updates status + triggers enrollment   |
| `GET /api/v1/subscription-plans`                 | Public                  | List active plans (filterable by type) |
| `POST /api/v1/coupon/validate`                   | Public JSON body        | Validates coupon for product           |
| `GET/POST /api/v1/admin/subscription-plans`      | `x-admin-secret`        | List / upsert subscription plans       |
| `GET/POST /api/v1/admin/coupon`                  | `x-admin-secret`        | List / create coupons                  |
| `GET/PUT/DELETE /api/v1/admin/coupon/[couponId]` | `x-admin-secret`        | CRUD individual coupon                 |

---

## 6. Security Notes

- **Server-side pricing:** Amounts are never taken from the client — `resolveAuthoritativeOrderAmount` resolves from DB.
- **Order-status** requires matching `userId` to prevent order-id probing.
- **Locked question stripping:** Answer details are removed server-side before API response for non-subscribers.
- **Webhook signature:** Cashfree signature is verified before processing.
- **Admin routes** require `x-admin-secret` header.
- **Cashfree credentials** stay server-side only.

---

## 7. Test Coverage

### Unit Tests (vitest)

| Test File                              | Coverage                                         |
| -------------------------------------- | ------------------------------------------------ |
| `dsaFreemium.test.ts`                  | Freemium limits, bucket mapping, gating function |
| `usePaymentStatus.test.ts`             | Payment status hook (10 tests)                   |
| `usePaymentAccess.test.ts`             | Payment access hook (6 tests)                    |
| `payment-create-order.test.ts`         | Order creation API                               |
| `payment-checkstatus.test.ts`          | Payment status API                               |
| `payment-webhook.test.ts`              | Webhook handler                                  |
| `payment-resolve-order-amount.test.ts` | Price resolution service                         |

### E2E Tests (Playwright)

| Test File                  | Coverage                                    |
| -------------------------- | ------------------------------------------- |
| `payment-checkout.spec.ts` | Checkout page load, invalid params handling |
| `pricing.spec.ts`          | DSA Yatra pricing page (4 tests)            |

### Running Tests

```bash
# All unit tests
pnpm --filter @tbe/testing test:unit

# Specific payment tests
cd apps/testing && npx vitest run --config vitest.config.ts \
  src/unit/utils/dsaFreemium.test.ts \
  src/unit/hooks/usePaymentStatus.test.ts \
  src/unit/hooks/usePaymentAccess.test.ts

# E2E tests
pnpm --filter @tbe/testing test:e2e
```

---

## 8. Seed Data

The `apps/api/scripts/subscription-plans.example.json` file contains template plans with realistic pricing:

- **DSA_YATRA:** Lifetime at ₹499 (was ₹1,999) with 8 features
- **PREPYATRA:** 1/3/6/12 month + lifetime plans
- **ONCAMPUS:** 1/3/6/12 month plans

Each plan includes `displayName`, `description`, `features`, `originalAmountInr` (for discount display), `isPopular`, and `sortOrder`.

---

## 9. Operational Checklist

1. **Production/staging:** Upsert `SubscriptionPlan` via admin API (never commit real INR to git)
2. **Local dev:** Use `subscription-plans.local.json` + seed script
3. **Configure coupons** in admin with `applicableProducts` scoping
4. **Set Cashfree env vars** and webhook URL
5. **Verify:** Run manual testing checklist (Section 4) for each product type
6. **Monitor:** Check API logs for enrollment failures after webhook processing
