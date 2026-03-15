import type { UsePaymentAccessProps } from "@tbe/interface";

import usePaymentStatus from "./usePaymentStatus";
import useUser from "./useUser";

const usePaymentAccess = ({
  productId,
  productType,
  isPremium,
  isEnrolled,
}: UsePaymentAccessProps) => {
  const { user } = useUser();

  // Use the existing payment status hook
  const { isPurchased, isLocked: paymentStatusLocked } = usePaymentStatus({
    userId: user?.id,
    productId,
    productType,
    isPremium,
  });

  // check if product is locked
  // Product is locked if:
  // 1. It's premium AND
  // 2. User is not enrolled AND
  // 3. Payment is not purchased
  const isLocked = isPremium === true && !isEnrolled && isPurchased === false;

  // Determine if user has access
  const hasAccess = !isLocked;

  return {
    isPurchased,
    isLocked,
    hasAccess,
    isLoading: isPurchased === null && isPremium === true,
  };
};

export default usePaymentAccess;
