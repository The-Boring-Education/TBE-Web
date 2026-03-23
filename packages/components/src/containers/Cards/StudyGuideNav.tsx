import type { StudyGuideNavProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { motion } from "framer-motion";

import Text from "../../common/Typography/Text";

const StudyGuideNav = ({
  data,
  activeId,
  onSectionClick,
  className,
}: StudyGuideNavProps) => {
  let navItemCounter = 0;

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="mb-4">
        <Text
          level="h3"
          className="text-[11px] font-black text-white mb-0.5 tracking-widest uppercase opacity-40 ml-2"
        >
          Study Guide
        </Text>
      </div>

      <div className="space-y-1">
        {data?.sections?.map((section, index) => {
          if (section.isDivider) {
            if (!section.dividerLabel) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-3 border-t border-gray-800/40 mx-2"
                />
              );
            }
            return (
              <div key={`divider-${index}`} className="pt-5 pb-2">
                <Text
                  level="p"
                  className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2.5"
                >
                  {section.dividerLabel}
                </Text>
              </div>
            );
          }

          const isActive = activeId === section.id;
          const displayIndex = navItemCounter++;

          return (
            <motion.div
              key={section.id || `section-${index}`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative w-full rounded-lg py-2.5 px-3 mb-0.5 cursor-pointer transition-all duration-300 group flex items-center gap-3 overflow-hidden",
                isActive
                  ? "bg-red-500/[0.04] border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.06)]"
                  : "bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-gray-800/40",
              )}
              onClick={() => section.id && onSectionClick(section.id)}
            >
              <div className="flex-shrink-0 w-5 flex justify-center">
                <Text
                  level="p"
                  className={cn(
                    "text-[11px] font-black tracking-tighter transition-colors duration-300",
                    isActive
                      ? "text-red-500/60"
                      : "text-gray-700 group-hover:text-gray-500",
                  )}
                >
                  {displayIndex < 10 ? `0${displayIndex}` : displayIndex}
                </Text>
              </div>

              <Text
                level="p"
                className={cn(
                  "text-[13px] font-medium truncate transition-colors duration-300 relative z-10",
                  isActive
                    ? "text-red-400 font-bold"
                    : "text-gray-400 group-hover:text-gray-200",
                )}
              >
                {section.label}
              </Text>

              {isActive && (
                <motion.div
                  layoutId="active-nav-glow"
                  className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                />
              )}

              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.03] to-transparent pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyGuideNav;
