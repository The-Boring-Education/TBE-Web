/**
 * When the first quote request failed but included a `coupon` param, we may
 * retry without it so the customer still sees list price. Only use this for
 * errors that are clearly about the discount code, not product/plan setup.
 */
export const isRecoverableCouponQuoteError = (message: string): boolean => {
  const m = message.toLowerCase();
  if (!m.trim()) {
    return false;
  }
  if (
    m.includes('plan pricing not configured') ||
    m.includes('not configured or inactive for') ||
    m.includes('interview sheet not found') ||
    m.includes('course not found') ||
    m.includes('invalid product type')
  ) {
    return false;
  }
  return m.includes('coupon') || m.includes('not applicable to this product');
};
