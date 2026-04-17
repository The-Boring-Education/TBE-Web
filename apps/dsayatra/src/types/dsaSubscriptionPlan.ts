/**
 * Subscription plan row as returned by GET /subscription-plans for catalog UIs.
 * `planUuid` is optional for older API responses; prefer it for React keys when present.
 */
export interface DsaSubscriptionPlan {
  planUuid?: string;
  productType: string;
  planKey: string;
  displayName: string;
  description: string;
  amountInr: number;
  originalAmountInr: number;
  currency: string;
  accessType: string;
  durationMonths: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}
