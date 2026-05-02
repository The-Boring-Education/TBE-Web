import {
  LoadingSpinner,
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
import { ArrowLeft, GraduationCap, Sparkles } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ONCAMPUS_PRICING_FAQ_ITEMS,
  ONCAMPUS_PRICING_STATS,
  ONCAMPUS_PRICING_TRUST_SIGNALS,
  ONCAMPUS_PRODUCT_TYPE,
} from "@/lib/oncampusPricingPageConstants";

const OnCampusPricingPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const handleBack = () => {
    const ref = typeof document !== "undefined" ? document.referrer : "";
    const fromOurSite = ref && new URL(ref).origin === window.location.origin;
    if (fromOurSite && window.history.length > 1) {
      router.back();
      return;
    }
    void router.push(routes.oncampus.dashboard);
  };
  const [plans, setPlans] = useState<SubscriptionPlanCatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productConfig = useMemo(
    () => getProductConfig(ONCAMPUS_PRODUCT_TYPE),
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
          url: buildSubscriptionPlansRequestUrl(ONCAMPUS_PRODUCT_TYPE),
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
      const returnToDashboard = `${window.location.origin}${routes.oncampus.dashboard}`;
      window.location.href = `${platformBase}${routes.checkout}?productType=${ONCAMPUS_PRODUCT_TYPE}&productId=${planKey}&next=${encodeURIComponent(returnToDashboard)}`;
    },
    [user],
  );

  return (
    <>
      <Head>
        <title>Pricing — On Campus | The Boring Education</title>
        <meta
          name="description"
          content="Placement-focused aptitude, DSA, interview sheets, and quizzes. Pick a duration that fits your campus timeline."
        />
      </Head>

      <div className="bg-[#040505] min-h-screen">
        <div className="sticky top-0 z-20 flex justify-start px-4 pt-4 pb-2 bg-[#040505]/90 backdrop-blur-sm border-b border-white/5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#b0b0b0] hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            Back
          </button>
        </div>

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 pt-6 pb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/25 text-sky-300 text-[10px] font-bold px-4 py-1.5 rounded-full mb-5"
            >
              <Sparkles className="w-3 h-3" />
              ON CAMPUS PRICING
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight"
            >
              Plans Built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                Campus Placements
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#808080] text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            >
              Aptitude, core CS, DSA, interview sheets, and quizzes — choose a
              duration that matches your preparation window.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8"
            >
              {ONCAMPUS_PRICING_STATS.map((stat, i) => (
                <div key={i} className="text-center min-w-[100px]">
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
                <LoadingSpinner height={10} width={10} />
                <p className="text-[#606060] text-xs">Loading plans…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-red-400 mb-4 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-sky-400 underline hover:text-sky-300 transition-colors"
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
                  accentTheme="sky"
                  paidCtaLabel="Subscribe"
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
                className="bg-gradient-to-r from-[#0f1418] to-[#111] border border-[#1a1a1a] rounded-2xl p-6 text-center"
              >
                <div className="inline-flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Built for students
                  </span>
                </div>
                <p className="text-[#b0b0b0] text-sm leading-relaxed max-w-lg mx-auto">
                  Use your dashboard to move between aptitude, sheets, DSA, and
                  quizzes — all under one On Campus subscription for the plan
                  duration you choose.
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
                Why Choose{" "}
                <span className="text-sky-400">{productConfig.name}</span>
              </motion.h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productConfig.reasonsToBuy.map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 hover:border-sky-500/30 hover:shadow-[0_0_30px_rgba(14,165,233,0.06)] transition-all group"
                  >
                    <div className="w-9 h-9 bg-sky-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-sky-500/15 transition-colors">
                      <reason.icon className="w-4 h-4 text-sky-400" />
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
                {ONCAMPUS_PRICING_TRUST_SIGNALS.map(
                  ({ icon: Icon, text }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[#707070]"
                    >
                      <Icon className="w-4 h-4 text-sky-500/60" />
                      <span className="text-xs font-medium">{text}</span>
                    </div>
                  ),
                )}
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
                items={ONCAMPUS_PRICING_FAQ_ITEMS}
                accentTheme="sky"
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

export default OnCampusPricingPage;
