import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/20/solid';
import { getAccessToken } from '@tbe/auth';
import { Button, Text } from '@tbe/components';
import type { ProductType } from '@tbe/constants';
import { getProductConfig, routes } from '@tbe/constants';
import { useCashfreePayment, useUser } from '@tbe/hooks';
import { sendRequest } from '@tbe/utils';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SUPPORTED: ProductType[] = [
  'INTERVIEW_SHEET',
  'SHIKSHA',
  'PREPYATRA',
  'DSA_YATRA',
  'ONCAMPUS',
];

const SUBSCRIPTION_PRODUCT_TYPES: ProductType[] = [
  'PREPYATRA',
  'DSA_YATRA',
  'ONCAMPUS',
];

type PricingBannerRow = {
  code: string;
  discountPercentage: number;
  description: string;
  expiryDate: string;
  minimumAmount: number;
};

const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const QuoteSkeleton = () => (
  <div className='space-y-3 animate-pulse' aria-hidden>
    <div className='h-4 w-24 rounded bg-slate-200' />
    <div className='h-10 w-40 rounded-lg bg-slate-200' />
    <div className='h-3 w-full rounded bg-slate-100' />
  </div>
);

const PageSkeleton = () => (
  <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80'>
    <Head>
      <title>Checkout — The Boring Education</title>
    </Head>
    <div className='mx-auto max-w-lg px-4 py-10 sm:py-14'>
      <div className='h-96 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80' />
    </div>
  </div>
);

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

  const [couponDraft, setCouponDraft] = useState('');
  const [pricingBanners, setPricingBanners] = useState<PricingBannerRow[]>([]);
  const [bannersError, setBannersError] = useState(false);

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
    productType && SUPPORTED.includes(productType as ProductType) && productId;

  const productConfig = useMemo(
    () =>
      productType ? getProductConfig(productType) : getProductConfig('GENERAL'),
    [productType],
  );
  const ProductIcon = productConfig.icon;

  const productLabel = useMemo(() => {
    if (!productType) return 'Product';
    return getProductConfig(productType).name;
  }, [productType]);

  const loginHref = `${routes.login}?redirect=${encodeURIComponent(
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : routes.checkout,
  )}`;

  const setCouponInUrl = useCallback(
    (code: string | null) => {
      const nextQ = { ...router.query } as Record<string, string>;
      if (code) {
        nextQ.coupon = code.toUpperCase().trim();
      } else {
        delete nextQ.coupon;
      }
      void router.replace(
        { pathname: routes.checkout, query: nextQ },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  useEffect(() => {
    if (!router.isReady) return;
    const c =
      typeof router.query.coupon === 'string' ? router.query.coupon : '';
    setCouponDraft(c);
  }, [router.isReady, router.query.coupon]);

  useEffect(() => {
    if (!router.isReady || !isSupported) return;
    if (
      !productType ||
      !SUBSCRIPTION_PRODUCT_TYPES.includes(productType as ProductType)
    ) {
      setPricingBanners([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setBannersError(false);
      const res = await sendRequest({
        method: 'GET',
        url: `${routes.api.couponPricingBanners}?productType=${encodeURIComponent(productType)}`,
      });
      if (cancelled) return;
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
  }, [router.isReady, isSupported, productType]);

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

    const token = getAccessToken();
    const res = await sendRequest({
      method: 'GET',
      url: `${routes.api.paymentQuote}?${qs.toString()}`,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

  const handleApplyCoupon = () => {
    const trimmed = couponDraft.trim();
    if (!trimmed) return;
    setCouponInUrl(trimmed);
  };

  const handleRemoveCoupon = () => {
    setCouponDraft('');
    setCouponInUrl(null);
  };

  const handlePay = async () => {
    if (!user?.id || !productType || !productId || !isCashfreeLoaded) return;
    setIsPaying(true);
    setPayError(null);
    try {
      const token = getAccessToken();
      const res = await sendRequest({
        method: 'POST',
        url: routes.api.createOrder,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
          typeof res.message === 'string'
            ? res.message
            : 'Failed to create order',
        );
      }

      const { paymentSessionId, orderId } = res.data;

      const defaultNext =
        productType &&
        SUBSCRIPTION_PRODUCT_TYPES.includes(productType as ProductType)
          ? '/dashboard'
          : routes.user.dashboard;
      const next =
        nextPath && nextPath.startsWith('/') ? nextPath : defaultNext;
      const paymentStatusAbsoluteUrl = `${window.location.origin}${routes.paymentStatus}?order_id=${encodeURIComponent(orderId)}&next=${encodeURIComponent(next)}`;

      await launchPayment(
        paymentSessionId,
        () => {
          void router.replace(paymentStatusAbsoluteUrl);
        },
        () => {
          setPayError('Payment failed. You can try again.');
          setIsPaying(false);
        },
        () => {
          setIsPaying(false);
        },
        paymentStatusAbsoluteUrl,
      );
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Something went wrong');
      setIsPaying(false);
    }
  };

  const onSubmitPay = (e: FormEvent) => {
    e.preventDefault();
    if (
      !isPaying &&
      isCashfreeLoaded &&
      !!quote &&
      !quoteError &&
      user &&
      isSupported
    ) {
      void handlePay();
    }
  };

  const canPay =
    Boolean(user) &&
    !isUserLoading &&
    !isQuoting &&
    !!quote &&
    !quoteError &&
    isCashfreeLoaded;

  const primaryCtaText = (() => {
    if (isPaying) return 'Opening secure payment…';
    if (!isCashfreeLoaded) return 'Preparing checkout…';
    if (isQuoting || !quote) return 'Loading price…';
    return `Pay ${formatInr(quote.finalAmount)}`;
  })();

  if (!router.isReady) {
    return <PageSkeleton />;
  }

  if (!isSupported) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-16'>
        <Head>
          <title>Checkout — The Boring Education</title>
        </Head>
        <div className='mx-auto flex max-w-lg flex-col items-center text-center'>
          <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100'>
            <LockClosedIcon className='h-8 w-8 text-amber-600' />
          </div>
          <Text
            level='h2'
            className='mb-2 text-slate-900 font-semibold text-xl'
          >
            This checkout link is incomplete
          </Text>
          <Text level='p' className='mb-8 text-slate-600 leading-relaxed'>
            Ask for a fresh link from the page you started from. It should
            include both product type and product id in the URL.
          </Text>
          <Link href={routes.home}>
            <Button text='Go to home' variant='PRIMARY' />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-8 sm:py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]'>
      <Head>
        <title>{`Checkout — ${productLabel}`}</title>
        <meta
          name='description'
          content={`Complete your ${productLabel} purchase securely.`}
        />
      </Head>

      <main className='mx-auto w-full max-w-lg'>
        <div className='mb-4 flex items-center justify-center gap-2 text-xs text-slate-500'>
          <ShieldCheckIcon className='h-4 w-4 text-emerald-600' aria-hidden />
          <span>Secure checkout · Cashfree</span>
        </div>

        <div className='overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80'>
          <div className='border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-sky-50/50 px-5 py-5 sm:px-6 sm:py-6'>
            <div className='flex gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-indigo-100'>
                <ProductIcon className='h-6 w-6 text-indigo-600' aria-hidden />
              </div>
              <div className='min-w-0 flex-1'>
                <Text
                  level='h1'
                  className='text-lg font-semibold tracking-tight text-slate-900 sm:text-xl'
                >
                  {productLabel}
                </Text>
                <Text level='p' className='mt-1 text-sm text-slate-600'>
                  One-time payment · Instant access after confirmation
                </Text>
              </div>
            </div>
          </div>

          <div className='p-5 sm:p-6'>
            {isUserLoading ? (
              <div className='flex items-center gap-3 py-2'>
                <div
                  className='h-11 w-11 animate-pulse rounded-full bg-slate-200'
                  aria-hidden
                />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-40 animate-pulse rounded bg-slate-200' />
                  <div className='h-3 w-56 animate-pulse rounded bg-slate-100' />
                </div>
              </div>
            ) : !user ? (
              <div className='space-y-5'>
                <Text level='p' className='text-slate-700 leading-relaxed'>
                  Sign in with the account that should receive this purchase.
                </Text>
                <Link href={loginHref} className='block'>
                  <Button
                    text='Sign in to continue'
                    variant='PRIMARY'
                    className='w-full'
                  />
                </Link>
              </div>
            ) : (
              <form className='space-y-6' onSubmit={onSubmitPay}>
                <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white'>
                    {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Text
                      level='p'
                      className='truncate font-semibold text-slate-900'
                    >
                      {user.name}
                    </Text>
                    <Text level='p' className='truncate text-xs text-slate-500'>
                      {user.email}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text
                    level='h2'
                    className='mb-2 text-sm font-semibold text-slate-800'
                  >
                    Coupon
                  </Text>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-stretch'>
                    <input
                      type='text'
                      value={couponDraft}
                      onChange={(e) =>
                        setCouponDraft(e.target.value.toUpperCase())
                      }
                      placeholder='Enter code'
                      className='min-h-11 w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                      maxLength={20}
                      autoComplete='off'
                      name='coupon'
                    />
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        text='Apply'
                        variant='SECONDARY'
                        className='w-full min-h-11 sm:w-auto sm:shrink-0 sm:px-4'
                        onClick={() => void handleApplyCoupon()}
                        active
                      />
                      {coupon ? (
                        <Button
                          type='button'
                          text='Remove'
                          variant='SECONDARY'
                          className='w-full min-h-11 sm:w-auto sm:shrink-0 sm:px-4'
                          onClick={() => void handleRemoveCoupon()}
                          active
                        />
                      ) : null}
                    </div>
                  </div>
                  {productType &&
                    SUBSCRIPTION_PRODUCT_TYPES.includes(
                      productType as ProductType,
                    ) &&
                    pricingBanners.length > 0 && (
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {pricingBanners.map((b) => (
                          <button
                            key={b.code}
                            type='button'
                            onClick={() => {
                              setCouponDraft(b.code);
                              setCouponInUrl(b.code);
                            }}
                            className='rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-900 transition-colors hover:bg-indigo-100'
                          >
                            {b.code} · {b.discountPercentage}%
                          </button>
                        ))}
                      </div>
                    )}
                  {bannersError ? (
                    <p className='mt-1 text-xs text-slate-400'>
                      Offers list unavailable
                    </p>
                  ) : null}
                </div>

                <div>
                  <Text
                    level='h2'
                    className='mb-3 text-sm font-semibold text-slate-800'
                  >
                    Order summary
                  </Text>
                  <div className='rounded-xl border border-slate-200 bg-white p-4'>
                    {isQuoting ? (
                      <QuoteSkeleton />
                    ) : quoteError ? (
                      <div className='space-y-3'>
                        <Text level='p' className='text-sm text-red-600'>
                          {quoteError}
                        </Text>
                        <Button
                          type='button'
                          text='Try again'
                          variant='SECONDARY'
                          className='w-full sm:w-auto'
                          onClick={() => void loadQuote()}
                          active={!isQuoting}
                        />
                      </div>
                    ) : quote ? (
                      <div className='space-y-3'>
                        {quote.baseAmount > quote.finalAmount ? (
                          <>
                            <div className='flex items-baseline justify-between text-sm'>
                              <span className='text-slate-500'>List price</span>
                              <span className='text-slate-400 line-through'>
                                {formatInr(quote.baseAmount)}
                              </span>
                            </div>
                            <div className='flex items-baseline justify-between text-sm text-emerald-700'>
                              <span>You save</span>
                              <span className='font-medium'>
                                {formatInr(
                                  quote.baseAmount - quote.finalAmount,
                                )}
                              </span>
                            </div>
                          </>
                        ) : null}
                        {quote.couponCode ? (
                          <div className='rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900 ring-1 ring-emerald-100'>
                            Coupon &ldquo;{quote.couponCode}&rdquo; applied
                          </div>
                        ) : null}
                        <div className='flex items-end justify-between border-t border-slate-100 pt-3'>
                          <span className='text-sm font-medium text-slate-600'>
                            Total due
                          </span>
                          <span className='text-2xl font-bold tabular-nums tracking-tight text-slate-900'>
                            {formatInr(quote.finalAmount)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {(sdkError || payError) && (
                  <div
                    className='rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800'
                    role='alert'
                  >
                    {payError || sdkError}
                  </div>
                )}

                <div className='space-y-3'>
                  <Button
                    type='submit'
                    text={primaryCtaText}
                    variant='PRIMARY'
                    className='w-full py-3 text-base font-semibold shadow-sm'
                    active={canPay && !isPaying}
                    isLoading={isPaying}
                  />
                  {!isCashfreeLoaded && (
                    <Text
                      level='p'
                      className='text-center text-xs text-slate-500'
                    >
                      Loading the payment gateway — this usually takes a second.
                    </Text>
                  )}
                </div>

                <div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500'>
                  <span className='inline-flex items-center gap-1'>
                    <LockClosedIcon className='h-3.5 w-3.5' aria-hidden />
                    Encrypted checkout
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
