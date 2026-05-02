import { Button, LoadingSpinner, Text } from '@tbe/components';
import { routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import { resolvePaymentSuccessContinueHref, sendRequest } from '@tbe/utils';
import Lottie from 'lottie-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import successAnimation from '../../../public/animations/payment-success.json';

const AUTO_REDIRECT_SECONDS = 5;

const PaymentStatusPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const orderId = router.query.order_id as string | undefined;
  const nextPath = router.query.next as string | undefined;

  const [state, setState] = useState<
    'idle' | 'loading' | 'success' | 'pending' | 'error'
  >('idle');
  const [detail, setDetail] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [orderProductType, setOrderProductType] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setOrderProductType(undefined);
  }, [orderId]);

  useEffect(() => {
    if (!router.isReady || !orderId || !user?.id) return;

    const run = async () => {
      setState('loading');
      const res = await sendRequest({
        method: 'GET',
        url: `${routes.api.paymentOrderStatus}?orderId=${encodeURIComponent(orderId)}&userId=${encodeURIComponent(user.id)}`,
      });

      if (!res.status || !res.data) {
        setOrderProductType(undefined);
        setState('error');
        setDetail(
          typeof res.message === 'string'
            ? res.message
            : 'Unable to verify payment',
        );
        return;
      }

      const status = res.data.paymentStatus as string;
      setOrderProductType(
        typeof res.data.productType === 'string'
          ? res.data.productType
          : undefined,
      );
      if (status === 'SUCCESS') {
        setState('success');
        // Delay showing text content for animation to play
        setTimeout(() => setShowContent(true), 800);
      } else if (status === 'PENDING') {
        setState('pending');
        setShowContent(true);
      } else {
        setState('error');
        setDetail('Payment was not completed.');
        setShowContent(true);
      }
    };

    void run();
  }, [router.isReady, orderId, user?.id, refetchKey]);

  const continueHref = useMemo(
    () =>
      resolvePaymentSuccessContinueHref({
        nextQuery: nextPath,
        productType: orderProductType,
        platformFallbackPath: routes.user.dashboard,
      }),
    [nextPath, orderProductType],
  );

  // Auto-redirect countdown after payment success
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoRedirect = useCallback(() => {
    setCountdown(AUTO_REDIRECT_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (state === 'success' && showContent) {
      startAutoRedirect();
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [state, showContent, startAutoRedirect]);

  useEffect(() => {
    if (countdown === 0 && state === 'success' && showContent) {
      router.push(continueHref);
    }
  }, [countdown, state, showContent, continueHref, router]);

  return (
    <>
      <Head>
        <title>Payment status — The Boring Education</title>
      </Head>
      <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center px-4 py-12'>
        <div className='w-full max-w-md text-center'>
          {userLoading ? (
            <div className='rounded-2xl bg-white shadow-sm border border-slate-200 p-8'>
              <div className='animate-pulse space-y-4'>
                <div className='h-16 w-16 rounded-full bg-slate-200 mx-auto' />
                <div className='h-4 w-32 rounded bg-slate-200 mx-auto' />
              </div>
            </div>
          ) : !user ? (
            <div className='rounded-2xl bg-white shadow-sm border border-slate-200 p-8'>
              <Text
                level='h2'
                className='text-lg font-semibold text-slate-900 mb-2'
              >
                Sign in to view payment status
              </Text>
              <Link
                href={`${routes.login}?redirect=${encodeURIComponent(
                  typeof window !== 'undefined'
                    ? window.location.pathname + window.location.search
                    : routes.paymentStatus,
                )}`}
              >
                <Button
                  text='Sign in'
                  variant='PRIMARY'
                  className='w-full mt-4'
                />
              </Link>
            </div>
          ) : !orderId ? (
            <div className='rounded-2xl bg-white shadow-sm border border-slate-200 p-8'>
              <Text level='p' className='text-slate-600'>
                Missing order reference. Open the link from your payment
                confirmation email or history.
              </Text>
            </div>
          ) : state === 'loading' || state === 'idle' ? (
            <div className='rounded-2xl bg-white shadow-sm border border-slate-200 p-8'>
              <div className='flex flex-col items-center gap-4'>
                <LoadingSpinner height={10} width={10} />
                <Text level='p' className='text-slate-600 font-medium'>
                  Verifying your payment…
                </Text>
                <Text level='p' className='text-slate-400 text-xs'>
                  This usually takes just a few seconds
                </Text>
              </div>
            </div>
          ) : state === 'success' ? (
            <div className='space-y-4'>
              {/* Lottie success animation */}
              <div className='flex justify-center'>
                <Lottie
                  animationData={successAnimation}
                  loop={false}
                  className='w-40 h-40'
                />
              </div>

              {showContent && (
                <div className='rounded-2xl bg-white shadow-lg border border-emerald-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                  <div className='inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full mb-4'>
                    <svg
                      className='w-3.5 h-3.5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2.5}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    PAYMENT CONFIRMED
                  </div>

                  <Text
                    level='h2'
                    className='text-2xl font-bold text-slate-900 mb-2'
                  >
                    You&apos;re all set! 🎉
                  </Text>
                  <Text level='p' className='text-slate-600 mb-4 leading-relaxed'>
                    Your purchase is confirmed and access has been unlocked.
                  </Text>

                  <div className='text-left rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 mb-4'>
                    <Text level='p' className='text-sm font-semibold text-slate-800'>
                      What&apos;s coming next
                    </Text>
                    <ul className='mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside'>
                      <li>Personalized learning dashboard</li>
                      <li>Ready-to-start roadmap</li>
                      <li>Progress tracking and streaks</li>
                    </ul>
                  </div>

                  <Text
                    level='p'
                    className='text-slate-500 text-sm font-medium'
                    aria-live='polite'
                    aria-atomic='true'
                  >
                    Taking you there in {countdown}s…
                  </Text>
                </div>
              )}
            </div>
          ) : state === 'pending' ? (
            <div className='rounded-2xl bg-white shadow-sm border border-amber-100 p-8'>
              <div className='w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-7 h-7 text-amber-600 animate-pulse'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>

              <Text
                level='h2'
                className='text-lg font-semibold text-amber-800 mb-2'
              >
                Payment pending
              </Text>
              <Text level='p' className='text-slate-600 mb-5 leading-relaxed'>
                We are still confirming this with the bank. Refresh in a minute
                or check your email for the confirmation.
              </Text>
              <Button
                text='Refresh Status'
                variant='SECONDARY'
                className='w-full'
                onClick={() => setRefetchKey((k) => k + 1)}
              />
            </div>
          ) : (
            <div className='rounded-2xl bg-white shadow-sm border border-red-100 p-8'>
              <div className='w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-7 h-7 text-red-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </div>

              <Text
                level='h2'
                className='text-lg font-semibold text-red-800 mb-2'
              >
                Could not verify payment
              </Text>
              {detail ? (
                <Text level='p' className='text-slate-600 mb-5'>
                  {detail}
                </Text>
              ) : null}
              <Link href={routes.checkout}>
                <Button
                  text='Back to checkout'
                  variant='PRIMARY'
                  className='w-full'
                />
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default PaymentStatusPage;
