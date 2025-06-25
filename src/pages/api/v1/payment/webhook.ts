import type { NextApiRequest, NextApiResponse } from 'next';
import getRawBody from 'raw-body';

import {
  ALLOWED_IPS,
  apiStatusCodes,
  envConfig,
  isDevelopmentEnv,
  isProductionEnv,
} from '@/constant';
import {
  enrollInACourse,
  enrollInASheet,
  getEnrolledCourseFromDB,
  getEnrolledSheetFromDB,
  getPaymentByOrderIdFromDB,
  updatePaymentStatusToDB,
} from '@/database';
import { connectDB } from '@/middlewares';
import {
  sendAPIResponse,
  validateWebhookEvent,
  verifyWebhookSignature,
} from '@/utils';

const WEBHOOK_SECRET = envConfig.CASHFREE_SECRET_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  if (!WEBHOOK_SECRET) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Webhook secret configuration missing',
      })
    );
  }

  switch (req.method) {
    case 'POST':
      return handleWebhook(req, res);
    default:
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (isProductionEnv) {
      const clientIp =
        req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const ipAddress = Array.isArray(clientIp)
        ? clientIp[0]
        : clientIp?.split(',')[0];

      if (!ipAddress || !ALLOWED_IPS.includes(ipAddress)) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
          sendAPIResponse({
            status: false,
            message: 'Unauthorized IP address',
          })
        );
      }
    }

    const rawBody = await getRawBody(req);
    const payloadString = rawBody.toString('utf8');

    const webhookSignature = req.headers['x-webhook-signature'];

    if (process.env.NODE_ENV !== 'development') {
      if (!webhookSignature || typeof webhookSignature !== 'string') {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
          sendAPIResponse({
            status: false,
            message: 'Missing webhook signature',
          })
        );
      }

      const { isValid: isSignatureValid, error: signatureError } =
        verifyWebhookSignature(payloadString, webhookSignature, WEBHOOK_SECRET);

      if (!isSignatureValid) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
          sendAPIResponse({
            status: false,
            message: signatureError || 'Invalid webhook signature',
          })
        );
      }
    }

    const event = JSON.parse(payloadString);
    const {
      isValid: isEventValid,
      error: eventError,
      data: webhookEvent,
    } = validateWebhookEvent(event);

    if (!isEventValid || !webhookEvent) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: eventError || 'Invalid webhook event',
        })
      );
    }

    const { data: _payment, error: findError } =
      await getPaymentByOrderIdFromDB(webhookEvent.order_id);

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

    if (webhookEvent.payment_status === 'SUCCESS') {
      if (_payment.productType === 'SHIKSHA') {
        const { data: alreadyEnrolled } = await getEnrolledCourseFromDB({
          userId: _payment.user,
          courseId: _payment.productId,
        });

        if (!alreadyEnrolled) {
          const { error: enrollError } = await enrollInACourse({
            userId: _payment.user,
            courseId: _payment.productId,
          });

          if (enrollError) {
            console.error(
              'Course enrollment failed after payment:',
              enrollError
            );
          }
        }
      }

      if (_payment.productType === 'INTERVIEW_SHEET') {
        const { data: alreadyEnrolled } = await getEnrolledSheetFromDB({
          userId: _payment.user,
          sheetId: _payment.productId,
        });

        if (!alreadyEnrolled) {
          const { error: enrollError } = await enrollInASheet({
            userId: _payment.user,
            sheetId: _payment.productId,
          });

          if (enrollError) {
            console.error(
              'Interview sheet enrollment failed after payment:',
              enrollError
            );
          }
        }
      }
    }

    return res.status(apiStatusCodes.OKAY).json({ status: 'OK' });
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Webhook processing failed',
        error: isDevelopmentEnv && error,
      })
    );
  }
};

export default handler;
