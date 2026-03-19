import type { StudyGuideNavProps, StudyGuideSection } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { motion } from "framer-motion";

import Text from "../../common/Typography/Text";

const StudyGuideNav = ({
  config,
  activeId,
  onSectionClick,
  className,
}: StudyGuideNavProps) => {
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
        {config.sections.map((item, index) => {
          if ("divider" in item) {
            if (item.divider === null) {
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
                  {item.divider}
                </Text>
              </div>
            );
          }

          const section = item as StudyGuideSection;
          const isActive = activeId === section.id;
          const label = section.label;

          return (
            <motion.div
              key={section.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative w-full rounded-lg py-2 px-3 mb-0.5 cursor-pointer transition-all duration-300 group flex items-center justify-between overflow-hidden",
                isActive
                  ? "bg-red-500/[0.03] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.04)]"
                  : "bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-gray-800/40",
              )}
              onClick={() => onSectionClick(section.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-glow"
                  className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                />
              )}
              <Text
                level="p"
                className={cn(
                  "text-[13px] font-medium truncate transition-colors duration-300 relative z-10",
                  isActive
                    ? "text-red-400 font-bold"
                    : "text-gray-400 group-hover:text-gray-200",
                )}
              >
                {label}
              </Text>

              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.02] to-transparent pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyGuideNav;
