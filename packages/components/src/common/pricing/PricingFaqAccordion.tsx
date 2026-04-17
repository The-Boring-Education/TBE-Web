import { cn } from "@tbe/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
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
  accentTheme = "rose",
}: PricingFaqAccordionProps) => {
  if (items.length === 0) return null;

  const openBorder =
    accentTheme === "sky"
      ? "data-[state=open]:border-sky-500/30"
      : "data-[state=open]:border-[#ff5757]/25";
  const chevron =
    accentTheme === "sky" ? "[&>svg]:text-sky-400" : "[&>svg]:text-[#ff5757]";

  return (
    <Accordion
      type="single"
      collapsible
      className={cn("w-full space-y-2", className)}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className={cn(
            "rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] px-1",
            openBorder,
          )}
        >
          <AccordionTrigger
            className={cn(
              "px-4 py-4 text-left text-sm font-medium text-[#d0d0d0] hover:no-underline",
              chevron,
            )}
          >
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-[13px] text-[#808080] leading-relaxed">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
