import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";

import { apiStatusCodes, envConfig, isDevelopmentEnv } from "@/lib/constants";
import {
  getPaymentByOrderIdFromDB,
  updatePaymentStatusToDB,
} from "@/lib/database";
import { processPostPaymentEnrollment } from "@/lib/services/payment";
import { sendAPIResponse, verifyWebhookSignature } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

const WEBHOOK_SECRET = envConfig.CASHFREE_SECRET_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

type WebhookEvent = {
  order_id: string;
  payment_status: "SUCCESS" | "FAILED" | string;
  payment_id?: string | number;
  raw?: any;
};

const validateAndExtract = (
  payload: any,
): { isValid: boolean; error?: string; data?: WebhookEvent } => {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, error: "Invalid payload format" };
  }

  const data = payload.data;
  if (!data) return { isValid: false, error: "Missing data object in payload" };

  const order = data.order;
  const payment = data.payment;
  if (!order || !payment) {
    return {
      isValid: false,
      error: "Missing order or payment in payload.data",
    };
  }

  const order_id = order.order_id || order.orderId || null;
  const payment_status = (payment.payment_status || payment.status || null) as
    | string
    | null;
  const payment_id =
    payment.cf_payment_id ||
    payment.gateway_payment_id ||
    payment.payment_id ||
    null;

  if (!order_id || !payment_status) {
    return {
      isValid: false,
      error: "Missing order_id or payment_status in webhook payload",
    };
  }

  return {
    isValid: true,
    data: {
      order_id,
      payment_status,
      payment_id,
      raw: payload,
    },
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const rawBodyBuffer = await getRawBody(req);
    const payloadString = rawBodyBuffer.toString("utf8");

    if (!WEBHOOK_SECRET) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Webhook secret configuration missing",
        }),
      );
    }

    if (req.method !== "POST") {
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
    }

    const rawSignature = req.headers["x-webhook-signature"];
    const rawTimestamp = req.headers["x-webhook-timestamp"];
    const webhookSignature = Array.isArray(rawSignature)
      ? rawSignature[0]
      : rawSignature;
    const webhookTimestamp = Array.isArray(rawTimestamp)
      ? rawTimestamp[0]
      : rawTimestamp;

    if (process.env.NODE_ENV !== "development") {
      const { isValid, error } = verifyWebhookSignature(
        payloadString,
        webhookSignature as string | undefined,
        WEBHOOK_SECRET as string,
        webhookTimestamp as string | undefined,
      );
      if (!isValid) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
          sendAPIResponse({
            status: false,
            message: error || "Invalid webhook signature",
          }),
        );
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(payloadString);
    } catch (err) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Invalid JSON payload",
        }),
      );
    }

    const {
      isValid: ok,
      error: validationError,
      data: webhookEvent,
    } = validateAndExtract(parsed);
    if (!ok || !webhookEvent) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: validationError || "Invalid webhook event",
        }),
      );
    }

    const { data: _payment, error: findError } =
      await getPaymentByOrderIdFromDB(webhookEvent.order_id);
    if (findError) {
      return res
        .status(apiStatusCodes.NOT_FOUND)
        .json(sendAPIResponse({ status: false, message: findError }));
    }

    const { error: updateError } = await updatePaymentStatusToDB({
      orderId: webhookEvent.order_id,
      paymentId: webhookEvent.payment_id as string,
      status: webhookEvent.payment_status as "SUCCESS" | "FAILED",
    });

    if (updateError) {
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, message: updateError }));
    }

    if (webhookEvent.payment_status === "SUCCESS") {
      const enrollmentResult = await processPostPaymentEnrollment(_payment);
      if (!enrollmentResult.success) {
        logger.error("Post-payment enrollment failed", {
          productType: _payment.productType,
          error:
            enrollmentResult.error instanceof Error
              ? enrollmentResult.error.message
              : String(enrollmentResult.error),
        });
        // do not fail webhook
      } else {
        logger.info("Successfully processed enrollment", {
          productType: _payment.productType,
          orderId: webhookEvent.order_id,
        });
      }
    }

    return res.status(apiStatusCodes.OKAY).json({ status: "OK" });
  } catch (error) {
    logger.error("Webhook handler error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Webhook processing failed",
        error: isDevelopmentEnv && (error as any).message,
      }),
    );
  }
};

export default withApiHandler(handler);
