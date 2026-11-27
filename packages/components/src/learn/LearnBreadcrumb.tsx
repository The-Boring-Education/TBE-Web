import React from "react";
import { FiChevronRight } from "react-icons/fi";

import { LEARN_TYPOGRAPHY } from "./typography";

export interface LearnBreadcrumbItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export interface LearnBreadcrumbProps {
  items: LearnBreadcrumbItem[];
  className?: string;
}

export const LearnBreadcrumb: React.FC<LearnBreadcrumbProps> = ({
  items,
  className = "",
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-[#16161A]/90 backdrop-blur-xs border border-slate-200/80 dark:border-[#26262C] rounded-xl shadow-2xs ${LEARN_TYPOGRAPHY.meta} overflow-x-auto max-w-full ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isInteractive = Boolean(item.onClick && !isLast);

        return (
          <React.Fragment key={item.id || index}>
            {index > 0 && (
              <FiChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 select-none" />
            )}
            {isInteractive ? (
              <button
                type="button"
                onClick={item.onClick}
                className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#FF3B30] hover:bg-slate-50 dark:hover:bg-[#222228] px-2 py-0.5 rounded-lg transition-colors cursor-pointer truncate shrink-0 max-w-[200px]"
                title={item.label}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg truncate shrink-0 max-w-[260px] ${
                  isLast
                    ? "font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#222228] border border-slate-200/60 dark:border-[#2C2C34]"
                    : "text-slate-600 dark:text-slate-400"
                }`}
                title={item.label}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
