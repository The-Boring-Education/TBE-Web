import { getAccessToken } from "@tbe/auth";
import { routes } from "@tbe/constants";
import type { usePaymentStatusProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

const usePaymentStatus = ({
  userId,
  productId,
  productType,
  isPremium,
}: usePaymentStatusProps) => {
  const { data, isLoading } = useQuery<{ purchased: boolean }>({
    queryKey: queryKeys.payment.status(userId ?? "", productId),
    queryFn: async () => {
      const token = getAccessToken();
      const qs = new URLSearchParams({
        userId: userId || "",
        productId,
        ...(productType ? { productType } : {}),
      });
      const res = await sendRequest({
        url: `${routes.api.base}${routes.api.checkStatus}?${qs.toString()}`,
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status && res.data?.purchased) {
        return { purchased: true };
      }
      return { purchased: false };
    },
    ...CACHE_TIMES.REALTIME,
    enabled: !!isPremium && !!userId && !!productId,
  });

  const isPurchased = isPremium ? (data?.purchased ?? null) : true;
  const isLocked = isPremium && isPurchased === false;

  return { isPurchased, isLocked, isLoading };
};

export default usePaymentStatus;
