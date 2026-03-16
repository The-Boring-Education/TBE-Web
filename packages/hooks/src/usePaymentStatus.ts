import { routes } from "@tbe/constants";
import type { usePaymentStatusProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";

const usePaymentStatus = ({
  userId,
  productId,
  productType,
  isPremium,
}: usePaymentStatusProps) => {
  const { data, isLoading } = useQuery<{ purchased: boolean }>({
    queryKey: queryKeys.payment.status(userId ?? "", productId),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        userId: userId || "",
        productId: productId,
      });

      if (productType) {
        queryParams.append("productType", productType);
      }

      const response = await fetch(
        `${routes.api.base}${routes.api.checkStatus}?${queryParams.toString()}`,
        { method: "GET" },
      );

      const result = await response.json();

      if (result.status && result.data?.purchased) {
        return { purchased: true };
      }
      return { purchased: false };
    },
    ...CACHE_TIMES.REALTIME,
    enabled: !!isPremium && !!userId && !!productId,
  });

  const isPurchased = isPremium ? (data?.purchased ?? null) : true;
  const isLocked = isPremium && isPurchased === false;

  return { isPurchased, isLocked };
};

export default usePaymentStatus;
