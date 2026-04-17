import type { SubscriptionPlanCatalogRow } from "@tbe/types";
import { calculateDiscountPercent, cn, formatPriceInr } from "@tbe/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Crown } from "lucide-react";

import Button from "../Buttons/Button";
import {
  getPricingPlanThemeClasses,
  type PricingAccentTheme,
  pricingPlanCardClassName,
} from "./pricingPlanThemes";

export type SubscriptionPricingPlanCardProps = {
  plan: SubscriptionPlanCatalogRow;
  onSubscribe: (planKey: string) => void;
  /** Visual accent preset; default matches DSA Yatra pricing. */
  accentTheme?: PricingAccentTheme;
  popularLabel?: string;
  freeCtaLabel?: string;
  paidCtaLabel?: string;
};

export const SubscriptionPricingPlanCard = ({
  plan,
  onSubscribe,
  accentTheme = "rose",
  popularLabel = "MOST POPULAR",
  freeCtaLabel = "Start Free",
  paidCtaLabel = "Get Started",
}: SubscriptionPricingPlanCardProps) => {
  const t = getPricingPlanThemeClasses(accentTheme);
  const discount = calculateDiscountPercent(
    plan.originalAmountInr,
    plan.amountInr,
  );
  const isFree = plan.amountInr === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={pricingPlanCardClassName(accentTheme, plan.isPopular)}
    >
      {plan.isPopular && (
        <div
          className={cn(
            "absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg",
            t.badgePopular,
          )}
        >
          <Crown className="w-3 h-3" />
          {popularLabel}
        </div>
      )}

      {discount > 0 && (
        <div className="absolute -top-2 -right-2 bg-[#10b981] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
          {discount}% OFF
        </div>
      )}

      <div className="text-center mb-5 pt-2">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em] mb-2",
            t.labelUppercase,
          )}
        >
          {plan.displayName || plan.planKey}
        </p>

        <div className="mb-2">
          {isFree ? (
            <span className="text-4xl font-bold text-[#10b981]">FREE</span>
          ) : (
            <div className="flex items-baseline justify-center gap-2">
              {plan.originalAmountInr > plan.amountInr && (
                <span className="text-lg text-[#505050] line-through">
                  {formatPriceInr(plan.originalAmountInr)}
                </span>
              )}
              <span className="text-4xl font-bold text-white">
                {formatPriceInr(plan.amountInr)}
              </span>
            </div>
          )}
        </div>

        <p className="text-[#606060] text-xs">
          {plan.accessType === "ONE_TIME"
            ? "one-time payment"
            : `${plan.durationMonths} month${plan.durationMonths > 1 ? "s" : ""} access`}
        </p>

        {plan.description ? (
          <p className="text-[#808080] text-[11px] mt-2 leading-relaxed">
            {plan.description}
          </p>
        ) : null}
      </div>

      <div className="border-t border-[#2a2a2a] mb-4" />

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature, i) => (
          <li
            key={`${i}-${feature}`}
            className="flex items-start gap-2.5 text-xs"
          >
            <CheckCircle2
              className={cn("w-4 h-4 shrink-0 mt-0.5", t.checkIcon)}
            />
            <span className="text-[#c0c0c0] leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          text={isFree ? freeCtaLabel : paidCtaLabel}
          variant="PRIMARY"
          onClick={() => onSubscribe(plan.planKey)}
          className={cn(
            "w-full py-3 font-semibold",
            plan.isPopular && cn("shadow-lg", t.buttonShadow),
          )}
        />
      </motion.div>
    </motion.div>
  );
};
