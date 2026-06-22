import { Button, Text } from '@tbe/components';

import { formatInr } from './formatters';
import type { CheckoutQuote } from './types';

const QuoteSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className='space-y-1.5 animate-pulse' aria-hidden>
    <div
      className={`h-3.5 w-20 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
    />
    <div
      className={`h-5 w-28 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
    />
  </div>
);

type CheckoutOrderSummaryProps = {
  isQuoting: boolean;
  quote: CheckoutQuote | null;
  quoteError: string | null;
  onRetry: () => void;
  isDark?: boolean;
};

export const CheckoutOrderSummary = ({
  isQuoting,
  quote,
  quoteError,
  onRetry,
  isDark = false,
}: CheckoutOrderSummaryProps) => {
  return (
    <div>
      <Text
        level='h2'
        className={`mb-0.5 text-[9px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
      >
        Order summary
      </Text>
      <div
        className={`rounded-lg border p-1.5 ${isDark ? 'border-zinc-800/80 bg-zinc-900/30' : 'border-slate-200 bg-white'}`}
      >
        {isQuoting ? (
          <QuoteSkeleton isDark={isDark} />
        ) : quoteError && !quote ? (
          <div className='space-y-2'>
            <Text
              level='p'
              className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}
            >
              {quoteError}
            </Text>
            {isDark ? (
              <button
                type='button'
                onClick={() => void onRetry()}
                className='w-full sm:w-auto px-3 py-1.5 text-[10px] font-semibold rounded-md text-white transition-all bg-zinc-800 hover:bg-zinc-700 ring-1 ring-zinc-700/60 cursor-pointer disabled:opacity-50'
                disabled={isQuoting}
              >
                Try again
              </button>
            ) : (
              <Button
                type='button'
                text='Try again'
                variant='SECONDARY'
                className='w-full sm:w-auto py-1 text-[10px]'
                onClick={() => void onRetry()}
                active={!isQuoting}
              />
            )}
          </div>
        ) : quote ? (
          <div className='space-y-0.5'>
            {quote.baseAmount > quote.finalAmount ? (
              <>
                <div className='flex items-baseline justify-between text-[10px]'>
                  <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                    Subtotal (list price)
                  </span>
                  <span
                    className={`line-through ${isDark ? 'text-zinc-650' : 'text-slate-400'}`}
                  >
                    {formatInr(quote.baseAmount)}
                  </span>
                </div>
                <div
                  className={`flex items-baseline justify-between text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
                >
                  <span>You save</span>
                  <span className='font-medium'>
                    {formatInr(quote.baseAmount - quote.finalAmount)}
                  </span>
                </div>
              </>
            ) : null}
            <div
              className={`flex items-end justify-between border-t pt-1 ${isDark ? 'border-zinc-800/60' : 'border-slate-100'}`}
            >
              <span
                className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}
              >
                Total due
              </span>
              <span
                className={`text-sm font-bold tabular-nums tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}
              >
                {formatInr(quote.finalAmount)}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
