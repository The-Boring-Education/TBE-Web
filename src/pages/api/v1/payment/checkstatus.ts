import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { checkPaymentStatusFromDB } from '@/database';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        return checkPaymentStatus(req, res);
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
      })
    );
  }
};

const checkPaymentStatus = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, productId } = req.query;

  if (!userId || !productId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'userId and productId are required',
      })
    );
  }

  const { data, error } = await checkPaymentStatusFromDB(
    userId as string,
    productId as string
  );

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: data?.purchased || false,
      data,
      message:
        error ||
        (data?.purchased ? 'Payment completed' : 'Payment not completed'),
    })
  );
};

export default handler;
