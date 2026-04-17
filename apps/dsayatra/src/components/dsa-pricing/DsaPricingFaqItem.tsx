import { cn } from "@tbe/utils";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const DsaPricingFaqItem = ({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-[#1a1a1a] rounded-xl overflow-hidden bg-[#0f0f0f] hover:border-[#ff5757]/20 transition-colors"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <span className="font-medium text-sm text-[#d0d0d0]">{q}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#ff5757] shrink-0 ml-4 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
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
};
