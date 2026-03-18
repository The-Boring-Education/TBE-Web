import type { StudyGuideReaderProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { useEffect, useRef } from "react";

import Text from "../../common/Typography/Text";

const StudyGuideReader = ({
  topic,
  sectionId,
  className,
}: StudyGuideReaderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [sectionId]);

  const formatTitle = (id: string) => {
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      className={cn(
        "flex flex-col flex-1 min-h-0 w-full bg-[#0A0A0A]",
        className,
      )}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin-grey px-6 py-8 scroll-smooth"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <Text
                level="h1"
                className="text-3xl font-black text-white tracking-tight"
              >
                {formatTitle(sectionId)}
              </Text>
            </div>

            <Text
              level="p"
              className="text-gray-500 mb-8 font-medium italic tracking-wide"
            >
              Master the concepts of {topic} through our structured study guide.
            </Text>

            <div className="h-px w-full bg-gradient-to-r from-gray-800/80 via-gray-800/20 to-transparent mb-10" />

            <div className="space-y-6 text-gray-300 leading-relaxed text-[15px]">
              {sectionId === "cheat-sheet" ? (
                <div className="space-y-8">
                  <p className="text-gray-400">
                    A quick reference of all common patterns, their trigger
                    words, and complexity analysis.
                  </p>
                  <div className="overflow-x-auto border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#050505] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <table className="w-full text-left text-[13px] border-collapse relative z-10">
                      <thead>
                        <tr className="bg-[#0f0f0f] text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                          <th className="px-6 py-4 border-b border-white/5">
                            Pattern
                          </th>
                          <th className="px-6 py-4 border-b border-white/5">
                            Trigger Words
                          </th>
                          <th className="px-6 py-4 border-b border-white/5 text-center">
                            Complexity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {[
                          {
                            p: "Two Pointers",
                            t: "Sorted array, finding pairs, triplets, reversing, removing duplicates",
                            c: "O(n) Time | O(1) Space",
                          },
                          {
                            p: "Sliding Window",
                            t: "Subarray with specific sum, longest substring, contiguous elements",
                            c: "O(n) Time | O(1) Space",
                          },
                          {
                            p: "Hash Map",
                            t: "Counting frequencies, constant time lookup, sum mapping",
                            c: "O(n) Time | O(n) Space",
                          },
                          {
                            p: "Prefix Sum",
                            t: "Range sum queries, subarray sum equals K, subarray sum divisibility",
                            c: "O(n) Time | O(n) Space",
                          },
                          {
                            p: "Kadane's",
                            t: "Maximum subarray sum, contiguous subarray property",
                            c: "O(n) Time | O(1) Space",
                          },
                        ].map((row, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-white/[0.015] transition-colors group/row"
                          >
                            <td className="px-6 py-5 font-bold text-white group-hover/row:text-red-400 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-800 opacity-20 group-hover/row:bg-red-500 group-hover/row:opacity-100 transition-all duration-300" />
                                {row.p}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-gray-500 group-hover/row:text-gray-300 transition-colors leading-snug">
                              {row.t}
                            </td>
                            <td className="px-6 py-5 text-center font-mono text-[10px]">
                              <span className="bg-[#111] text-gray-400 px-2.5 py-1.5 rounded-lg border border-white/5 shadow-inner group-hover/row:border-red-500/30 group-hover/row:text-red-400 transition-all duration-300 whitespace-nowrap">
                                {row.c}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <p>
                    Study guide content for the section{" "}
                    <span className="text-red-400 font-bold border-b border-red-400/20 pb-0.5">
                      "{formatTitle(sectionId)}"
                    </span>{" "}
                    in <strong className="text-white">{topic}</strong> is being
                    meticulously prepared.
                  </p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-12 text-center mt-12 relative overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
                    <div className="absolute inset-0 bg-red-500/[0.005] group-hover:bg-red-500/[0.01] transition-all duration-500" />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 group-hover:border-red-500/40 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-500">
                        <Lightbulb
                          className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform duration-500"
                          strokeWidth={2.5}
                        />
                      </div>
                      <Text
                        level="h3"
                        className="text-white text-xl font-black mb-4 tracking-tight"
                      >
                        Content Coming Soon
                      </Text>
                      <p className="text-gray-500 text-[14px] max-w-sm mx-auto leading-relaxed font-medium">
                        Our engineering team and top DSA experts are finalizing
                        the high-quality content for this section. Stay tuned
                        for patterns, optimized code, and visual deep-dives.
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyGuideReader;
