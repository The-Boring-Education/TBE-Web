import { getAccessToken } from '@tbe/auth';
import { routes } from '@tbe/constants';
import { sendRequest } from '@tbe/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isRecoverableCouponQuoteError } from './quoteErrors';
import type { CheckoutQuote, PricingBannerRow } from './types';

const mapQuoteData = (data: Record<string, unknown>): CheckoutQuote => {
  return {
    baseAmount: data.baseAmount as number,
    finalAmount: data.finalAmount as number,
    couponCode: data.couponCode as string | undefined,
    couponDescription: data.couponDescription as string | undefined,
    couponDiscountPercentage: data.couponDiscountPercentage as
      | number
      | undefined,
    couponMinimumAmount: data.couponMinimumAmount as number | undefined,
  };
};

type UseCheckoutPricingArgs = {
  productType: string | undefined;
  productId: string | undefined;
  /** Coupon from URL (query). */
  coupon: string | undefined;
  userId: string | undefined;
  /** Fetch when true (supported link + ready). */
  enabled: boolean;
};

export const useCheckoutPricing = ({
  productType,
  productId,
  coupon,
  userId,
  enabled,
}: UseCheckoutPricingArgs) => {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  /** Blocks checkout UI entirely (e.g. plan missing). */
  const [quoteError, setQuoteError] = useState<string | null>(null);
  /** Shown under coupon field; list price still loads. */
  const [couponApplyError, setCouponApplyError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [pricingBanners, setPricingBanners] = useState<PricingBannerRow[]>([]);
  const [bannersError, setBannersError] = useState(false);

  const loadQuote = useCallback(async () => {
    if (!productType || !productId) {
      return;
    }
    setIsQuoting(true);
    setQuoteError(null);
    setCouponApplyError(null);

    const runRequest = async (includeCoupon: boolean) => {
      const qs = new URLSearchParams({ productType, productId });
      if (includeCoupon && coupon) {
        qs.set('coupon', coupon);
      }
      if (userId) {
        qs.set('userId', userId);
      }
      const token = getAccessToken();
      return sendRequest({
        method: 'GET',
        url: `${routes.api.paymentQuote}?${qs.toString()}`,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    };

    const res = await runRequest(true);

    if (res.status && res.data) {
      setIsQuoting(false);
      setQuote(mapQuoteData(res.data as Record<string, unknown>));
      return;
    }

    const msg =
      typeof res.message === 'string' ? res.message : 'Unable to load price';

    if (coupon && isRecoverableCouponQuoteError(msg)) {
      const resBase = await runRequest(false);
      setIsQuoting(false);
      if (resBase.status && resBase.data) {
        setQuote(mapQuoteData(resBase.data as Record<string, unknown>));
        setCouponApplyError(msg);
        setQuoteError(null);
        return;
      }
    }

    setIsQuoting(false);
    setQuoteError(msg);
    setQuote(null);
    setCouponApplyError(null);
  }, [productType, productId, coupon, userId]);

  useEffect(() => {
    if (!enabled || !productType) {
      return;
    }
    void loadQuote();
  }, [enabled, loadQuote, productType]);

  useEffect(() => {
    if (!enabled || !productType) {
      return;
    }
    let cancelled = false;
    const run = async () => {
      setBannersError(false);
      const res = await sendRequest({
        method: 'GET',
        url: `${routes.api.couponPricingBanners}?productType=${encodeURIComponent(productType)}`,
      });
      if (cancelled) {
        return;
      }
      if (res.status && Array.isArray(res.data)) {
        setPricingBanners(res.data as PricingBannerRow[]);
      } else {
        setPricingBanners([]);
        setBannersError(true);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [enabled, productType]);

  const activeBannerMatch = useMemo(() => {
    if (!coupon) {
      return null;
    }
    return (
      pricingBanners.find(
        (b) => b.code.toUpperCase() === coupon.toUpperCase(),
      ) ?? null
    );
  }, [coupon, pricingBanners]);

  const otherPricingBanners = useMemo(
    () =>
      pricingBanners.filter(
        (b) =>
          (quote?.couponCode || coupon || '').toUpperCase() !==
          b.code.toUpperCase(),
      ),
    [pricingBanners, quote?.couponCode, coupon],
  );

  return {
    quote,
    quoteError,
    couponApplyError,
    isQuoting,
    loadQuote,
    pricingBanners,
    bannersError,
    activeBannerMatch,
    otherPricingBanners,
    setCouponApplyError,
  };
};
