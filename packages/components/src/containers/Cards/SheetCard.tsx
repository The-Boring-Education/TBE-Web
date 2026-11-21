import type { PrimaryCardWithCTAProps } from "@tbe/interface";
import { ChevronRight, FileText, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

import { InterviewSheetCover } from "../../learn/InterviewSheetCover";

interface SheetCardProps extends PrimaryCardWithCTAProps {
  totalQuestions?: number;
  roadmap?: string;
}

const SheetCard = ({
  image,
  title,
  content,
  href,
  active,
  ctaText,
  isPremium,
  isPurchased,
  totalQuestions,
  launchingOn,
  roadmap,
}: SheetCardProps) => {
  const isLocked = isPremium && !isPurchased;
  const buttonText = isPurchased
    ? "Continue Preparing"
    : active && ctaText
      ? ctaText
      : launchingOn
        ? "Coming Soon"
        : "View Sheet";

  const isDisabled = !active && !isPurchased;

  return (
    <Link href={isDisabled ? "#" : href} className="group block h-full">
      <div className="relative h-full rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-foreground/20 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-xs hover:shadow-md flex flex-col">
        {/* High-contrast, sharp Interview Sheet Cover */}
        <InterviewSheetCover
          sheet={{
            name: title,
            title,
            coverImageURL: image,
            roadmap,
          }}
          badgeRoadmap={roadmap || "SHEET"}
          statusBadge={
            isLocked ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-xs">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Premium
                </span>
              </div>
            ) : isPurchased ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-xs">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  Purchased
                </span>
              </div>
            ) : null
          }
        />

        {/* Body content */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          <p className="text-[14px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </p>

          {content && (
            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
              {content}
            </p>
          )}

          {launchingOn && (
            <p className="text-[11px] text-primary font-medium">
              {launchingOn}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {totalQuestions ?? 0} Questions
            </span>

            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
              {buttonText}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SheetCard;
