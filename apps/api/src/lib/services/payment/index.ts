// Export enrollment service
export { processPostPaymentEnrollment } from "./enrollmentService";

// Export enrollment handlers
export {
  ENROLLMENT_HANDLERS,
  executeEnrollmentHandler,
} from "./enrollmentHandlers";

// Export product configuration
export { getProductConfig, PRODUCT_REGISTRY } from "@/lib/constants/products";

export { resolveAuthoritativeOrderAmount } from "./resolveOrderAmount";
export {
  getSubscriptionPlanPrice,
  SUBSCRIPTION_PLAN_PRICES,
} from "./subscriptionPlanCatalog";
