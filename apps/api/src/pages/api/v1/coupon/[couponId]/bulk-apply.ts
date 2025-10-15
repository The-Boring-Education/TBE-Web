import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from "@/lib/constants";
import {
  applyCouponToSheetsFromDB,
  getCouponByIdFromDB,
} from '@/lib/database';
import { cors, sendAPIResponse  } from '@/lib/utils';
import { adminMiddleware,connectDB } from '@/middleware';

interface BulkApplyRequest {
  sheetIds: string[];
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

  const { method, query } = req;
  const { couponId } = query;

  if (!couponId || typeof couponId !== 'string') {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: apiStatusCodes.BAD_REQUEST,
        message: 'Coupon ID is required',
      })
    );
  }

  if (method !== 'POST') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: `Method ${method} not allowed`,
      })
    );
  }

  return handleBulkApply(req, res, couponId);
};

// POST - Apply coupon to multiple sheets (admin only)
const handleBulkApply = async (
  req: NextApiRequest,
  res: NextApiResponse,
  couponId: string
) => {
  try {
    const { sheetIds }: BulkApplyRequest = req.body;

    // Validation
    if (!sheetIds || !Array.isArray(sheetIds)) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'sheetIds array is required',
        })
      );
    }

    if (sheetIds.length === 0) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'At least one sheet ID is required',
        })
      );
    }

    // Check if coupon exists first
    const { data: coupon, error: couponError } = await getCouponByIdFromDB(couponId);
    if (couponError || !coupon) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: couponError || 'Coupon not found',
        })
      );
    }

    // Apply coupon to sheets
    const { data: updatedCoupon, error } = await applyCouponToSheetsFromDB(
      couponId,
      sheetIds
    );

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: `Coupon successfully applied to ${sheetIds.length} sheet${sheetIds.length !== 1 ? 's' : ''}`,
        data: {
          coupon: updatedCoupon,
          appliedToSheets: sheetIds.length,
          totalApplicableProducts: updatedCoupon?.applicableProducts?.length || 0,
        },
      })
    );
  } catch (error) {
    console.error('Error applying coupon to sheets:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal server error while applying coupon to sheets',
      })
    );
  }
};

export default handler;
