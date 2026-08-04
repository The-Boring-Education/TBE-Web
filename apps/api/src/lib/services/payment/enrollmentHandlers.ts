import { planTypeMap } from "@/lib/constants";
import type { EnrollmentHandlerName } from "@/lib/constants/products";
import {
  createSubscriptionInDB,
  enrollInACourse,
  enrollInASheet,
  getActiveSubscriptionByUserFromDB,
  getEnrolledCourseFromDB,
  getEnrolledSheetFromDB,
  updateUserPointsInDB,
  updateUserSubscriptionStatusInDB,
} from "@/lib/database";
import type { PaymentModel } from "@/lib/interfaces";
import { getPYSubscriptionFeaturesByType } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

type EnrollmentHandler = (
  payment: PaymentModel,
) => Promise<{ success: boolean; error?: string; data?: any }>;

const enrollInSheet: EnrollmentHandler = async (payment) => {
  try {
    const { data: alreadyEnrolled } = await getEnrolledSheetFromDB({
      userId: payment.user.toString(),
      sheetId: payment.productId,
    });

    if (alreadyEnrolled) {
      return { success: true, data: { alreadyEnrolled: true } };
    }

    const { data, error } = await enrollInASheet({
      userId: payment.user.toString(),
      sheetId: payment.productId,
    });

    if (error) {
      return { success: false, error };
    }

    await updateUserPointsInDB(payment.user.toString(), "ENROLL_SHEET");

    return { success: true, data };
  } catch (error: any) {
    logger.error("Sheet enrollment error", {
      error: error.message,
      orderId: payment.orderId,
    });
    return { success: false, error: error.message };
  }
};

const enrollInCourse: EnrollmentHandler = async (payment) => {
  try {
    const { data: alreadyEnrolled } = await getEnrolledCourseFromDB({
      userId: payment.user.toString(),
      courseId: payment.productId,
    });

    if (alreadyEnrolled) {
      return { success: true, data: { alreadyEnrolled: true } };
    }

    const { data, error } = await enrollInACourse({
      userId: payment.user.toString(),
      courseId: payment.productId,
    });

    if (error) {
      return { success: false, error };
    }

    await updateUserPointsInDB(payment.user.toString(), "ENROLL_COURSE");

    return { success: true, data };
  } catch (error: any) {
    logger.error("Course enrollment error", {
      error: error.message,
      orderId: payment.orderId,
    });
    return { success: false, error: error.message };
  }
};

const createSubscription: EnrollmentHandler = async (payment) => {
  try {
    const plan =
      planTypeMap[
        String(payment.productId).toLowerCase() as keyof typeof planTypeMap
      ];
    if (!plan) {
      return {
        success: false,
        error: `Unknown subscription plan: ${payment.productId}`,
      };
    }

    const expiryDate =
      plan.type === "Lifetime"
        ? new Date("2099-12-31")
        : new Date(Date.now() + plan.duration * 30 * 24 * 60 * 60 * 1000);

    const { data: existingSubscription } =
      await getActiveSubscriptionByUserFromDB(
        payment.user.toString(),
        plan.type,
      );

    if (existingSubscription) {
      if (plan.type !== "Lifetime") {
        const currentExpiry = existingSubscription.expiryDate.getTime();
        const extensionStart = Math.max(currentExpiry, Date.now());
        existingSubscription.expiryDate = new Date(
          extensionStart + plan.duration * 30 * 24 * 60 * 60 * 1000,
        );
        existingSubscription.duration += plan.duration;
        await existingSubscription.save();
        await updateUserSubscriptionStatusInDB({
          userId: payment.user.toString(),
          subscriptionStatus: "Active",
          subscriptionExpiry: existingSubscription.expiryDate,
        });
      }
      return {
        success: true,
        data: { renewed: true, existingSubscription },
      };
    }

    const features = getPYSubscriptionFeaturesByType(plan.type);

    const { error: createError } = await createSubscriptionInDB({
      userId: payment.user.toString(),
      type: plan.type,
      productType: payment.productType,
      amount: payment.amount,
      duration: plan.duration,
      expiryDate,
      features,
    });

    if (createError) {
      return { success: false, error: createError };
    }

    const { error: updateError } = await updateUserSubscriptionStatusInDB({
      userId: payment.user.toString(),
      subscriptionStatus: "Active",
      subscriptionExpiry: expiryDate,
    });

    if (updateError) {
      return { success: false, error: updateError };
    }

    return { success: true, data: { plan: plan.type, expiryDate } };
  } catch (error: any) {
    logger.error("Subscription enrollment error", {
      error: error.message,
      orderId: payment.orderId,
    });
    return { success: false, error: error.message };
  }
};

const ENROLLMENT_HANDLERS: Record<EnrollmentHandlerName, EnrollmentHandler> = {
  enrollInSheet,
  enrollInCourse,
  createSubscription,
};

const executeEnrollmentHandler = async (
  handlerName: EnrollmentHandlerName,
  payment: PaymentModel,
) => {
  const handler = ENROLLMENT_HANDLERS[handlerName];
  if (!handler) {
    throw new Error(`Enrollment handler "${handlerName}" not found`);
  }
  return await handler(payment);
};

export { ENROLLMENT_HANDLERS, executeEnrollmentHandler };
