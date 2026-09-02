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
import { ArrowLeft, CheckCircle2, Sparkles, Tag, X } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PREPYATRA_PRICING_FAQ_ITEMS,
  PREPYATRA_PRICING_STATS,
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

      <div className="bg-[#fcfcfc] min-h-screen text-gray-900 font-sans antialiased selection:bg-[#ff4d4d]/20 selection:text-gray-900">
        {/* Sticky Navbar Back Button */}
        <div className="sticky top-0 z-20 flex justify-start px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            Back
          </button>
        </div>

        {pricingBanners.length > 0 && !bannerDismissed && (
          <div className="max-w-4xl mx-auto px-4 pt-4">
            <div className="relative flex items-start gap-3 rounded-xl border border-[#ff4d4d]/30 bg-[#fff0f0] px-4 py-3 pr-10 text-left">
              <Tag
                className="w-4 h-4 text-[#e53935] shrink-0 mt-0.5"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900">
                  {pricingBanners[0].description}
                </p>
                <p className="text-[11px] text-gray-700 mt-1 font-medium">
                  Use code{" "}
                  <span className="font-mono font-bold text-[#e53935]">
                    {pricingBanners[0].code}
                  </span>{" "}
                  for {pricingBanners[0].discountPercentage}% off ·{" "}
                  {formatTimeLeft(pricingBanners[0].expiryDate)}
                </p>
                {pricingBanners[0].minimumAmount > 0 && (
                  <p className="text-[10px] text-gray-500 mt-1">
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
                className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/50"
                aria-label="Dismiss offer banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#ff4d4d]/5 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#fff0f0] border border-[#ff4d4d]/30 text-[#e53935] text-[11px] font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              PREPYATRA — ALL PRODUCTS
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight"
            >
              One plan for{" "}
              <span className="text-[#e53935]">everything.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal"
            >
              Courses, interview sheets, and projects — pick a plan that fits.
              Admin-managed prices always match what you see here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 border-t border-b border-gray-200 py-3"
            >
              <div className="hidden sm:flex flex-row items-center justify-center gap-4 lg:gap-8 max-w-4xl mx-auto text-xs font-medium whitespace-nowrap">
                {PREPYATRA_PRICING_STATS.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-600">
                    {i > 0 && <div className="w-[1px] h-3.5 bg-gray-200 mr-2 shrink-0" />}
                    <span className="font-bold text-gray-900">{stat.value}</span> {stat.label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:hidden text-[11px] font-medium text-gray-600 px-2 text-center">
                {PREPYATRA_PRICING_STATS.map((stat, i) => (
                  <div key={i}>
                    <span className="font-bold text-gray-900">{stat.value}</span> {stat.label}
                  </div>
                ))}
              </div>
            </motion.div>


          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="mx-auto max-w-6xl px-4 py-8">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner height={10} width={10} />
                <p className="text-gray-500 text-xs">Loading plans…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-[#e53935] underline hover:text-red-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && plans.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">
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
                  accentTheme="light"
                  paidCtaLabel="Subscribe"
                />
              ))}
            </div>
          )}
        </section>

        {showPricingContent && (
          <>
            <div className="flex items-center justify-center gap-2 text-gray-600 text-xs py-4 mb-8">
              <CheckCircle2 className="w-4 h-4 text-[#e53935]" />
              <span>Cancel anytime. No hidden charges.</span>
            </div>

            <section className="max-w-4xl mx-auto px-4 py-12">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xl font-bold text-gray-900 text-center mb-8"
              >
                Why <span className="text-[#e53935]">{productConfig.name}</span>
              </motion.h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productConfig.reasonsToBuy.map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#ff4d4d]/40 hover:shadow-md transition-all group"
                  >
                    <div className="w-9 h-9 bg-[#fff0f0] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#ffe5e5] transition-colors">
                      <reason.icon className="w-4 h-4 text-[#e53935]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-xs mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-gray-500 text-[11px] leading-relaxed">
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
                className="text-base font-bold text-gray-900 text-center mb-4"
              >
                Frequently asked questions
              </motion.h2>

              <PricingFaqAccordion
                items={PREPYATRA_PRICING_FAQ_ITEMS}
                accentTheme="light"
              />
            </section>


            <div className="pb-12">
              <p className="text-center text-gray-400 text-[11px]">
                Secure payment powered by{" "}
                <span className="text-gray-600">Cashfree</span>. All prices
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

