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

import { CheckoutDiscountSection } from '../checkout/CheckoutDiscountSection';
import { CheckoutOrderSummary } from '../checkout/CheckoutOrderSummary';
import { formatInr } from '../checkout/formatters';
import { useCheckoutPricing } from '../checkout/useCheckoutPricing';

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

const PageSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div
    className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0a0a0b]' : 'bg-gradient-to-b from-slate-50 to-slate-100/80'}`}
  >
    <Head>
      <title>Checkout — The Boring Education</title>
    </Head>
    <div className='mx-auto max-w-lg px-4 py-4 sm:py-6'>
      <div
        className={`h-80 animate-pulse rounded-2xl ${isDark ? 'bg-[#0e0e0e] border border-zinc-800/80 shadow-2xl' : 'bg-white shadow-sm ring-1 ring-slate-200/80'}`}
      />
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

  const isSupported = Boolean(
    productType && SUPPORTED.includes(productType as ProductType) && productId,
  );

  const isDark = useMemo(() => {
    return productType === 'ONCAMPUS' || productType === 'DSA_YATRA';
  }, [productType]);

  // Lock body scroll on this page only — restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const {
    quote,
    quoteError,
    couponApplyError,
    isQuoting,
    loadQuote,
    bannersError,
    activeBannerMatch,
    otherPricingBanners,
  } = useCheckoutPricing({
    productType,
    productId,
    coupon,
    userId: user?.id,
    enabled: Boolean(router.isReady && isSupported),
  });

  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

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

  const handleApplyCoupon = () => {
    const trimmed = couponDraft.trim();
    if (!trimmed) return;
    setCouponInUrl(trimmed);
  };

  const handleRemoveCoupon = () => {
    setCouponDraft('');
    setCouponInUrl(null);
  };

  const handleUseOffer = (code: string) => {
    setCouponDraft(code);
    setCouponInUrl(code);
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
          ...(quote?.couponCode ? { couponCode: quote.couponCode } : {}),
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

  const isUrlDark = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search;
    return search.includes('ONCAMPUS') || search.includes('DSA_YATRA');
  }, []);

  if (!router.isReady) {
    return <PageSkeleton isDark={isUrlDark} />;
  }

  if (!isSupported) {
    return (
      <div
        className={`min-h-screen px-4 py-16 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0b] text-zinc-100' : 'bg-gradient-to-b from-slate-50 to-slate-100'}`}
      >
        <Head>
          <title>Checkout — The Boring Education</title>
        </Head>
        <div className='mx-auto flex max-w-lg flex-col items-center text-center'>
          <div
            className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${isDark ? 'bg-zinc-900/60 ring-1 ring-zinc-800' : 'bg-amber-50 ring-1 ring-amber-100'}`}
          >
            <LockClosedIcon
              className={`h-8 w-8 ${isDark ? 'text-[#FF5757]' : 'text-amber-600'}`}
            />
          </div>
          <Text
            level='h2'
            className={`mb-2 font-semibold text-xl ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}
          >
            This checkout link is incomplete
          </Text>
          <Text
            level='p'
            className={`mb-8 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
          >
            Ask for a fresh link from the page you started from. It should
            include both product type and product id in the URL.
          </Text>
          <Link href={routes.home}>
            {isDark ? (
              <button
                type='button'
                className='py-2.5 px-6 text-sm font-semibold rounded-xl text-white transition-all duration-200 active:scale-[0.98] shadow-md cursor-pointer'
                style={{ backgroundColor: '#FF5757' }}
              >
                Go to home
              </button>
            ) : (
              <Button text='Go to home' variant='PRIMARY' />
            )}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-screen items-center justify-center overflow-hidden px-3 transition-colors duration-300 ${
        isDark
          ? 'bg-[#0a0a0b] text-zinc-100'
          : 'bg-gradient-to-b from-slate-50 via-white to-slate-50'
      }`}
    >
      <Head>
        <title>{`Checkout — ${productLabel}`}</title>
        <meta
          name='description'
          content={`Complete your ${productLabel} purchase securely.`}
        />
        <style>{`html, body { overflow: hidden !important; }`}</style>
      </Head>

      {isDark && (
        <div
          aria-hidden
          className='pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full blur-[120px]'
          style={{
            backgroundColor: 'rgba(255,87,87,0.10)',
          }}
        />
      )}

      <main className='relative z-10 mx-auto w-full max-w-sm overflow-y-auto max-h-[calc(100vh-2rem)] py-3'>
        <div
          className={`mb-1 flex items-center justify-center gap-1.5 text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
        >
          <ShieldCheckIcon
            className={`h-3 w-3 ${isDark ? 'text-[#FF5757]' : 'text-emerald-600'}`}
            aria-hidden
          />
          <span>Secure checkout · Cashfree</span>
        </div>

        <div
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
            isDark
              ? 'border border-zinc-800/80 bg-[#0e0e0e]/95 backdrop-blur-xl shadow-2xl'
              : 'bg-white shadow-sm ring-1 ring-slate-200/80'
          }`}
        >
          <div
            className={`border-b px-3 py-2 ${
              isDark
                ? 'border-zinc-800/60 bg-gradient-to-r from-zinc-900/50 to-zinc-900/20'
                : 'border-slate-100 bg-gradient-to-r from-indigo-50/80 to-sky-50/50'
            }`}
          >
            <div className='flex items-center gap-2'>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                  isDark
                    ? 'bg-zinc-800/80 ring-1 ring-zinc-700/60'
                    : 'bg-white shadow-sm ring-1 ring-indigo-100'
                }`}
              >
                <ProductIcon
                  className={`h-3.5 w-3.5 ${isDark ? 'text-[#FF5757]' : 'text-indigo-600'}`}
                  aria-hidden
                />
              </div>
              <div className='min-w-0 flex-1'>
                <Text
                  level='h1'
                  className={`text-xs font-semibold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}
                >
                  {productLabel}
                </Text>
                <Text
                  level='p'
                  className={`text-[9px] leading-tight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}
                >
                  One-time · Instant access
                </Text>
              </div>
            </div>
          </div>

          <div className='p-2.5'>
            {isUserLoading ? (
              <div className='flex items-center gap-3 py-2'>
                <div
                  className={`h-9 w-9 animate-pulse rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
                  aria-hidden
                />
                <div className='flex-1 space-y-1.5'>
                  <div
                    className={`h-3.5 w-32 animate-pulse rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
                  />
                  <div
                    className={`h-2.5 w-48 animate-pulse rounded ${isDark ? 'bg-zinc-800/60' : 'bg-slate-100'}`}
                  />
                </div>
              </div>
            ) : !user ? (
              <div className='space-y-4'>
                <Text
                  level='p'
                  className={`leading-relaxed text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}
                >
                  Sign in with the account that should receive this purchase.
                </Text>
                <Link href={loginHref} className='block'>
                  {isDark ? (
                    <button
                      type='button'
                      className='w-full py-2.5 px-4 text-xs font-semibold rounded-xl text-white transition-all duration-200 active:scale-[0.98] shadow-md cursor-pointer'
                      style={{ backgroundColor: '#FF5757' }}
                    >
                      Sign in to continue
                    </button>
                  ) : (
                    <Button
                      text='Sign in to continue'
                      variant='PRIMARY'
                      className='w-full py-2 text-xs'
                    />
                  )}
                </Link>
              </div>
            ) : (
              <form className='space-y-2' onSubmit={onSubmitPay}>
                <div
                  className={`flex items-center gap-1.5 rounded-md border p-1 ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900/40'
                      : 'border-slate-200 bg-slate-50/80'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${
                      isDark ? 'bg-[#FF5757]' : 'bg-indigo-600'
                    }`}
                  >
                    {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Text
                      level='p'
                      className={`truncate text-[11px] font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}
                    >
                      {user.name}
                    </Text>
                    <Text
                      level='p'
                      className={`truncate text-[9px] leading-none ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
                    >
                      {user.email}
                    </Text>
                  </div>
                </div>

                <CheckoutDiscountSection
                  couponDraft={couponDraft}
                  onCouponDraftChange={setCouponDraft}
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  hasCouponInUrl={Boolean(coupon)}
                  quote={quote}
                  couponApplyError={couponApplyError}
                  activeBannerMatch={activeBannerMatch}
                  otherPricingBanners={otherPricingBanners}
                  bannersError={bannersError}
                  onUseOffer={handleUseOffer}
                  isDark={isDark}
                />

                <CheckoutOrderSummary
                  isQuoting={isQuoting}
                  quote={quote}
                  quoteError={quoteError}
                  onRetry={loadQuote}
                  isDark={isDark}
                />

                {(sdkError || payError) && (
                  <div
                    className={`rounded border px-2 py-1.5 text-[11px] ${
                      isDark
                        ? 'border-red-950 bg-red-950/20 text-red-400'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                    role='alert'
                  >
                    {payError || sdkError}
                  </div>
                )}

                <div className='space-y-1.5'>
                  {isDark ? (
                    <button
                      type='submit'
                      disabled={!canPay || isPaying}
                      className='w-full py-2 px-4 text-xs font-semibold rounded-lg text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(255,87,87,0.15)] hover:shadow-[0_0_22px_rgba(255,87,87,0.3)] cursor-pointer'
                      style={{
                        backgroundColor: '#FF5757',
                      }}
                    >
                      {isPaying ? (
                        <span className='flex items-center justify-center gap-2'>
                          <svg
                            className='animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            />
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            />
                          </svg>
                          {primaryCtaText}
                        </span>
                      ) : (
                        primaryCtaText
                      )}
                    </button>
                  ) : (
                    <Button
                      type='submit'
                      text={primaryCtaText}
                      variant='PRIMARY'
                      className='w-full py-2 text-xs font-semibold shadow-sm'
                      active={canPay && !isPaying}
                      isLoading={isPaying}
                    />
                  )}
                  {!isCashfreeLoaded && (
                    <Text
                      level='p'
                      className={`text-center text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
                    >
                      Loading payment gateway…
                    </Text>
                  )}
                </div>

                <div
                  className={`flex items-center justify-center gap-1 text-[10px] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}
                >
                  <LockClosedIcon
                    className={`h-2.5 w-2.5 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}
                    aria-hidden
                  />
                  <span>Encrypted checkout</span>
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
