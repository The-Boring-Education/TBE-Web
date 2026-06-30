import type { PatternQuizBannerProps } from "@tbe/interface";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";

const PatternQuizBanner = ({
  onStart,
  className = "",
  compact = false,
}: PatternQuizBannerProps) => {
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.002, borderColor: "rgba(255, 87, 87, 0.25)" }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl border border-[#222] bg-[#141414] px-4 py-3 overflow-hidden relative flex items-center justify-between gap-4 ${className}`}
      >
        <div className="absolute top-0 right-0 size-32 rounded-full bg-gradient-to-br from-[#ff5757]/[0.05] to-transparent blur-[40px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-[#ff5757]/10 border border-[#ff5757]/20 rounded-lg shrink-0">
            <Brain className="size-4 text-[#ff5757]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-[#fafafa] tracking-tight">
              🧩 DSA Pattern Quiz Challenge:
            </span>
            <span className="text-xs text-[#8a8a8a] ml-1.5 hidden md:inline">
              Test your ability to identify which DSA pattern solves a given
              problem.
            </span>
            <span className="text-xs text-[#8a8a8a] ml-1.5 inline md:hidden">
              Build your algorithmic intuition.
            </span>
          </div>
        </div>
        <Button
          variant="PRIMARY"
          text="Try Now →"
          onClick={onStart}
          className="shrink-0 font-bold px-3 py-1.5 text-[11px] h-auto min-h-0 bg-[#ff5757] hover:bg-[#ff6c6c]"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.008, borderColor: "rgba(255, 87, 87, 0.3)" }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border border-[#252525] bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0d0d0d] p-6 sm:p-8 overflow-hidden relative shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${className}`}
    >
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 size-64 rounded-full bg-gradient-to-br from-[#ff5757]/[0.08] to-transparent blur-[70px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 size-48 rounded-full bg-gradient-to-tr from-[#ff5757]/[0.02] to-transparent blur-[50px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {/* Pulsing Quick challenge badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5757]/10 border border-[#ff5757]/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#ff5757] w-max">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5757] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ff5757]" />
            </span>
            <Sparkles className="size-3" />
            <span>Quick Challenge</span>
          </div>

          <div className="flex items-start gap-3 mt-1">
            <div className="p-2.5 bg-[#ff5757]/10 border border-[#ff5757]/20 rounded-xl shrink-0 hidden sm:block">
              <Brain className="size-6 text-[#ff5757] drop-shadow-[0_0_8px_rgba(255,87,87,0.4)]" />
            </div>
            <div>
              <Text
                level="h4"
                className="text-lg font-black text-[#fafafa] tracking-tight flex items-center gap-2"
              >
                Can you find the pattern?
              </Text>
              <Text
                level="p"
                className="text-sm text-[#8a8a8a] max-w-md leading-relaxed mt-1"
              >
                Test your pattern recognition skills! Identify which DSA pattern
                best solves a given coding problem.
              </Text>
            </div>
          </div>
        </div>

        <Button
          variant="PRIMARY"
          text="Try Now →"
          onClick={onStart}
          className="shrink-0 self-start sm:self-center font-bold px-6 py-3 shadow-[0_4px_12px_rgba(255,87,87,0.2)] hover:shadow-[0_4px_20px_rgba(255,87,87,0.4)] transition-all bg-[#ff5757] hover:bg-[#ff6c6c]"
        />
      </div>
    </motion.div>
  );
};

export default PatternQuizBanner;
