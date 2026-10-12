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
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Code2,
  Layers,
  Star,
  Zap,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DSA_PRICING_FAQ_ITEMS,
  DSA_YATRA_PRODUCT_TYPE,
} from "../lib/dsaPricingPageConstants";

const DsaYatraPricingPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const handleBack = () => {
    const ref = typeof document !== "undefined" ? document.referrer : "";
    const fromOurSite = ref && new URL(ref).origin === window.location.origin;
    if (fromOurSite && window.history.length > 1) {
      router.back();
      return;
    }
    void router.push(routes.dsayatra.dashboard);
  };
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

      <div className="bg-[#050505] min-h-screen text-white font-sans antialiased selection:bg-[#ff4d4d]/30 selection:text-white">
        {/* Sticky Navbar Back Button */}
        <div className="sticky top-0 z-20 flex justify-start px-6 py-4 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#a0a0a0] hover:text-white transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            Back
          </button>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ff4d4d]/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-[#ff4d4d] text-[11px] font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider"
            >
              <Star className="w-3.5 h-3.5 fill-[#ff4d4d]" />
              DSA YATRA PRICING
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight"
            >
              Invest in Your{" "}
              <span className="text-[#ff4d4d]">DSA Mastery.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#909090] text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal"
            >
              One-time payment. Lifetime access. Structured practice with
              topic-wise sheets, company patterns, and smart revision tools.
            </motion.p>

            {/* Feature Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 border-t border-b border-white/10 py-3"
            >
              {/* Desktop & Tablet: One Single Horizontal Line without Scroll */}
              <div className="hidden sm:flex flex-row items-center justify-center gap-6 md:gap-10 max-w-4xl mx-auto text-xs font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-[#a0a0a0]">
                  <Code2 className="w-3.5 h-3.5 text-[#ff4d4d] shrink-0" />
                  <span className="font-bold text-white">400+</span> DSA
                  Problems
                </div>

                <div className="w-[1px] h-3.5 bg-white/15 shrink-0" />

                <div className="flex items-center gap-1.5 text-[#a0a0a0]">
                  <BookOpen className="w-3.5 h-3.5 text-[#ff4d4d] shrink-0" />
                  <span className="font-bold text-white">25+</span> Curated
                  Sheets
                </div>

                <div className="w-[1px] h-3.5 bg-white/15 shrink-0" />

                <div className="flex items-center gap-1.5 text-[#a0a0a0]">
                  <Layers className="w-3.5 h-3.5 text-[#ff4d4d] shrink-0" />
                  <span className="font-bold text-white">Company</span> Patterns
                  & Tracks
                </div>
              </div>

              {/* Mobile: Compact Grid without Scroll */}
              <div className="flex flex-col sm:hidden items-center justify-center gap-2 text-[11px] font-medium text-[#a0a0a0] px-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-[#ff4d4d] shrink-0" />
                    <span className="font-bold text-white">400+</span> Problems
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#ff4d4d] shrink-0" />
                    <span className="font-bold text-white">25+</span> Sheets
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#ff4d4d] shrink-0" />
                  <span className="font-bold text-white">Company</span> Patterns
                  & Tracks
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards Grid Section */}
        <section className="mx-auto max-w-6xl px-4 py-8">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner height={10} width={10} />
                <p className="text-[#707070] text-xs">Loading plans…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-[#ff4d4d] mb-4 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-[#ff4d4d] underline hover:text-[#ff6666] transition-colors"
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
            <div className="grid w-full grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <SubscriptionPricingPlanCard
                  key={plan.planUuid ?? plan.planKey}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  accentTheme="dark"
                  paidCtaLabel="Subscribe"
                />
              ))}
            </div>
          )}
        </section>

        {showPricingContent && (
          <>
            {/* Cancel anytime trust banner matching image */}
            <div className="flex items-center justify-center gap-2 text-[#909090] text-xs py-4 mb-8">
              <CheckCircle2 className="w-4 h-4 text-[#ff4d4d]" />
              <span>Cancel anytime. No hidden charges.</span>
            </div>

            <section className="max-w-3xl mx-auto px-4 py-6">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-6 text-center shadow-lg"
              >
                <div className="inline-flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[#ff4d4d]" />
                  <span className="text-xs font-bold text-[#ff4d4d] uppercase tracking-wider">
                    Free Tier Included
                  </span>
                </div>
                <p className="text-[#a0a0a0] text-sm leading-relaxed max-w-lg mx-auto">
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
                className="text-xl font-bold text-white text-center mb-8"
              >
                Why Learners Choose{" "}
                <span className="text-[#ff4d4d]">DSA Yatra</span>
              </motion.h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productConfig.reasonsToBuy.map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl p-4 hover:border-[#ff4d4d]/40 transition-all group"
                  >
                    <div className="w-9 h-9 bg-[#ff4d4d]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#ff4d4d]/20 transition-colors">
                      <reason.icon className="w-4 h-4 text-[#ff4d4d]" />
                    </div>
                    <h3 className="font-semibold text-white text-xs mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-[#707070] text-[11px] leading-relaxed">
                      {reason.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="max-w-md mx-auto px-4 py-8">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-base font-bold text-white text-center mb-4"
              >
                Frequently Asked Questions
              </motion.h2>

              <PricingFaqAccordion
                items={DSA_PRICING_FAQ_ITEMS}
                accentTheme="dark"
              />
            </section>

            <div className="pb-12">
              <p className="text-center text-[#505050] text-[11px]">
                Secure payment powered by{" "}
                <span className="text-[#808080]">Cashfree</span>. All prices
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
