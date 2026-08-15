import { cn } from "@tbe/utils";

export type PricingThemeMode = "dark" | "light";
/** Legacy alias compatibility */
export type PricingAccentTheme = PricingThemeMode | "rose" | "sky";

export type ThemeClasses = {
  cardPopular: string;
  cardDefault: string;
  cardHoverGlow: string;
  badgePopular: string;
  labelUppercase: string;
  checkIcon: string;
  buttonPopular: string;
  buttonDefault: string;
  priceText: string;
  subText: string;
  descText: string;
  divider: string;
  featureText: string;
};

const darkTheme: ThemeClasses = {
  cardPopular:
    "bg-gradient-to-b from-[#140a0a] via-[#0f0d0d] to-[#0a0a0a] border-[#ff4d4d]/60 shadow-[0_0_50px_rgba(255,77,77,0.2)] scale-[1.02]",
  cardDefault:
    "bg-[#0d0d0d] border-[#1f1f1f] hover:border-[#ff4d4d]/30",
  cardHoverGlow: "hover:shadow-[0_0_30px_rgba(255,77,77,0.1)]",
  badgePopular:
    "bg-[#1c0b0b] border border-[#ff4d4d]/60 text-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.2)]",
  labelUppercase: "text-[#ff4d4d]",
  checkIcon: "text-[#ff4d4d]",
  buttonPopular:
    "bg-[#ff4d4d] hover:bg-[#ff3333] text-white shadow-lg shadow-[#ff4d4d]/25 border-transparent",
  buttonDefault:
    "bg-transparent border border-[#ff4d4d]/40 text-white hover:bg-[#ff4d4d]/10 hover:border-[#ff4d4d]",
  priceText: "text-white",
  subText: "text-[#707070]",
  descText: "text-[#a0a0a0]",
  divider: "border-[#1f1f1f]",
  featureText: "text-[#d0d0d0]",
};

const lightTheme: ThemeClasses = {
  cardPopular:
    "bg-white border-[#ff4d4d] shadow-[0_8px_30px_rgba(255,77,77,0.15)] scale-[1.02]",
  cardDefault:
    "bg-white border-gray-200 hover:border-[#ff4d4d]/40 shadow-sm",
  cardHoverGlow: "hover:shadow-[0_8px_25px_rgba(255,77,77,0.08)]",
  badgePopular:
    "bg-[#fff0f0] border border-[#ff4d4d]/50 text-[#e53935] shadow-sm",
  labelUppercase: "text-[#e53935]",
  checkIcon: "text-[#e53935]",
  buttonPopular:
    "bg-[#ff4d4d] hover:bg-[#e53935] text-white shadow-md shadow-[#ff4d4d]/20 border-transparent",
  buttonDefault:
    "bg-white border border-gray-300 text-gray-800 hover:border-[#ff4d4d] hover:text-[#e53935]",
  priceText: "text-gray-900",
  subText: "text-gray-500",
  descText: "text-gray-600",
  divider: "border-gray-100",
  featureText: "text-gray-700",
};

export const getPricingPlanThemeClasses = (
  theme: PricingAccentTheme = "dark",
): ThemeClasses => {
  if (theme === "light") return lightTheme;
  return darkTheme; // Default to dark for "dark", "rose", "sky", or unspecified
};

export const pricingPlanCardClassName = (
  theme: PricingAccentTheme = "dark",
  isPopular: boolean = false,
): string => {
  const t = getPricingPlanThemeClasses(theme);
  return cn(
    "relative flex h-full w-full max-w-[21.5rem] flex-col rounded-xl border p-4 sm:p-5 transition-all duration-300",
    t.cardHoverGlow,
    isPopular ? t.cardPopular : t.cardDefault,
  );
};


