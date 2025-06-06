import type { NextApiRequest, NextApiResponse } from 'next';
import getRawBody from 'raw-body';
import { connectDB } from '@/middlewares';
import { getPaymentByOrderIdFromDB, updatePaymentStatusToDB } from '@/database'
import { verifyWebhookSignature, validateWebhookEvent, sendAPIResponse } from '@/utils';
import { apiStatusCodes } from '@/constant';

const WEBHOOK_SECRET = process.env.CASHFREE_SECRET_KEY!;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    if (req.method !== 'POST') {
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
    }

    const rawBody = await getRawBody(req);
    const payloadString = rawBody.toString('utf8');

    const { isValid: isSignatureValid, error: signatureError } = verifyWebhookSignature(
      payloadString,
      req.headers['x-webhook-signature'] as string,
      WEBHOOK_SECRET
    );

    if (!isSignatureValid) {
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: signatureError || 'Invalid webhook signature',
        })
      );
    }

    const event = JSON.parse(payloadString);
    const { isValid: isEventValid, error: eventError, data: webhookEvent } = validateWebhookEvent(event);

    if (!isEventValid || !webhookEvent) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: eventError || 'Invalid webhook event',
        })
      );
    }

    const { data: payment, error: findError } = await getPaymentByOrderIdFromDB(webhookEvent.order_id);

    if (findError) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: findError,
        })
      );
    }

    const { error: updateError } = await updatePaymentStatusToDB({
      orderId: webhookEvent.order_id,
      paymentId: webhookEvent.payment_id,
      status: webhookEvent.payment_status as 'SUCCESS' | 'FAILED',
    });

    if (updateError) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: updateError,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json({ status: 'OK' });
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Webhook processing failed',
        error,
      })
    );
  }
};

export default handler;
