import {
  PricingFaqAccordion,
  SubscriptionPricingPlanCard,
} from "@tbe/components";
import { getProductConfig, routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { SubscriptionPlanCatalogRow } from "@tbe/types";
import {
  buildSubscriptionPlansRequestUrl,
  getPlatformCheckoutOrigin,
  normalizeSubscriptionPlansForPricing,
  sendRequest,
} from "@tbe/utils";
import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DSA_PRICING_FAQ_ITEMS,
  DSA_PRICING_STATS,
  DSA_PRICING_TRUST_SIGNALS,
  DSA_YATRA_PRODUCT_TYPE,
} from "../lib/dsaPricingPageConstants";

const DsaYatraPricingPage = () => {
  const { user } = useUser();
  const [plans, setPlans] = useState<SubscriptionPlanCatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productConfig = useMemo(
    () => getProductConfig(DSA_YATRA_PRODUCT_TYPE),
    [],
  );

  const showPricingContent = !loading && !error && plans.length > 0;

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await sendRequest({
          method: "GET",
          url: buildSubscriptionPlansRequestUrl(DSA_YATRA_PRODUCT_TYPE),
        });

        if (!res.status || res.data === undefined) {
          throw new Error(
            typeof res.message === "string"
              ? res.message
              : "Failed to load pricing plans",
          );
        }

        setPlans(normalizeSubscriptionPlansForPricing(res.data));
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

      const platformBase = getPlatformCheckoutOrigin();
      if (!platformBase) {
        console.error(
          "NEXT_PUBLIC_PLATFORM_URL is missing; cannot open Platform checkout.",
        );
        return;
      }
      const returnToDashboard = `${window.location.origin}${routes.dsayatra.dashboard}`;
      window.location.href = `${platformBase}${routes.checkout}?productType=${DSA_YATRA_PRODUCT_TYPE}&productId=${planKey}&next=${encodeURIComponent(returnToDashboard)}`;
    },
    [user],
  );

  return (
    <>
      <Head>
        <title>Pricing — DSA Yatra | The Boring Education</title>
        <meta
          name="description"
          content="Master DSA with structured practice. One-time payment, lifetime access to 400+ problems, topic-wise sheets, and revision tracking."
        />
      </Head>

      <div className="bg-[#040505] min-h-screen">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff5757]/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ff5757]/8 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 bg-[#ff5757]/10 border border-[#ff5757]/20 text-[#ff5757] text-[10px] font-bold px-4 py-1.5 rounded-full mb-5"
            >
              <Sparkles className="w-3 h-3" />
              PRICING
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight"
            >
              Invest in Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5757] to-[#ff8a80]">
                DSA Mastery
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#808080] text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            >
              One-time payment. Lifetime access. Structured practice with
              topic-wise sheets, company patterns, and smart revision tools.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 md:gap-10 mt-8"
            >
              {DSA_PRICING_STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg md:text-xl font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-[10px] md:text-xs text-[#606060] font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-8">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#ff5757]/20 border-t-[#ff5757]" />
                <p className="text-[#606060] text-xs">Loading plans…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-[#ff6b6b] mb-4 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-[#ff5757] underline hover:text-[#ff8080] transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && plans.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#808080] text-sm">
                No plans available right now. We&apos;re working on it!
              </p>
            </div>
          )}

          {showPricingContent && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {plans.map((plan) => (
                <SubscriptionPricingPlanCard
                  key={plan.planUuid ?? plan.planKey}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  accentTheme="rose"
                />
              ))}
            </div>
          )}
        </section>

        {showPricingContent && (
          <>
            <section className="max-w-3xl mx-auto px-4 py-6">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-[#0f0f0f] to-[#111] border border-[#1a1a1a] rounded-2xl p-6 text-center"
              >
                <div className="inline-flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider">
                    Free Tier Included
                  </span>
                </div>
                <p className="text-[#b0b0b0] text-sm leading-relaxed max-w-lg mx-auto">
                  Every user gets access to{" "}
                  <strong className="text-white">3 Easy</strong>,{" "}
                  <strong className="text-white">2 Medium</strong>,{" "}
                  <strong className="text-white">1 Hard</strong>, and{" "}
                  <strong className="text-white">1 Real-World</strong> problem
                  per topic — completely free. Upgrade to unlock everything.
                </p>
              </motion.div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-12">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg font-bold text-white text-center mb-8"
              >
                Why Learners Choose{" "}
                <span className="text-[#ff5757]">DSA Yatra</span>
              </motion.h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productConfig.reasonsToBuy.map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#ff5757]/30 hover:shadow-[0_0_30px_rgba(255,87,87,0.06)] transition-all group"
                  >
                    <div className="w-9 h-9 bg-[#ff5757]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#ff5757]/15 transition-colors">
                      <reason.icon className="w-4 h-4 text-[#ff5757]" />
                    </div>
                    <h3 className="font-semibold text-white text-xs mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-[#606060] text-[10px] leading-relaxed">
                      {reason.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="max-w-3xl mx-auto px-4 py-8">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                {DSA_PRICING_TRUST_SIGNALS.map(({ icon: Icon, text }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[#707070]"
                  >
                    <Icon className="w-4 h-4 text-[#ff5757]/60" />
                    <span className="text-xs font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-xl mx-auto px-4 py-12">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg font-bold text-white text-center mb-6"
              >
                Frequently Asked Questions
              </motion.h2>

              <PricingFaqAccordion
                items={DSA_PRICING_FAQ_ITEMS}
                accentTheme="rose"
              />
            </section>

            <div className="pb-12">
              <p className="text-center text-[#404040] text-[10px]">
                Secure payment powered by{" "}
                <span className="text-[#606060]">Cashfree</span>. All prices
                include applicable taxes.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DsaYatraPricingPage;
