import { getProductConfig } from "@/lib/constants/products";
import type { PaymentModel } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { executeEnrollmentHandler } from "./enrollmentHandlers";

const processPostPaymentEnrollment = async (
  payment: PaymentModel,
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    const productConfig = getProductConfig(payment.productType);

    if (!productConfig.enrollmentHandler) {
      return {
        success: true,
        data: { noEnrollmentRequired: true },
      };
    }

    const result = await executeEnrollmentHandler(
      productConfig.enrollmentHandler,
      payment,
    );

    if (!result.success) {
      logger.error("Post-payment enrollment failed", {
        productType: payment.productType,
        orderId: payment.orderId,
        error: result.error,
      });
    } else {
      logger.info("Post-payment enrollment succeeded", {
        productType: payment.productType,
        orderId: payment.orderId,
      });
    }

    return result;
  } catch (error: any) {
    logger.error("Post-payment enrollment error", {
      error: error.message || String(error),
      productType: payment.productType,
      orderId: payment.orderId,
    });
    return {
      success: false,
      error: error.message || "Unknown enrollment error",
    };
  }
};

export { processPostPaymentEnrollment };
