import type { LucideIcon } from "lucide-react";
import { Shield, Star, Zap } from "lucide-react";

export const DSA_YATRA_PRODUCT_TYPE = "DSA_YATRA" as const;

export const DSA_PRICING_STATS = [
  { value: "400+", label: "DSA Problems" },
  { value: "26+", label: "Topics Covered" },
  { value: "50+", label: "Company Patterns" },
  { value: "10K+", label: "Learners" },
] as const;

export const DSA_PRICING_FAQS = [
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
] as const;

export const DSA_PRICING_TRUST_SIGNALS: ReadonlyArray<{
  icon: LucideIcon;
  text: string;
}> = [
  { icon: Shield, text: "Secure Payment via Cashfree" },
  { icon: Star, text: "Lifetime Access Guarantee" },
  { icon: Zap, text: "Instant Unlock After Payment" },
];
