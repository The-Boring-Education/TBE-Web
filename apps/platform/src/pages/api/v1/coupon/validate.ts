import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { validateCouponForProductFromDB } from '@/database';
import type { APIResponseType } from '@/interfaces';
import { connectDB } from '@/middlewares';

interface ValidateCouponRequest {
  code: string;
  productId: string;
  productType: string;
  userId?: string;
}

interface ValidateCouponResponse {
  coupon: {
    _id: string;
    code: string;
    discountPercentage: number;
    description: string;
    isActive: boolean;
    expiryDate: string;
    maxUsage?: number;
    currentUsage: number;
    applicableProducts: string[];
    minimumAmount: number;
    isValid: boolean;
  };
}

const validateCoupon = async (
  req: NextApiRequest,
  res: NextApiResponse<APIResponseType>
) => {
  if (req.method !== 'POST') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json({
      status: false,
      message: 'Method not allowed',
      data: null,
    });
  }

  try {
    await connectDB();
    
    const { code, productId, productType, userId }: ValidateCouponRequest = req.body;

    if (!code || !productId || !productType) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'Code, productId, and productType are required',
        data: null,
      });
    }

    // Validate coupon using database query
    const { data: coupon, error } = await validateCouponForProductFromDB(
      code,
      productId,
      productType,
      userId
    );

    if (error || !coupon) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: error || 'Invalid coupon code',
        data: null,
      });
    }

    return res.status(apiStatusCodes.OKAY).json({
      status: true,
      message: 'Coupon validated successfully',
      data: {
        _id: coupon._id.toString(),
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        description: coupon.description,
        isActive: coupon.isActive,
        expiryDate: coupon.expiryDate.toISOString(),
        maxUsage: coupon.maxUsage,
        currentUsage: coupon.currentUsage,
        applicableProducts: coupon.applicableProducts,
        minimumAmount: coupon.minimumAmount,
        isValid: coupon.isValid,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: 'Internal server error',
      data: null,
    });
  }
};

export default validateCoupon;