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
import { ArrowLeft, Sparkles, Tag, X } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PREPYATRA_PRICING_FAQ_ITEMS,
  PREPYATRA_PRICING_STATS,
  PREPYATRA_PRICING_TRUST_SIGNALS,
  PREPYATRA_PRODUCT_TYPE,
} from "@/lib/prepYatraPricingConstants";

const BANNER_DISMISSED_KEY = "prepYatra_pricing_coupon_banner_dismissed";

type PricingBanner = {
  code: string;
  discountPercentage: number;
  description: string;
  expiryDate: string;
  minimumAmount: number;
};

function formatTimeLeft(expiryIso: string): string {
  const end = new Date(expiryIso).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 48) {
    const d = Math.floor(h / 24);
    return `${d} day${d !== 1 ? "s" : ""} left`;
  }
  if (h > 0) {
    return `${h}h ${m}m left`;
  }
  if (m > 0) {
    return `${m}m left`;
  }
  return "Ending soon";
}

const PrepYatraPricingPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const handleBack = () => {
    const ref = typeof document !== "undefined" ? document.referrer : "";
    const fromOurSite = ref && new URL(ref).origin === window.location.origin;
    if (fromOurSite && window.history.length > 1) {
      router.back();
      return;
    }
    void router.push(routes.prepYatra.dashboard);
  };

  const [plans, setPlans] = useState<SubscriptionPlanCatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricingBanners, setPricingBanners] = useState<PricingBanner[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const productConfig = useMemo(
    () => getProductConfig(PREPYATRA_PRODUCT_TYPE),
    [],
  );

  const showPricingContent = !loading && !error && plans.length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(BANNER_DISMISSED_KEY) === "1") {
        setBannerDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await sendRequest({
          method: "GET",
          url: `${routes.api.couponPricingBanners}?productType=${encodeURIComponent(PREPYATRA_PRODUCT_TYPE)}`,
        });
        if (res.status && Array.isArray(res.data)) {
          setPricingBanners(res.data as PricingBanner[]);
        }
      } catch {
        setPricingBanners([]);
      }
    };
    void fetchBanners();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await sendRequest({
          method: "GET",
          url: buildSubscriptionPlansRequestUrl(PREPYATRA_PRODUCT_TYPE),
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
        return;
      }
      const returnToDashboard = `${window.location.origin}${routes.prepYatra.dashboard}`;
      const primaryCoupon =
        !bannerDismissed && pricingBanners[0]
          ? `&coupon=${encodeURIComponent(pricingBanners[0].code)}`
          : "";
      window.location.href = `${platformBase}${routes.checkout}?productType=${PREPYATRA_PRODUCT_TYPE}&productId=${planKey}&next=${encodeURIComponent(returnToDashboard)}${primaryCoupon}`;
    },
    [user, bannerDismissed, pricingBanners],
  );

  return (
    <>
      <Head>
        <title>Pricing — PrepYatra | The Boring Education</title>
        <meta
          name="description"
          content="Access all courses, interview sheets, and projects with a PrepYatra subscription."
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

        {pricingBanners.length > 0 && !bannerDismissed && (
          <div className="max-w-4xl mx-auto px-4 pt-3">
            <div className="relative flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 pr-10 text-left">
              <Tag
                className="w-4 h-4 text-rose-300 shrink-0 mt-0.5"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-rose-200">
                  {pricingBanners[0].description}
                </p>
                <p className="text-[11px] text-rose-200/80 mt-1">
                  Use code{" "}
                  <span className="font-mono font-bold text-white">
                    {pricingBanners[0].code}
                  </span>{" "}
                  for {pricingBanners[0].discountPercentage}% off ·{" "}
                  {formatTimeLeft(pricingBanners[0].expiryDate)}
                </p>
                {pricingBanners[0].minimumAmount > 0 && (
                  <p className="text-[10px] text-rose-200/60 mt-1">
                    Min. order ₹
                    {pricingBanners[0].minimumAmount.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.setItem(BANNER_DISMISSED_KEY, "1");
                  } catch {
                    // ignore
                  }
                  setBannerDismissed(true);
                }}
                className="absolute top-2 right-2 p-1 rounded-md text-rose-300/80 hover:text-white hover:bg-white/10"
                aria-label="Dismiss offer banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 pt-6 pb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[10px] font-bold px-4 py-1.5 rounded-full mb-5"
            >
              <Sparkles className="w-3 h-3" />
              PREPYATRA — ALL PRODUCTS
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight"
            >
              One plan for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-200">
                everything
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#808080] text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            >
              Courses, interview sheets, and projects — pick a plan that fits.
              Admin-managed prices always match what you see here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8"
            >
              {PREPYATRA_PRICING_STATS.map((stat, i) => (
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
                className="text-sm text-rose-400 underline hover:text-rose-300 transition-colors"
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
                  paidCtaLabel="Subscribe"
                />
              ))}
            </div>
          )}
        </section>

        {showPricingContent && (
          <>
            <section className="max-w-4xl mx-auto px-4 py-12">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg font-bold text-white text-center mb-8"
              >
                Why <span className="text-rose-400">{productConfig.name}</span>
              </motion.h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productConfig.reasonsToBuy.map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.06)] transition-all group"
                  >
                    <div className="w-9 h-9 bg-rose-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-rose-500/15 transition-colors">
                      <reason.icon className="w-4 h-4 text-rose-400" />
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
                {PREPYATRA_PRICING_TRUST_SIGNALS.map(
                  ({ icon: Icon, text }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[#707070]"
                    >
                      <Icon className="w-4 h-4 text-rose-500/60" />
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
                Frequently asked questions
              </motion.h2>

              <PricingFaqAccordion
                items={PREPYATRA_PRICING_FAQ_ITEMS}
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

export default PrepYatraPricingPage;
