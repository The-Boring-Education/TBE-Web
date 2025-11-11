import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import {
  createCouponFromDB,
  getAllCouponsFromDB,
} from '@/lib/database';
import { cors, sendAPIResponse } from '@/lib/utils';
import { adminMiddleware, connectDB } from '@/middleware/api';

interface CreateCouponRequest {
  code: string;
  discountPercentage: number;
  description: string;
  isActive?: boolean;
  expiryDate: string;
  maxUsage?: number;
  minimumAmount?: number;
  applicableProducts?: string[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apply admin middleware - only admins can access coupon management
  const adminCheck = await adminMiddleware(req, res);
  if (!adminCheck) return; // adminMiddleware handles the response

  await connectDB();

  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetAllCoupons(res);
    
    case 'POST':
      return handleCreateCoupon(req, res);

    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: apiStatusCodes.BAD_REQUEST,
          message: `Method ${method} not allowed`,
        })
      );
  }
};

// GET - Get all coupons (admin only)
const handleGetAllCoupons = async (res: NextApiResponse) => {
  try {
    const { data: coupons, error } = await getAllCouponsFromDB();

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: apiStatusCodes.BAD_REQUEST,
          message: error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: apiStatusCodes.OKAY,
        message: 'Coupons fetched successfully',
        data: coupons,
      })
    );
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: apiStatusCodes.BAD_REQUEST,
        message: 'Internal server error while fetching coupons',
      })
    );
  }
};

// POST - Create new coupon (admin only)
const handleCreateCoupon = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const {
      code,
      discountPercentage,
      description,
      isActive = true,
      expiryDate,
      maxUsage,
      minimumAmount = 0,
      applicableProducts = [],
    }: CreateCouponRequest = req.body;

    // Basic validation
    if (!code || !description || discountPercentage == null || !expiryDate) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: apiStatusCodes.BAD_REQUEST,
          message: 'Code, description, discountPercentage, and expiryDate are required',
        })
      );
    }

    if (discountPercentage < 1 || discountPercentage > 100) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: apiStatusCodes.BAD_REQUEST,
          message: 'Discount percentage must be between 1 and 100',
        })
      );
    }

    // Validate expiry date
    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj <= new Date()) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: apiStatusCodes.BAD_REQUEST,
          message: 'Expiry date must be in the future',
        })
      );
    }

    // For now, set createdBy to a placeholder admin user ID
    // In a real scenario, you'd extract this from the authenticated user
    const createdBy = req.headers['x-admin-user-id'] as string || '000000000000000000000000';

    const couponData = {
      code: code.trim().toUpperCase(),
      discountPercentage,
      description: description.trim(),
      isActive,
      expiryDate: expiryDateObj,
      maxUsage,
      minimumAmount,
      applicableProducts,
      createdBy,
    };

    const { data: newCoupon, error } = await createCouponFromDB(couponData);

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
            status: apiStatusCodes.BAD_REQUEST,
          message: error,
        })
      );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: apiStatusCodes.RESOURCE_CREATED,
        message: 'Coupon created successfully',
        data: newCoupon,
      })
    );
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: apiStatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Internal server error while creating coupon',
      })
    );
  }
};

export default handler;
