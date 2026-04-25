import type { PricingFaqItem } from "@tbe/components";
import type { LucideIcon } from "lucide-react";
import { Crown, Shield, Star } from "lucide-react";

export const PREPYATRA_PRODUCT_TYPE = "PREPYATRA" as const;

export const PREPYATRA_PRICING_STATS = [
  { value: "All", label: "Products" },
  { value: "Sheets", label: "Interview prep" },
  { value: "Courses", label: "Skill paths" },
  { value: "Projects", label: "Hands-on" },
] as const;

const PREPYATRA_FAQS = [
  {
    q: "What is PrepYatra?",
    a: "PrepYatra is the ‘all products’ subscription — get access to premium courses, interview sheets, and projects under one plan.",
  },
  {
    q: "Is payment secure?",
    a: "Yes. Checkout runs on the platform with Cashfree — UPI, cards, and net banking supported.",
  },
  {
    q: "What happens after I pay?",
    a: "Access unlocks on success. You can continue from the PrepYatra dashboard right away.",
  },
  {
    q: "Can I apply a coupon?",
    a: "If you have a valid code, you can use it on the checkout page before paying.",
  },
] as const;

export const PREPYATRA_PRICING_FAQ_ITEMS: PricingFaqItem[] = PREPYATRA_FAQS.map(
  (faq, i) => ({
    id: `prepyatra-pricing-faq-${i}`,
    question: faq.q,
    answer: faq.a,
  }),
);

export const PREPYATRA_PRICING_TRUST_SIGNALS: ReadonlyArray<{
  icon: LucideIcon;
  text: string;
}> = [
  { icon: Shield, text: "Secure payment via Cashfree" },
  { icon: Star, text: "All premium products" },
  { icon: Crown, text: "One subscription" },
];
