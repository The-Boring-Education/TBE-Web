import { Button, Text } from '@tbe/components';
import { getProductConfig, routes } from '@tbe/constants';
import type { ProductType } from '@tbe/constants';
import { useCashfreePayment, useUser } from '@tbe/hooks';
import { sendRequest } from '@tbe/utils';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

const SUPPORTED: ProductType[] = [
  'INTERVIEW_SHEET',
  'SHIKSHA',
  'PREPYATRA',
  'DSA_YATRA',
  'ONCAMPUS',
];

const CheckoutPage = () => {
  const router = useRouter();
  const { user, loading: isUserLoading } = useUser();
  const {
    isCashfreeLoaded,
    error: sdkError,
    launchPayment,
  } = useCashfreePayment();

  const productType = router.query.productType as string | undefined;
  const productId = router.query.productId as string | undefined;
  const coupon = router.query.coupon as string | undefined;
  const nextPath = router.query.next as string | undefined;

  const [quote, setQuote] = useState<{
    baseAmount: number;
    finalAmount: number;
    couponCode?: string;
  } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const isSupported =
    productType &&
    SUPPORTED.includes(productType as ProductType) &&
    productId;

  const productLabel = useMemo(() => {
    if (!productType) return 'Product';
    return getProductConfig(productType).name;
  }, [productType]);

  const loginHref = `${routes.login}?redirect=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.pathname + window.location.search : routes.checkout,
  )}`;

  const loadQuote = useCallback(async () => {
    if (!productType || !productId) return;
    setIsQuoting(true);
    setQuoteError(null);
    const qs = new URLSearchParams({
      productType,
      productId,
    });
    if (coupon) qs.set('coupon', coupon);
    if (user?.id) qs.set('userId', user.id);

    const res = await sendRequest({
      method: 'GET',
      url: `${routes.api.paymentQuote}?${qs.toString()}`,
    });

    setIsQuoting(false);
    if (!res.status || !res.data) {
      setQuoteError(
        typeof res.message === 'string' ? res.message : 'Unable to load price',
      );
      setQuote(null);
      return;
    }
    setQuote({
      baseAmount: res.data.baseAmount,
      finalAmount: res.data.finalAmount,
      couponCode: res.data.couponCode,
    });
  }, [productType, productId, coupon, user?.id]);

  useEffect(() => {
    if (!router.isReady || !isSupported) return;
    void loadQuote();
  }, [router.isReady, isSupported, loadQuote]);

  const handlePay = async () => {
    if (!user?.id || !productType || !productId || !isCashfreeLoaded) return;
    setIsPaying(true);
    setPayError(null);
    try {
      const res = await sendRequest({
        method: 'POST',
        url: routes.api.createOrder,
        body: {
          userId: user.id,
          productId,
          productType,
          customerName: user.name,
          customerEmail: user.email,
          ...(coupon ? { couponCode: coupon } : {}),
        },
      });

      if (!res.status || !res.data?.paymentSessionId || !res.data?.orderId) {
        throw new Error(
          typeof res.message === 'string' ? res.message : 'Failed to create order',
        );
      }

      const { paymentSessionId, orderId } = res.data;

      await launchPayment(
        paymentSessionId,
        () => {
          const next =
            nextPath && nextPath.startsWith('/') ? nextPath : routes.user.dashboard;
          router.replace(
            `${routes.paymentStatus}?order_id=${encodeURIComponent(orderId)}&next=${encodeURIComponent(next)}`,
          );
        },
        () => {
          setPayError('Payment failed. You can try again.');
          setIsPaying(false);
        },
        () => {
          setIsPaying(false);
        },
      );
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Something went wrong');
      setIsPaying(false);
    }
  };

  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Head>
          <title>Checkout — The Boring Education</title>
        </Head>
        <Text level="p" className="text-slate-600">
          Loading…
        </Text>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <Head>
          <title>Checkout — The Boring Education</title>
        </Head>
        <Text level="h2" className="text-slate-900 font-semibold mb-2">
          Invalid checkout link
        </Text>
        <Text level="p" className="text-slate-600 text-center max-w-md mb-6">
          Add productType and productId to the URL. Example: interview sheet
          checkout includes your sheet id.
        </Text>
        <Link href={routes.home}>
          <Button text="Back to home" variant="PRIMARY" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Head>
        <title>{`Checkout — ${productLabel}`}</title>
      </Head>

      <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-slate-200 p-6 sm:p-8">
        <Text level="h1" className="text-xl font-semibold text-slate-900 mb-1">
          {productLabel}
        </Text>
        <Text level="p" className="text-sm text-slate-500 mb-6">
          Secure payment via Cashfree
        </Text>

        {isUserLoading ? (
          <Text level="p" className="text-slate-600">
            Checking your session…
          </Text>
        ) : !user ? (
          <div className="space-y-4">
            <Text level="p" className="text-slate-700">
              Sign in to continue checkout. Share this page — each person pays
              on their own account.
            </Text>
            <Link href={loginHref}>
              <Button text="Sign in to pay" variant="PRIMARY" className="w-full" />
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-6">
              {isQuoting ? (
                <Text level="p" className="text-slate-600">
                  Loading price…
                </Text>
              ) : quoteError ? (
                <Text level="p" className="text-red-600 text-sm">
                  {quoteError}
                </Text>
              ) : quote ? (
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-600">Total</span>
                  <span className="text-2xl font-bold text-slate-900">
                    ₹{quote.finalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : null}
              {quote && quote.couponCode ? (
                <Text level="p" className="text-xs text-green-700 mt-2">
                  Coupon {quote.couponCode} applied
                </Text>
              ) : null}
            </div>

            {(sdkError || payError) && (
              <div className="mb-4 text-sm text-red-600">
                {payError || sdkError}
              </div>
            )}

            <Button
              text={isPaying ? 'Processing…' : 'Pay now'}
              variant="PRIMARY"
              className="w-full"
              onClick={() => void handlePay()}
              active={!isPaying && isCashfreeLoaded && !!quote && !quoteError}
              isLoading={isPaying}
            />

            {!isCashfreeLoaded && (
              <Text level="p" className="text-center text-xs text-slate-500 mt-3">
                Loading payment gateway…
              </Text>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
