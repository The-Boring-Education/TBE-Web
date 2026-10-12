import type { DatabaseQueryResponseType } from "@/lib/interfaces";

/**
 * Payment status checks return `{ data: { purchased: false } }` for free-tier users,
 * including missing payments and PENDING/FAILED checkout — never treat those as errors.
 */
export const isPaymentStatusQueryFailure = (
  result: DatabaseQueryResponseType,
): boolean => Boolean(result.error) && result.data == null;

export const isUserPurchasedFromPaymentCheck = (
  result: DatabaseQueryResponseType,
): boolean => result.data?.purchased === true;

export const getPaymentStatusUserMessage = (
  result: DatabaseQueryResponseType,
): string => {
  if (result.error) {
    return result.error;
  }
  return isUserPurchasedFromPaymentCheck(result)
    ? "Payment completed"
    : "Payment not completed";
};
