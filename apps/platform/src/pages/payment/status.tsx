import { Button, Text } from '@tbe/components';
import { routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import { sendRequest } from '@tbe/utils';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const PaymentStatusPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const orderId = router.query.order_id as string | undefined;
  const nextPath = router.query.next as string | undefined;

  const [state, setState] = useState<
    'idle' | 'loading' | 'success' | 'pending' | 'error'
  >('idle');
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !orderId || !user?.id) return;

    const run = async () => {
      setState('loading');
      const res = await sendRequest({
        method: 'GET',
        url: `${routes.api.paymentOrderStatus}?orderId=${encodeURIComponent(orderId)}&userId=${encodeURIComponent(user.id)}`,
      });

      if (!res.status || !res.data) {
        setState('error');
        setDetail(
          typeof res.message === 'string' ? res.message : 'Unable to verify payment',
        );
        return;
      }

      const status = res.data.paymentStatus as string;
      if (status === 'SUCCESS') {
        setState('success');
      } else if (status === 'PENDING') {
        setState('pending');
      } else {
        setState('error');
        setDetail('Payment was not completed.');
      }
    };

    void run();
  }, [router.isReady, orderId, user?.id]);

  const safeNext =
    nextPath && nextPath.startsWith('/') ? nextPath : routes.user.dashboard;

  return (
    <>
      <Head>
        <title>Payment status — The Boring Education</title>
      </Head>
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
          {userLoading ? (
            <Text level="p" className="text-slate-600">
              Loading…
            </Text>
          ) : !user ? (
            <>
              <Text level="h2" className="text-lg font-semibold text-slate-900 mb-2">
                Sign in to view payment status
              </Text>
              <Link
                href={`${routes.login}?redirect=${encodeURIComponent(
                  typeof window !== 'undefined'
                    ? window.location.pathname + window.location.search
                    : routes.paymentStatus,
                )}`}
              >
                <Button text="Sign in" variant="PRIMARY" className="w-full mt-4" />
              </Link>
            </>
          ) : !orderId ? (
            <Text level="p" className="text-slate-600">
              Missing order reference. Open the link from your payment confirmation
              email or history.
            </Text>
          ) : state === 'loading' || state === 'idle' ? (
            <Text level="p" className="text-slate-600">
              Verifying your payment…
            </Text>
          ) : state === 'success' ? (
            <>
              <Text level="h2" className="text-xl font-semibold text-green-800 mb-2">
                Payment successful
              </Text>
              <Text level="p" className="text-slate-600 mb-6">
                Your purchase is confirmed. It may take a moment for access to
                unlock everywhere.
              </Text>
              <Link href={safeNext}>
                <Button text="Continue" variant="PRIMARY" className="w-full" />
              </Link>
            </>
          ) : state === 'pending' ? (
            <>
              <Text level="h2" className="text-lg font-semibold text-amber-800 mb-2">
                Payment pending
              </Text>
              <Text level="p" className="text-slate-600 mb-4">
                We are still confirming this with the bank. Refresh in a minute
                or check your email.
              </Text>
              <Button
                text="Refresh"
                variant="SECONDARY"
                className="w-full"
                onClick={() => router.replace(router.asPath)}
              />
            </>
          ) : (
            <>
              <Text level="h2" className="text-lg font-semibold text-red-800 mb-2">
                Could not verify payment
              </Text>
              {detail ? (
                <Text level="p" className="text-slate-600 mb-4">
                  {detail}
                </Text>
              ) : null}
              <Link href={routes.checkout}>
                <Button text="Back to checkout" variant="PRIMARY" className="w-full" />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentStatusPage;
