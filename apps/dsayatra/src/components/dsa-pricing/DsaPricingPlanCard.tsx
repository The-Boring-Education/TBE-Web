import { Button } from "@tbe/components";
import { cn } from "@tbe/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Crown } from "lucide-react";

import {
  calculateDiscountPercent,
  formatPriceInr,
} from "../../lib/dsaPricingPageHelpers";
import type { DsaSubscriptionPlan } from "../../types/dsaSubscriptionPlan";

export const DsaPricingPlanCard = ({
  plan,
  onSubscribe,
}: {
  plan: DsaSubscriptionPlan;
  onSubscribe: (planKey: string) => void;
}) => {
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
      className={cn(
        "relative w-full max-w-sm rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,87,87,0.08)]",
        plan.isPopular
          ? "bg-gradient-to-b from-[#1a0a0a] via-[#140808] to-[#0d0d0d] border-[#ff5757]/40 shadow-[0_0_80px_rgba(255,87,87,0.15)] scale-[1.02]"
          : "bg-[#0f0f0f] border-[#1f1f1f] hover:border-[#ff5757]/20",
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[#ff5757] to-[#ff3333] text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#ff5757]/25">
          <Crown className="w-3 h-3" />
          MOST POPULAR
        </div>
      )}

      {discount > 0 && (
        <div className="absolute -top-2 -right-2 bg-[#10b981] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
          {discount}% OFF
        </div>
      )}

      <div className="text-center mb-5 pt-2">
        <p className="text-[10px] font-bold text-[#ff5757] uppercase tracking-[0.2em] mb-2">
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
            <CheckCircle2 className="w-4 h-4 text-[#ff5757] shrink-0 mt-0.5" />
            <span className="text-[#c0c0c0] leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          text={isFree ? "Start Free" : "Get Started"}
          variant="PRIMARY"
          onClick={() => onSubscribe(plan.planKey)}
          className={cn(
            "w-full py-3 font-semibold",
            plan.isPopular && "shadow-lg shadow-[#ff5757]/20",
          )}
        />
      </motion.div>
    </motion.div>
  );
};
