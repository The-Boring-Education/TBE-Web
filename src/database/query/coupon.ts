import { Coupon } from '@/database';
import type { DatabaseQueryResponseType } from '@/interfaces';

const findCouponByCodeFromDB = async (
  code: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return { error: 'Coupon not found' };
    }
    return { data: coupon };
  } catch (error) {
    return { error: 'Failed to find coupon' };
  }
};

const validateCouponForProductFromDB = async (
  code: string,
  productId: string,
  productType: string,
  userId?: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return { error: 'Coupon not found' };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { error: 'Coupon is inactive' };
    }

    // Check if coupon is expired
    if (coupon.isExpired) {
      return { error: 'Coupon has expired' };
    }

    // Check if usage limit is reached
    if (coupon.isUsageLimitReached) {
      return { error: 'Coupon usage limit reached' };
    }

    // Check if applicable to this product (empty array means all products)
    if (coupon.applicableProducts.length > 0 && 
        !coupon.applicableProducts.includes(productId)) {
      return { error: 'Coupon not applicable to this product' };
    }

    return { data: coupon };
  } catch (error) {
    return { error: 'Failed to validate coupon' };
  }
};

const getCouponByIdFromDB = async (
  couponId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return { error: 'Coupon not found' };
    }
    return { data: coupon };
  } catch (error) {
    return { error: 'Failed to get coupon' };
  }
};

export {
  findCouponByCodeFromDB,
  validateCouponForProductFromDB,
  getCouponByIdFromDB,
};
