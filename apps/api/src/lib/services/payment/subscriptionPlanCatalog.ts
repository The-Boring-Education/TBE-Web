/**
 * Subscription list prices live in MongoDB (`SubscriptionPlan` collection), not in source code.
 *
 * - Resolve at runtime: `getSubscriptionPlanPriceFromDB` in `@/lib/database/queries/subscription-plan`
 * - Admin writes: `POST /api/v1/admin/subscription-plans` with header `x-admin-secret: <ADMIN_SECRET>`
 * - One-off local seed: `pnpm seed:subscription-plans` (reads gitignored `scripts/subscription-plans.local.json`)
 *
 * @see docs/payment.md
 */

export { getSubscriptionPlanPriceFromDB as getSubscriptionPlanPrice } from "@/lib/database/queries/subscription-plan";
