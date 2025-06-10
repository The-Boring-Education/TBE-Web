import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { addPaymentToDB } from '@/database';
import { apiStatusCodes } from '@/constant';
import { buildOrderPayload, createCashfreeOrder, generatePaymentOrderId, sendAPIResponse } from '@/utils';
import { Types } from 'mongoose';


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return await handleCreateOrder(req, res);
      default:
        return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal Server Error',
        error,
      })
    );
  }
};

const handleCreateOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      userId,
      productId,
      productType,
      amount,
      customerName,
      customerEmail,
    } = req.body;

    if (!userId || !productId || !productType || !amount || !customerName || !customerEmail) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required fields',
        })
      );
    }

    const orderId = generatePaymentOrderId();

    const orderPayload = buildOrderPayload({
      orderId,
      amount: amount,
      userId,
      customerName,
      customerEmail,
    });

    const { data, ok } = await createCashfreeOrder(orderPayload);

    if (!ok || !data.payment_session_id) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to create order with payment gateway',
          error: process.env.NODE_ENV === 'development' ? data : undefined,
        })
      );
    }

      const paymentLink = `${process.env.CASHFREE_BASE_URL}/checkout?paymentSessionId=${data.payment_session_id}`;

    const { error, details } = await addPaymentToDB({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      productType,
      amount: amount,
      orderId,
      paymentLink,
    });

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: error,
      })
    );
  }

    // 13. Send success response
    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Order created successfully',
        data: {
          orderId,
          paymentLink,
          paymentSessionId: data.payment_session_id,
        },
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      })
    );
  }
};

export default handler;