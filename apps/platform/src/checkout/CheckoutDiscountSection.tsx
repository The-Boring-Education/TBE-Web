import { Text } from '@tbe/components';

import { shouldShowCheckoutApplyButton } from './checkoutCouponApplyVisibility';
import { formatInr, formatShortDate } from './formatters';
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
  isDark?: boolean;
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
  isDark = false,
}: CheckoutDiscountSectionProps) => {
  const showApplyButton = shouldShowCheckoutApplyButton(
    quote?.couponCode,
    couponDraft,
    couponApplyError,
  );

  return (
    <div
      className={`rounded-lg border p-1.5 ${isDark ? 'border-zinc-800/80 bg-zinc-900/30' : 'border-slate-200 bg-white'}`}
    >
      <Text
        level='h2'
        className={`text-[9px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
      >
        Promo code
      </Text>

      {/* Sleek pill input row */}
      <div
        className={`mt-0.5 flex h-6 items-center overflow-hidden rounded-md border ${
          isDark
            ? 'border-zinc-700 bg-zinc-800/60'
            : 'border-slate-200 bg-white'
        }`}
      >
        <label className='sr-only' htmlFor='checkout-coupon-code'>
          Coupon code
        </label>
        <input
          id='checkout-coupon-code'
          type='text'
          value={couponDraft}
          onChange={(e) => onCouponDraftChange(e.target.value.toUpperCase())}
          placeholder='Enter promo code'
          className={`h-full flex-1 min-w-0 bg-transparent px-2 text-[10px] font-mono tracking-wider focus:outline-none ${
            isDark
              ? 'text-zinc-100 placeholder:text-zinc-600'
              : 'text-slate-800 placeholder:text-slate-400'
          }`}
          maxLength={20}
          autoComplete='off'
          name='coupon'
        />
        {showApplyButton && (
          <button
            type='button'
            onClick={onApply}
            className={`h-full shrink-0 border-l px-2 text-[10px] font-semibold transition-colors ${
              isDark
                ? 'border-zinc-700 bg-zinc-800 text-[#FF5757] hover:bg-zinc-750'
                : 'border-slate-200 bg-slate-50 text-indigo-600 hover:bg-slate-100'
            }`}
          >
            Apply
          </button>
        )}
        {hasCouponInUrl && (
          <button
            type='button'
            onClick={onRemove}
            className={`h-full shrink-0 border-l px-2 text-[10px] transition-colors ${
              isDark
                ? 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                : 'border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600'
            }`}
          >
            ✕
          </button>
        )}
      </div>

      {couponApplyError ? (
        <p
          className={`mt-0.5 text-[9px] ${isDark ? 'text-red-400' : 'text-red-500'}`}
          role='alert'
        >
          {couponApplyError}
        </p>
      ) : null}

      {quote?.couponCode && !couponApplyError ? (
        <p
          className={`mt-1 text-[10px] ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}
          role='status'
        >
          <span
            className={`mr-1 ${isDark ? 'text-[#FF5757]' : 'text-emerald-600'}`}
            aria-hidden
          >
            ✓
          </span>
          <span
            className={`font-mono font-semibold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}
          >
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
              <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
                {' '}
                — {blurb.join(' · ')}
              </span>
            ) : null;
          })()}
        </p>
      ) : null}
      {quote?.couponCode &&
        !couponApplyError &&
        quote.baseAmount === quote.finalAmount && (
          <p
            className={`mt-0.5 text-[9px] ${isDark ? 'text-amber-500/90' : 'text-amber-700/90'}`}
          >
            Code may not apply to this order. You can still check out.
          </p>
        )}

      {otherPricingBanners.length > 0 ? (
        <div
          className={`mt-1 border-t pt-1 ${isDark ? 'border-zinc-800/60' : 'border-slate-100'}`}
        >
          <p
            className={`mb-0.5 text-[9px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}
          >
            More offers
          </p>
          <ul className='max-h-16 overflow-y-auto space-y-0.5 pr-0.5'>
            {otherPricingBanners.map((b) => (
              <li
                key={b.code}
                className={`flex items-center justify-between gap-1.5 rounded border px-1.5 py-0.5 ${
                  isDark
                    ? 'border-zinc-800 bg-zinc-900/50'
                    : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <div className='min-w-0 flex-1'>
                  <p
                    className={`text-[10px] font-medium leading-tight ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}
                  >
                    {b.description?.trim() || `${b.discountPercentage}% off`}
                  </p>
                  <p
                    className={`text-[9px] leading-none ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
                    title={formatShortDate(b.expiryDate)}
                  >
                    <span className='font-mono'>{b.code}</span>
                    {' · '}
                    {b.discountPercentage}% off
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => onUseOffer(b.code)}
                  className={`shrink-0 text-[9px] font-semibold underline underline-offset-1 ${
                    isDark
                      ? 'text-zinc-400 decoration-zinc-700 hover:text-zinc-200'
                      : 'text-indigo-600 decoration-slate-200 hover:text-indigo-700'
                  }`}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {bannersError ? (
        <p
          className={`mt-3 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}
        >
          Offers couldn&apos;t load; you can still type a code.
        </p>
      ) : null}
    </div>
  );
};
