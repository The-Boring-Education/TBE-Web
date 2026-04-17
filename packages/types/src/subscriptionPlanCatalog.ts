/**
 * Public subscription catalog row returned by GET /subscription-plans
 * (and used on product pricing pages).
 */
export interface SubscriptionPlanCatalogRow {
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
