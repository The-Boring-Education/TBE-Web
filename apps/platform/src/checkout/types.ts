/** Quote row from `GET /payment/quote` (subset used on checkout). */
export type CheckoutQuote = {
  baseAmount: number;
  finalAmount: number;
  couponCode?: string;
  couponDescription?: string;
  couponDiscountPercentage?: number;
  couponMinimumAmount?: number;
};

export type PricingBannerRow = {
  code: string;
  discountPercentage: number;
  description: string;
  expiryDate: string;
  minimumAmount: number;
};
