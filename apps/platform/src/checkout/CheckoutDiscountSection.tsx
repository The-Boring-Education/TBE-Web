import { Button, Text } from '@tbe/components';

import { shouldShowCheckoutApplyButton } from './checkoutCouponApplyVisibility';
import { formatInr, formatRelativeEnd, formatShortDate } from './formatters';
import type { CheckoutQuote, PricingBannerRow } from './types';

type CheckoutDiscountSectionProps = {
  couponDraft: string;
  onCouponDraftChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  hasCouponInUrl: boolean;
  quote: CheckoutQuote | null;
  couponApplyError: string | null;
  activeBannerMatch: PricingBannerRow | null;
  otherPricingBanners: PricingBannerRow[];
  bannersError: boolean;
  onUseOffer: (code: string) => void;
};

export const CheckoutDiscountSection = ({
  couponDraft,
  onCouponDraftChange,
  onApply,
  onRemove,
  hasCouponInUrl,
  quote,
  couponApplyError,
  activeBannerMatch,
  otherPricingBanners,
  bannersError,
  onUseOffer,
}: CheckoutDiscountSectionProps) => {
  const showApplyButton = shouldShowCheckoutApplyButton(
    quote?.couponCode,
    couponDraft,
    couponApplyError,
  );

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <Text level='h2' className='text-sm font-semibold text-slate-900'>
        Discount code
      </Text>
      <p className='mt-1 text-xs text-slate-500'>
        Optional. Type a code, or use another offer below.
      </p>

      <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-center'>
        <label className='sr-only' htmlFor='checkout-coupon-code'>
          Coupon code
        </label>
        <input
          id='checkout-coupon-code'
          type='text'
          value={couponDraft}
          onChange={(e) => onCouponDraftChange(e.target.value.toUpperCase())}
          placeholder='Enter Code'
          className='h-10 w-full min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300'
          maxLength={20}
          autoComplete='off'
          name='coupon'
        />
        <div className='flex w-full items-center gap-2 sm:w-auto sm:shrink-0'>
          {showApplyButton ? (
            <Button
              type='button'
              text='Apply'
              variant='PRIMARY'
              className='h-10 min-w-[4.5rem] px-4'
              onClick={onApply}
              active
            />
          ) : null}
          {hasCouponInUrl ? (
            <button
              type='button'
              onClick={onRemove}
              className='h-10 shrink-0 px-2 text-sm text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-800'
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {couponApplyError ? (
        <p className='mt-2 text-sm text-red-600' role='alert'>
          {couponApplyError}
        </p>
      ) : null}

      {quote?.couponCode && !couponApplyError ? (
        <p className='mt-3 text-sm text-slate-800' role='status'>
          <span className='mr-1.5 text-emerald-600' aria-hidden>
            ✓
          </span>
          <span className='font-mono font-semibold text-slate-900'>
            {quote.couponCode}
          </span>
          {(() => {
            const pct =
              quote.couponDiscountPercentage ??
              activeBannerMatch?.discountPercentage;
            const minVal =
              quote.couponMinimumAmount ??
              activeBannerMatch?.minimumAmount ??
              0;
            const blurb = [
              quote.couponDescription || activeBannerMatch?.description,
              pct != null ? `${pct}% off` : null,
              minVal > 0 ? `min ${formatInr(minVal)}` : null,
            ].filter(Boolean);
            return blurb.length > 0 ? (
              <span className='text-slate-600'> — {blurb.join(' · ')}</span>
            ) : null;
          })()}
        </p>
      ) : null}
      {quote?.couponCode &&
        !couponApplyError &&
        quote.baseAmount === quote.finalAmount && (
          <p className='mt-1.5 text-xs text-amber-800/90'>
            This order may not get a price cut (e.g. below minimum or not valid
            for this plan). You can still check out.
          </p>
        )}

      {otherPricingBanners.length > 0 ? (
        <div className='mt-4 border-t border-slate-100 pt-4'>
          <p className='mb-2 text-xs font-medium text-slate-600'>More offers</p>
          <ul className='space-y-2'>
            {otherPricingBanners.map((b) => (
              <li
                key={b.code}
                className='flex items-start justify-between gap-3 rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2.5'
              >
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-slate-900'>
                    {b.description?.trim() || `${b.discountPercentage}% off`}
                  </p>
                  <p
                    className='mt-0.5 text-xs text-slate-500'
                    title={formatShortDate(b.expiryDate)}
                  >
                    <span className='font-mono'>{b.code}</span>
                    {' · '}
                    {b.discountPercentage}% off
                    {' · '}
                    {formatRelativeEnd(b.expiryDate)}
                    {b.minimumAmount > 0
                      ? ` · min ${formatInr(b.minimumAmount)}`
                      : ''}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => onUseOffer(b.code)}
                  className='shrink-0 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900'
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {bannersError ? (
        <p className='mt-3 text-xs text-slate-500'>
          Offers couldn&apos;t load; you can still type a code.
        </p>
      ) : null}
    </div>
  );
};
