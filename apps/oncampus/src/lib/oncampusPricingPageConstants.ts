import type { PricingFaqItem } from "@tbe/components";
import type { LucideIcon } from "lucide-react";
import { Shield, Star, Zap } from "lucide-react";

export const ONCAMPUS_PRODUCT_TYPE = "ONCAMPUS" as const;

export const ONCAMPUS_PRICING_STATS = [
  { value: "4+", label: "Prep Tracks" },
  { value: "Aptitude", label: "Practice" },
  { value: "DSA + Sheets", label: "Interview" },
  { value: "Coupons", label: "Campus deals" },
] as const;

const ONCAMPUS_PRICING_FAQS = [
  {
    q: "What is included in On Campus?",
    a: "On Campus bundles aptitude practice, interview sheets, DSA prep, and quizzes in one place — with duration-based access so you can align with your placement timeline.",
  },
  {
    q: "Is payment secure?",
    a: "Yes. Payments are processed securely via Cashfree. We support UPI, cards, net banking, and wallets.",
  },
  {
    q: "Can I use campus coupons?",
    a: "When your institution shares a valid coupon, you can apply it at checkout for eligible plans.",
  },
  {
    q: "What happens after I subscribe?",
    a: "Your access unlocks as soon as payment succeeds. You can start from the dashboard right away.",
  },
  {
    q: "Can I use On Campus on mobile?",
    a: "Yes. The experience is responsive and works on desktop, tablet, and mobile browsers.",
  },
  {
    q: "Who do I contact for billing help?",
    a: "Reach out through support channels listed on The Boring Education site or your campus coordinator.",
  },
] as const;

export const ONCAMPUS_PRICING_FAQ_ITEMS: PricingFaqItem[] =
  ONCAMPUS_PRICING_FAQS.map((faq, i) => ({
    id: `oncampus-pricing-faq-${i}`,
    question: faq.q,
    answer: faq.a,
  }));

export const ONCAMPUS_PRICING_TRUST_SIGNALS: ReadonlyArray<{
  icon: LucideIcon;
  text: string;
}> = [
  { icon: Shield, text: "Secure Payment via Cashfree" },
  { icon: Star, text: "Duration-Based Access" },
  { icon: Zap, text: "Start From Dashboard" },
];
