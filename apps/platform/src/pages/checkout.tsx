import {
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/20/solid';
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
    <div className='mx-auto max-w-5xl px-4 py-8 sm:py-12'>
      <div className='mb-8 h-5 w-32 animate-pulse rounded bg-slate-200' />
      <div className='grid gap-8 lg:grid-cols-12'>
        <div className='lg:col-span-7'>
          <div className='h-96 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80' />
        </div>
        <div className='hidden lg:block lg:col-span-5'>
          <div className='h-64 animate-pulse rounded-2xl bg-slate-200/60' />
        </div>
      </div>
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
  const trustPoints = productConfig.reasonsToBuy.slice(0, 3);

  const productLabel = useMemo(() => {
    if (!productType) return 'Product';
    return getProductConfig(productType).name;
  }, [productType]);

  const loginHref = `${routes.login}?redirect=${encodeURIComponent(
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : routes.checkout,
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

      const next =
        nextPath && nextPath.startsWith('/') ? nextPath : routes.user.dashboard;
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
    <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-[max(1.5rem,env(safe-area-inset-bottom))]'>
      <Head>
        <title>{`Checkout — ${productLabel}`}</title>
        <meta
          name='description'
          content={`Complete your ${productLabel} purchase securely.`}
        />
      </Head>

      <header className='border-b border-slate-200/80 bg-white/70 backdrop-blur-md'>
        <div className='mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:py-4'>
          <Link
            href={routes.home}
            className='inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900'
          >
            <ArrowLeftIcon className='h-4 w-4 shrink-0' aria-hidden />
            Home
          </Link>
          <div className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-100'>
            <ShieldCheckIcon className='h-4 w-4 text-emerald-600' aria-hidden />
            Secure checkout
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-4 py-8 sm:py-10'>
        <div className='grid gap-8 lg:grid-cols-12 lg:items-start'>
          {/* Primary column */}
          <div className='lg:col-span-7'>
            <div className='overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80'>
              <div className='border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-sky-50/50 px-5 py-5 sm:px-6 sm:py-6'>
                <div className='flex gap-4'>
                  <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-indigo-100'>
                    <ProductIcon
                      className='h-6 w-6 text-indigo-600'
                      aria-hidden
                    />
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
                      Sign in with the account that should receive this
                      purchase. You can share this page — each person checks out
                      on their own account.
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
                        <Text
                          level='p'
                          className='truncate text-xs text-slate-500'
                        >
                          {user.email}
                        </Text>
                      </div>
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
                                  <span className='text-slate-500'>
                                    List price
                                  </span>
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
                          Loading the payment gateway — this usually takes a
                          second.
                        </Text>
                      )}
                    </div>

                    <div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500'>
                      <span className='inline-flex items-center gap-1'>
                        <LockClosedIcon className='h-3.5 w-3.5' aria-hidden />
                        Encrypted checkout
                      </span>
                      <span className='hidden sm:inline'>·</span>
                      <span>Powered by Cashfree</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Trust / reassurance — desktop sidebar */}
          <aside className='lg:col-span-5'>
            <div className='rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-6'>
              <Text
                level='h2'
                className='mb-4 text-sm font-semibold text-slate-800'
              >
                Why learners choose this
              </Text>
              <ul className='space-y-4'>
                {trustPoints.map(({ icon: Icon, title, description }, i) => (
                  <li key={i} className='flex gap-3'>
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80'>
                      <Icon className='h-4 w-4 text-indigo-600' aria-hidden />
                    </div>
                    <div className='min-w-0'>
                      <Text
                        level='h3'
                        className='text-sm font-semibold text-slate-900'
                      >
                        {title}
                      </Text>
                      <Text
                        level='p'
                        className='mt-0.5 text-xs text-slate-600 leading-relaxed'
                      >
                        {description}
                      </Text>
                    </div>
                  </li>
                ))}
              </ul>
              <div className='mt-6 rounded-xl bg-white/80 p-4 ring-1 ring-slate-200/80'>
                <Text
                  level='p'
                  className='text-xs text-slate-600 leading-relaxed'
                >
                  After payment, we&apos;ll confirm your order and unlock
                  access. You can always review status from your dashboard.
                </Text>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
