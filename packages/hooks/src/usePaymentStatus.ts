import { getAccessToken } from "@tbe/auth";
import { routes } from "@tbe/constants";
import type { usePaymentStatusProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

/**
 * Fetches purchase state via `GET .../payment/checkstatus`.
 */
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

      // API body: `{ status: boolean, data?: { purchased: boolean }, ... }`
      const purchased = Boolean(res.data?.purchased ?? res.status === true);
      return { purchased };
    },
    ...CACHE_TIMES.REALTIME,
    enabled: !!isPremium && !!userId && !!productId,
  });

  const isPurchased = isPremium ? (data?.purchased ?? null) : true;
  const isLocked = isPremium && isPurchased === false;

  return { isPurchased, isLocked, isLoading };
};

export default usePaymentStatus;
