import { Button } from "@tbe/components";
import { envConfig, getProductConfig, routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { sendRequest } from "@tbe/utils";
import { useCallback, useEffect, useState } from "react";

interface SubscriptionPlan {
  productType: string;
  planKey: string;
  amountInr: number;
  currency: string;
  isActive: boolean;
}

const PLAN_FEATURES: Record<string, string[]> = {
  lifetime: [
    "Complete DSA question bank",
    "Topic-wise practice sheets",
    "Company-specific question filtering",
    "Progress tracking & analytics",
    "Revision scheduling",
    "Spaced repetition system",
    "Lifetime access to all future updates",
  ],
};

const PRODUCT_TYPE = "DSA_YATRA";

const DsaYatraPricingPage = () => {
  const { user } = useUser();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productConfig = getProductConfig(PRODUCT_TYPE);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await sendRequest({
          method: "GET",
          url: `${routes.api.subscriptionPlans}?productType=${PRODUCT_TYPE}`,
        });

        if (!res.status || !Array.isArray(res.data)) {
          throw new Error(
            typeof res.message === "string"
              ? res.message
              : "Failed to load pricing plans",
          );
        }

        setPlans(
          res.data.filter(
            (p: SubscriptionPlan) => p.isActive && p.amountInr >= 0,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    void fetchPlans();
  }, []);

  const handleSubscribe = useCallback(
    (planKey: string) => {
      if (!user) {
        const returnUrl = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        );
        window.location.href = `${routes.login}?redirect=${returnUrl}`;
        return;
      }

      const platformBase = (envConfig.PLATFORM_URL || "").replace(/\/$/, "");
      window.location.href = `${platformBase}${routes.checkout}?productType=${PRODUCT_TYPE}&productId=${planKey}&next=${encodeURIComponent("/dashboard")}`;
    },
    [user],
  );

  return (
    <div className="bg-[#040505]">
      {/* ── Compact Hero ─────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#ff5757]/10 border border-[#ff5757]/20 text-[#ff5757] text-[10px] font-bold px-3 py-1 rounded-full mb-3">
            PRICING
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white mb-1.5 leading-tight">
            Master DSA with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5757] to-[#ff8a80]">
              DSA Yatra
            </span>
          </h1>
          <p className="text-[#808080] text-xs max-w-xl mx-auto leading-relaxed">
            Lifetime access to structured practice, topic-wise sheets, revision
            tracking, and personalized preparation — all in one place.
          </p>
        </div>
      </div>

      {/* ── Plan cards ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-12">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff5757]" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-[#ff6b6b] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[#ff5757] underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#808080]">
              No plans available right now. Check back soon.
            </p>
          </div>
        )}

        {/* Cards — always centered, column on mobile, row on md+ */}
        {!loading && !error && plans.length > 0 && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-5">
            {plans.map((plan) => {
              const features = PLAN_FEATURES[plan.planKey] ?? [
                ...(productConfig.defaultFeatures ?? []),
              ];
              const isLifetime = plan.planKey === "lifetime";
              const isFree = plan.amountInr === 0;

              return (
                <div
                  key={plan.planKey}
                  className={`
                    relative w-full max-w-sm mx-auto md:mx-0 rounded-2xl border p-6 flex flex-col
                    ${
                      isLifetime
                        ? "bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border-[#ff5757]/50 shadow-[0_0_60px_rgba(255,87,87,0.12)]"
                        : "bg-[#0f0f0f] border-[#1f1f1f] hover:border-[#ff5757]/30"
                    }
                    transition-all duration-300
                  `}
                >
                  {isLifetime && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff5757] text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      BEST VALUE
                    </div>
                  )}

                  {/* Plan name */}
                  <div className="text-center mb-4">
                    <p className="text-[10px] font-bold text-[#ff5757] uppercase tracking-widest mb-1">
                      {plan.planKey}
                    </p>
                    <h3 className="text-lg font-bold text-white mb-3">
                      {isLifetime ? "Lifetime Access" : plan.planKey}
                    </h3>

                    {/* Price */}
                    <div className="mb-1">
                      {isFree ? (
                        <span className="text-3xl font-bold text-[#51cf66]">
                          FREE
                        </span>
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          ₹{plan.amountInr.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <p className="text-[#606060] text-[10px] uppercase tracking-wide">
                      {isLifetime ? "one-time payment" : `for ${plan.planKey}`}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#2a2a2a] mb-4" />

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-[#b0b0b0]"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-[#ff5757] shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    text={isFree ? "Access Free" : "Subscribe Now"}
                    variant="PRIMARY"
                    onClick={() => void handleSubscribe(plan.planKey)}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ── Why DSA Yatra ──────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-bold text-white text-center mb-6">
              Why DSA Yatra?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productConfig.reasonsToBuy.map((reason, i) => (
                <div
                  key={i}
                  className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#ff5757]/30 transition-all"
                >
                  <div className="w-8 h-8 bg-[#ff5757]/10 rounded-lg flex items-center justify-center mb-3">
                    <reason.icon className="w-4 h-4 text-[#ff5757]" />
                  </div>
                  <h3 className="font-semibold text-white text-xs mb-1">
                    {reason.title}
                  </h3>
                  <p className="text-[#606060] text-[10px] leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ ────────────────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
          <div className="mt-12 max-w-xl mx-auto">
            <h2 className="text-base font-bold text-white text-center mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {[
                {
                  q: "Is this a one-time payment?",
                  a: "Yes! Your DSA Yatra subscription is a one-time payment that gives you lifetime access to all DSA content and future updates.",
                },
                {
                  q: "Is my payment secure?",
                  a: "All payments are processed securely via Cashfree, supporting all major cards, UPI, and net banking.",
                },
                {
                  q: "What happens after payment?",
                  a: "After successful payment, your DSA Yatra content is unlocked instantly and remains accessible forever.",
                },
                {
                  q: "Can I access on mobile?",
                  a: "Yes, DSA Yatra works on any device — desktop, tablet, or mobile.",
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl group"
                >
                  <summary className="px-5 py-3 cursor-pointer font-semibold text-xs text-[#b0b0b0] list-none flex items-center justify-between hover:text-white transition-colors">
                    {faq.q}
                    <svg
                      className="w-3.5 h-3.5 text-[#ff5757] shrink-0 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-5 pb-3 text-[11px] text-[#707070] leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer note ─────────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
          <p className="text-center text-[#505050] text-[10px] mt-10">
            Secure payment powered by{" "}
            <span className="text-[#707070]">Cashfree</span>. All prices include
            applicable taxes.
          </p>
        )}
      </div>
    </div>
  );
};

export default DsaYatraPricingPage;
