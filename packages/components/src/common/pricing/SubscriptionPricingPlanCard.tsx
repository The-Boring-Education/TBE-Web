import type { SubscriptionPlanCatalogRow } from "@tbe/types";
import { calculateDiscountPercent, cn, formatPriceInr } from "@tbe/utils";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Crown } from "lucide-react";

import {
  getPricingPlanThemeClasses,
  type PricingAccentTheme,
  pricingPlanCardClassName,
} from "./pricingPlanThemes";

export type SubscriptionPricingPlanCardProps = {
  plan: SubscriptionPlanCatalogRow;
  onSubscribe: (planKey: string) => void;
  accentTheme?: PricingAccentTheme;
  popularLabel?: string;
  freeCtaLabel?: string;
  paidCtaLabel?: string;
};

export const SubscriptionPricingPlanCard = ({
  plan,
  onSubscribe,
  accentTheme = "dark",
  popularLabel = "MOST POPULAR",
  freeCtaLabel = "Start Free",
  paidCtaLabel = "Subscribe",
}: SubscriptionPricingPlanCardProps) => {
  const t = getPricingPlanThemeClasses(accentTheme);
  const discount = calculateDiscountPercent(
    plan.originalAmountInr,
    plan.amountInr,
  );
  const isFree = plan.amountInr === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={pricingPlanCardClassName(accentTheme, plan.isPopular)}
    >
      {plan.isPopular && (
        <div
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10",
            t.badgePopular,
          )}
        >
          <Crown className="w-3 h-3" />
          {popularLabel}
        </div>
      )}

      {discount > 0 && (
        <div className="absolute top-3 right-3 bg-[#ff4d4d] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
          {discount}% OFF
        </div>
      )}

      <div className="text-center mb-3 pt-1">
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.15em] mb-1.5",
            t.labelUppercase,
          )}
        >
          {plan.displayName || plan.planKey}
        </p>

        <div className="mb-1">
          {isFree ? (
            <span className={cn("text-3xl font-extrabold", t.priceText)}>FREE</span>
          ) : (
            <div className="flex items-baseline justify-center gap-1.5">
              <span className={cn("text-3xl md:text-4xl font-extrabold tracking-tight", t.priceText)}>
                {formatPriceInr(plan.amountInr)}
              </span>
              {plan.originalAmountInr > plan.amountInr && (
                <span className="text-xs font-normal text-[#606060] line-through">
                  {formatPriceInr(plan.originalAmountInr)}
                </span>
              )}
            </div>
          )}
        </div>

        <p className={cn("text-[11px] font-normal text-[#707070]", t.subText)}>
          {plan.accessType === "ONE_TIME"
            ? "one-time payment"
            : plan.description || `Full access coverage`}
        </p>
      </div>

      <div className={cn("border-t my-3", t.divider)} />

      <ul className="space-y-2 mb-5 flex-1">
        {plan.features.map((feature, i) => (
          <li
            key={`${i}-${feature}`}
            className="flex items-start gap-2 text-[11px]"
          >
            <CheckCircle2
              className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", t.checkIcon)}
            />
            <span className={cn("leading-tight font-normal", t.featureText)}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <button
          type="button"
          onClick={() => onSubscribe(plan.planKey)}
          className={cn(
            "w-full py-2 px-3.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer",
            plan.isPopular ? t.buttonPopular : t.buttonDefault,
          )}
        >
          <span>{isFree ? freeCtaLabel : paidCtaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </motion.div>
  );
};


