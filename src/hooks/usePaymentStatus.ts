import { routes } from '@/constant';
import { usePaymentStatusProps } from '@/interfaces';
import { useEffect, useState } from 'react';

const usePaymentStatus = ({
  userId,
  productId,
  isPremium,
}: usePaymentStatusProps) => {
  const [isPurchased, setIsPurchased] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `${routes.api.base}${routes.api.checkStatus}?userId=${userId}&productId=${productId}`,
          {
            method: 'GET',
          }
        );

        const result = await response.json();

        if (result.status && result.data?.purchased) {
          setIsPurchased(true);
        } else {
          setIsPurchased(false);
        }
      } catch (error) {
        setIsPurchased(false);
      }
    };

    if (userId && productId && isPremium) {
      checkPaymentStatus();
    } else {
      setIsPurchased(true);
    }
  }, [userId, productId, isPremium]);

  const isLocked = isPremium && isPurchased === false;

  return { isPurchased, isLocked };
};

export default usePaymentStatus;
