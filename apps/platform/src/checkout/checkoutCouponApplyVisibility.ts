/**
 * When the server has a successful coupon on the quote and the field matches
 * that code, the Apply CTA is redundant. Show Apply again on draft mismatch
 * (user editing) or when there is a coupon-apply error to retry.
 */
export const shouldShowCheckoutApplyButton = (
  quoteCouponCode: string | undefined | null,
  draft: string,
  couponApplyError: string | null,
): boolean => {
  if (couponApplyError) {
    return true;
  }
  const applied = quoteCouponCode?.trim();
  if (!applied) {
    return true;
  }
  return draft.trim().toUpperCase() !== applied.toUpperCase();
};
