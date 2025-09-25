import type { CouponModel, InterviewSheetModel } from '@/interfaces';

export interface PriceBreakdown {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  couponDiscount: number;
  totalDiscount: number;
  finalPrice: number;
  savings: number;
}

export interface DiscountDisplayInfo {
  hasDiscount: boolean;
  showDiscountBadge: boolean;
  discountText: string;
  couponCode?: string;
  couponText?: string;
}

/**
 * Calculate price breakdown with discounts and coupons
 */
export const calculatePriceBreakdown = (
  sheet: InterviewSheetModel,
  appliedCoupon?: CouponModel
): PriceBreakdown => {
  const originalPrice = sheet.price || 0;
  const sheetDiscountPercentage = sheet.discountPercentage || 0;
  
  // Calculate sheet-level discount
  const sheetDiscountAmount = (originalPrice * sheetDiscountPercentage) / 100;
  
  // Calculate price after sheet discount
  const priceAfterSheetDiscount = originalPrice - sheetDiscountAmount;
  
  // Calculate coupon discount (applied on already discounted price)
  let couponDiscountAmount = 0;
  if (appliedCoupon && appliedCoupon.isValid) {
    // Check if sheet is in applicable products (empty array means all products)
    const isApplicable = appliedCoupon.applicableProducts.length === 0 || 
                         appliedCoupon.applicableProducts.includes(sheet._id.toString());
    
    // Check minimum amount requirement
    const meetsMinimum = priceAfterSheetDiscount >= appliedCoupon.minimumAmount;
    
    if (isApplicable && meetsMinimum) {
      couponDiscountAmount = (priceAfterSheetDiscount * appliedCoupon.discountPercentage) / 100;
    }
  }
  
  const finalPrice = Math.max(0, priceAfterSheetDiscount - couponDiscountAmount);
  const totalDiscount = sheetDiscountAmount + couponDiscountAmount;
  const savings = originalPrice - finalPrice;
  
  return {
    originalPrice,
    discountPercentage: sheetDiscountPercentage,
    discountAmount: sheetDiscountAmount,
    couponDiscount: couponDiscountAmount,
    totalDiscount,
    finalPrice,
    savings,
  };
};

/**
 * Get discount display information for UI
 */
export const getDiscountDisplayInfo = (
  sheet: InterviewSheetModel,
  appliedCoupon?: CouponModel
): DiscountDisplayInfo => {
  const hasSheetDiscount = (sheet.discountPercentage || 0) > 0;
  const hasCouponDiscount = Boolean(appliedCoupon && appliedCoupon.isValid);
  const hasAnyDiscount = hasSheetDiscount || hasCouponDiscount;
  
  let discountText = '';
  let couponText = '';
  
  if (hasSheetDiscount) {
    discountText = `${sheet.discountPercentage}% OFF`;
  }
  
  if (hasCouponDiscount && appliedCoupon) {
    couponText = `Extra ${appliedCoupon.discountPercentage}% off with ${appliedCoupon.code}`;
  }
  
  return {
    hasDiscount: hasAnyDiscount,
    showDiscountBadge: hasSheetDiscount,
    discountText,
    couponCode: appliedCoupon?.code,
    couponText,
  };
};

/**
 * Validate if a coupon can be applied to a sheet
 */
export const validateCouponForSheet = (
  coupon: CouponModel,
  sheet: InterviewSheetModel,
  currentPrice: number
): { isValid: boolean; reason?: string } => {
  if (!coupon.isActive) {
    return { isValid: false, reason: 'Coupon is inactive' };
  }
  
  if (coupon.isExpired) {
    return { isValid: false, reason: 'Coupon has expired' };
  }
  
  if (coupon.isUsageLimitReached) {
    return { isValid: false, reason: 'Coupon usage limit reached' };
  }
  
  // Check if applicable to this product
  if (coupon.applicableProducts.length > 0 && 
      !coupon.applicableProducts.includes(sheet._id.toString())) {
    return { isValid: false, reason: 'Coupon not applicable to this product' };
  }
  
  // Check minimum amount
  if (currentPrice < coupon.minimumAmount) {
    return { 
      isValid: false, 
      reason: `Minimum order amount ₹${coupon.minimumAmount} required` 
    };
  }
  
  return { isValid: true };
};

/**
 * Format price for display
 */
export const formatPrice = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

/**
 * Get savings percentage
 */
export const getSavingsPercentage = (originalPrice: number, finalPrice: number): number => {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};