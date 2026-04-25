import { Button, Text } from '@tbe/components';

import { formatInr } from './formatters';
import type { CheckoutQuote } from './types';

const QuoteSkeleton = () => (
  <div className='space-y-3 animate-pulse' aria-hidden>
    <div className='h-4 w-24 rounded bg-slate-200' />
    <div className='h-10 w-40 rounded-lg bg-slate-200' />
    <div className='h-3 w-full rounded bg-slate-100' />
  </div>
);

type CheckoutOrderSummaryProps = {
  isQuoting: boolean;
  quote: CheckoutQuote | null;
  quoteError: string | null;
  onRetry: () => void;
};

export const CheckoutOrderSummary = ({
  isQuoting,
  quote,
  quoteError,
  onRetry,
}: CheckoutOrderSummaryProps) => {
  return (
    <div>
      <Text level='h2' className='mb-3 text-sm font-semibold text-slate-800'>
        Order summary
      </Text>
      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        {isQuoting ? (
          <QuoteSkeleton />
        ) : quoteError && !quote ? (
          <div className='space-y-3'>
            <Text level='p' className='text-sm text-red-600'>
              {quoteError}
            </Text>
            <Button
              type='button'
              text='Try again'
              variant='SECONDARY'
              className='w-full sm:w-auto'
              onClick={() => void onRetry()}
              active={!isQuoting}
            />
          </div>
        ) : quote ? (
          <div className='space-y-3'>
            {quote.baseAmount > quote.finalAmount ? (
              <>
                <div className='flex items-baseline justify-between text-sm'>
                  <span className='text-slate-500'>Subtotal (list price)</span>
                  <span className='text-slate-400 line-through'>
                    {formatInr(quote.baseAmount)}
                  </span>
                </div>
                <div className='flex items-baseline justify-between text-sm text-emerald-700'>
                  <span>You save</span>
                  <span className='font-medium'>
                    {formatInr(quote.baseAmount - quote.finalAmount)}
                  </span>
                </div>
              </>
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
  );
};
