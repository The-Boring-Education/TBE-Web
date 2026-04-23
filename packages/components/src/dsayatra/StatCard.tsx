import { cn } from "@tbe/utils";

import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import type { StatCardProps } from "./types";

const statCardBaseClassName =
  "bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#ff5757]/40 hover:shadow-[0_0_20px_rgba(255,87,87,0.15)] transition-all duration-300 group rounded-xl p-5 h-full relative overflow-hidden flex flex-col justify-center";

const badgeVariantClass: Record<
  NonNullable<StatCardProps["badge"]>["variant"],
  string
> = {
  success: "border border-[#51cf66]/20 bg-[#51cf66]/10 text-[#51cf66]",
  danger: "border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 text-[#ff6b6b]",
};

export function StatCard({
  title,
  value,
  description,
  caption,
  icon: Icon,
  progress,
  badge,
  className,
}: StatCardProps) {
  const showSubsection = description || caption;

  return (
    <Card className={cn(statCardBaseClassName, className)}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ff5757]/0 to-[#ff5757]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex flex-row items-center justify-between pb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] lg:text-[11px]">
          {title}
        </p>
        {Icon ? <Icon className="h-4 w-4 text-[#ff5757]" /> : null}
      </div>
      <div className="mt-1">
        <div className="text-3xl font-black leading-tight text-[#f0f0f0] sm:text-4xl">
          {value}
        </div>
        {showSubsection && (
          <div className="mt-1.5 space-y-0.5">
            {description && (
              <p className="text-xs font-medium text-[#808080] lg:text-sm">
                {description}
              </p>
            )}
            {caption && (
              <p className="text-[10px] font-medium tracking-tight text-[#505050] lg:text-xs">
                {caption}
              </p>
            )}
          </div>
        )}
        {badge && (
          <div
            className={cn(
              "mt-3 inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              badgeVariantClass[badge.variant],
            )}
          >
            {badge.label}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-4">
            <Progress
              value={progress}
              className="h-1.5 overflow-hidden rounded-full bg-[#252525]"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
