import type { PatternQuizBannerProps } from "@tbe/interface";
import { motion } from "framer-motion";

import Text from "../../common/Typography/Text";
import Button from "../../common/Buttons/Button";

const PatternQuizBanner = ({ onStart, className = "" }: PatternQuizBannerProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] via-[#151515] to-[#111] p-6 sm:p-8 overflow-hidden relative ${className}`}
    >
      <div className="absolute top-0 right-0 size-48 rounded-full bg-[#ff5757]/[0.06] blur-[60px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Text level="h4" className="text-lg font-black text-[#f0f0f0]">
            🧩 Can you find the pattern?
          </Text>
          <Text level="p" className="text-sm text-[#808080] max-w-md leading-relaxed">
            Test your ability to identify which DSA pattern solves a given problem
          </Text>
        </div>
        <Button
          variant="PRIMARY"
          text="Try Now →"
          onClick={onStart}
          className="shrink-0 self-start sm:self-center"
        />
      </div>
    </motion.div>
  );
};

export default PatternQuizBanner;
