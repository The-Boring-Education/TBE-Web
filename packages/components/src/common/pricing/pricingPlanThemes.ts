import { cn } from "@tbe/utils";

export type PricingAccentTheme = "rose" | "sky";

type ThemeClasses = {
  cardPopular: string;
  cardDefault: string;
  cardHoverGlow: string;
  badgePopular: string;
  labelUppercase: string;
  checkIcon: string;
  buttonShadow: string;
};

const rose: ThemeClasses = {
  cardPopular:
    "bg-gradient-to-b from-[#1a0a0a] via-[#140808] to-[#0d0d0d] border-[#ff5757]/40 shadow-[0_0_80px_rgba(255,87,87,0.15)] scale-[1.02]",
  cardDefault: "bg-[#0f0f0f] border-[#1f1f1f] hover:border-[#ff5757]/20",
  cardHoverGlow: "hover:shadow-[0_0_40px_rgba(255,87,87,0.08)]",
  badgePopular:
    "bg-gradient-to-r from-[#ff5757] to-[#ff3333] shadow-[#ff5757]/25",
  labelUppercase: "text-[#ff5757]",
  checkIcon: "text-[#ff5757]",
  buttonShadow: "shadow-[#ff5757]/20",
};

const sky: ThemeClasses = {
  cardPopular:
    "bg-gradient-to-b from-[#0a1520] via-[#0c1420] to-[#0d0d0d] border-sky-500/40 shadow-[0_0_80px_rgba(14,165,233,0.12)] scale-[1.02]",
  cardDefault: "bg-[#0f0f0f] border-[#1f1f1f] hover:border-sky-500/25",
  cardHoverGlow: "hover:shadow-[0_0_40px_rgba(14,165,233,0.06)]",
  badgePopular: "bg-gradient-to-r from-sky-500 to-sky-600 shadow-sky-500/25",
  labelUppercase: "text-sky-400",
  checkIcon: "text-sky-400",
  buttonShadow: "shadow-sky-500/20",
};

const THEMES: Record<PricingAccentTheme, ThemeClasses> = {
  rose,
  sky,
};

export const getPricingPlanThemeClasses = (
  theme: PricingAccentTheme,
): ThemeClasses => THEMES[theme] ?? rose;

export const pricingPlanCardClassName = (
  theme: PricingAccentTheme,
  isPopular: boolean,
): string => {
  const t = getPricingPlanThemeClasses(theme);
  return cn(
    "relative w-full max-w-sm rounded-2xl border p-6 flex flex-col transition-all duration-300",
    t.cardHoverGlow,
    isPopular ? t.cardPopular : t.cardDefault,
  );
};
