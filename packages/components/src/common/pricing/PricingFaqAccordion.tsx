import { cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { PricingAccentTheme } from "./pricingPlanThemes";

export type PricingFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type PricingFaqAccordionProps = {
  items: PricingFaqItem[];
  className?: string;
  accentTheme?: PricingAccentTheme;
};

export const PricingFaqAccordion = ({
  items,
  className,
  accentTheme = "dark",
}: PricingFaqAccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const isLight = accentTheme === "light";

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              "rounded-lg border px-1 transition-colors duration-200 overflow-hidden",
              isLight
                ? isOpen
                  ? "border-[#ff4d4d] bg-white shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
                : isOpen
                  ? "border-[#ff4d4d]/60 bg-[#0a0a0a]"
                  : "border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]",
            )}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "w-full px-3.5 py-3 text-left text-xs font-semibold flex items-center justify-between gap-3 transition-colors cursor-pointer",
                isLight ? "text-gray-900" : "text-white",
              )}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-out",
                  isOpen && "rotate-180",
                  isLight ? "text-[#e53935]" : "text-[#ff4d4d]",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: {
                        duration: 0.25,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      },
                      opacity: { duration: 0.2, delay: 0.05 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: {
                        duration: 0.2,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      },
                      opacity: { duration: 0.15 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "px-3.5 pb-3 text-[11px] leading-relaxed font-normal border-t pt-2.5",
                      isLight
                        ? "text-gray-600 border-gray-100"
                        : "text-[#909090] border-[#181818]",
                    )}
                  >
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};



