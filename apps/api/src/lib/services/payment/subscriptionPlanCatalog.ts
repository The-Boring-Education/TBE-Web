/**
 * Subscription list prices live in MongoDB (`SubscriptionPlan` collection), not in source code.
 *
 * - Resolve at runtime: `getSubscriptionPlanPriceFromDB` in `@/lib/database/queries/subscription-plan`
 * - Admin writes: `POST /api/v1/admin/subscription-plans` with admin JWT or `x-admin-secret`
 * - One-off seed: `pnpm seed:subscription-plans` (reads gitignored `scripts/subscription-plans.json`)
 *
 * @see docs/payment.md
 */

export { getSubscriptionPlanPriceFromDB as getSubscriptionPlanPrice } from "@/lib/database/queries/subscription-plan";
