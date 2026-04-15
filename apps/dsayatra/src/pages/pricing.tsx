import { Button } from "@tbe/components";
import { envConfig, getProductConfig, routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { sendRequest } from "@tbe/utils";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  Crown,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────── */
/* Types & Constants                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

interface SubscriptionPlan {
  productType: string;
  planKey: string;
  displayName: string;
  description: string;
  amountInr: number;
  originalAmountInr: number;
  currency: string;
  accessType: string;
  durationMonths: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

const PRODUCT_TYPE = "DSA_YATRA";
const SUBSCRIPTION_PLANS_API_PATH = "/subscription-plans";

const STATS = [
  { value: "400+", label: "DSA Problems" },
  { value: "26+", label: "Topics Covered" },
  { value: "50+", label: "Company Patterns" },
  { value: "10K+", label: "Learners" },
];

const FAQS = [
  {
    q: "Is this a one-time payment?",
    a: "Yes! DSA Yatra is a one-time payment that gives you lifetime access to all DSA content, including all future updates and new problems added.",
  },
  {
    q: "Is my payment secure?",
    a: "Absolutely. All payments are processed securely via Cashfree, India's leading payment gateway. We support UPI, cards, net banking, and wallets.",
  },
  {
    q: "What do free users get?",
    a: "Free users can access 3 Easy, 2 Medium, 1 Hard, and 1 Real-World problem from each topic. Upgrade to unlock the complete question bank with detailed solutions.",
  },
  {
    q: "What happens after payment?",
    a: "Your DSA Yatra content is unlocked instantly. You'll get access to all questions, detailed solutions, company patterns, and revision tools immediately.",
  },
  {
    q: "Can I access on mobile?",
    a: "Yes, DSA Yatra is fully responsive and works beautifully on any device — desktop, tablet, or mobile.",
  },
  {
    q: "Do I get refund if not satisfied?",
    a: "We offer a hassle-free refund within 7 days of purchase if you're not satisfied. No questions asked.",
  },
];

function getPlatformOrigin(): string {
  const fromEnv = envConfig.PLATFORM_URL?.replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return "";
}

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function calculateDiscount(original: number, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Sub-components                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function PlanCard({
  plan,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  onSubscribe: (planKey: string) => void;
}) {
  const discount = calculateDiscount(plan.originalAmountInr, plan.amountInr);
  const isFree = plan.amountInr === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        relative w-full max-w-sm rounded-2xl border p-6 flex flex-col
        ${
          plan.isPopular
            ? "bg-gradient-to-b from-[#1a0a0a] via-[#140808] to-[#0d0d0d] border-[#ff5757]/40 shadow-[0_0_80px_rgba(255,87,87,0.15)] scale-[1.02]"
            : "bg-[#0f0f0f] border-[#1f1f1f] hover:border-[#ff5757]/20"
        }
        transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,87,87,0.08)]
      `}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[#ff5757] to-[#ff3333] text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#ff5757]/25">
          <Crown className="w-3 h-3" />
          MOST POPULAR
        </div>
      )}

      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute -top-2 -right-2 bg-[#10b981] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
          {discount}% OFF
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-5 pt-2">
        <p className="text-[10px] font-bold text-[#ff5757] uppercase tracking-[0.2em] mb-2">
          {plan.displayName || plan.planKey}
        </p>

        {/* Price */}
        <div className="mb-2">
          {isFree ? (
            <span className="text-4xl font-bold text-[#10b981]">FREE</span>
          ) : (
            <div className="flex items-baseline justify-center gap-2">
              {plan.originalAmountInr > plan.amountInr && (
                <span className="text-lg text-[#505050] line-through">
                  {formatPrice(plan.originalAmountInr)}
                </span>
              )}
              <span className="text-4xl font-bold text-white">
                {formatPrice(plan.amountInr)}
              </span>
            </div>
          )}
        </div>

        <p className="text-[#606060] text-xs">
          {plan.accessType === "ONE_TIME"
            ? "one-time payment"
            : `${plan.durationMonths} month${plan.durationMonths > 1 ? "s" : ""} access`}
        </p>

        {plan.description && (
          <p className="text-[#808080] text-[11px] mt-2 leading-relaxed">
            {plan.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a] mb-4" />

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#ff5757] shrink-0 mt-0.5" />
            <span className="text-[#c0c0c0] leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          text={isFree ? "Start Free" : "Get Started"}
          variant="PRIMARY"
          onClick={() => onSubscribe(plan.planKey)}
          className={`w-full py-3 font-semibold ${plan.isPopular ? "shadow-lg shadow-[#ff5757]/20" : ""}`}
        />
      </motion.div>
    </motion.div>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-[#1a1a1a] rounded-xl overflow-hidden bg-[#0f0f0f] hover:border-[#ff5757]/20 transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <span className="font-medium text-sm text-[#d0d0d0]">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#ff5757] shrink-0 ml-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-4 text-[13px] text-[#808080] leading-relaxed">
          {a}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Main Page                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

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
          url: `${SUBSCRIPTION_PLANS_API_PATH}?productType=${PRODUCT_TYPE}`,
        });

        if (!res.status || !Array.isArray(res.data)) {
          throw new Error(
            typeof res.message === "string"
              ? res.message
              : "Failed to load pricing plans",
          );
        }

        setPlans(
          res.data
            .filter((p: SubscriptionPlan) => p.isActive && p.amountInr >= 0)
            .sort(
              (a: SubscriptionPlan, b: SubscriptionPlan) =>
                a.sortOrder - b.sortOrder,
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

      const platformBase = getPlatformOrigin();
      if (!platformBase) {
        console.error(
          "NEXT_PUBLIC_PLATFORM_URL is missing; cannot open Platform checkout.",
        );
        return;
      }
      window.location.href = `${platformBase}${routes.checkout}?productType=${PRODUCT_TYPE}&productId=${planKey}&next=${encodeURIComponent("/dashboard")}`;
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
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background glow */}
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

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 md:gap-10 mt-8"
            >
              {STATS.map((stat, i) => (
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

        {/* ── Plan Cards ───────────────────────────────────────── */}
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
                No plans available right now. Check back soon.
              </p>
            </div>
          )}

          {!loading && !error && plans.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.planKey}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Free Tier Info ───────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
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
                <strong className="text-white">1 Real-World</strong> problem per
                topic — completely free. Upgrade to unlock everything.
              </p>
            </motion.div>
          </section>
        )}

        {/* ── Why DSA Yatra ────────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
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
        )}

        {/* ── Trust Signals ────────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { icon: Shield, text: "Secure Payment via Cashfree" },
                { icon: Star, text: "Lifetime Access Guarantee" },
                { icon: Zap, text: "Instant Unlock After Payment" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2 text-[#707070]">
                  <Icon className="w-4 h-4 text-[#ff5757]/60" />
                  <span className="text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ ──────────────────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
          <section className="max-w-xl mx-auto px-4 py-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg font-bold text-white text-center mb-6"
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Footer note ──────────────────────────────────────── */}
        {!loading && !error && plans.length > 0 && (
          <div className="pb-12">
            <p className="text-center text-[#404040] text-[10px]">
              Secure payment powered by{" "}
              <span className="text-[#606060]">Cashfree</span>. All prices
              include applicable taxes.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DsaYatraPricingPage;
