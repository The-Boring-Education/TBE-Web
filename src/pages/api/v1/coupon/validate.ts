import type { NextApiRequest, NextApiResponse } from 'next';

import { VITE_BASE_API_URL } from '@/constant';
import { apiStatusCodes } from '@/constant';
import type { APIResponse } from '@/interfaces';

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
  res: NextApiResponse<APIResponse<ValidateCouponResponse | null>>
) => {
  if (req.method !== 'POST') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json({
      status: false,
      message: 'Method not allowed',
      data: null,
    });
  }

  try {
    const { code, productId, productType, userId }: ValidateCouponRequest = req.body;

    if (!code || !productId || !productType) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: 'Code, productId, and productType are required',
        data: null,
      });
    }

    // Call the database API to validate coupon
    const response = await fetch(`${VITE_BASE_API_URL}/coupon/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code.toUpperCase(),
        productId,
        productType,
        userId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        status: false,
        message: data.message || 'Failed to validate coupon',
        data: null,
      });
    }

    if (data.status && data.data) {
      return res.status(apiStatusCodes.OKAY).json({
        status: true,
        message: 'Coupon validated successfully',
        data: data.data,
      });
    } else {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        status: false,
        message: data.message || 'Invalid coupon code',
        data: null,
      });
    }
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