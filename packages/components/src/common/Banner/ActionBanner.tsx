import type { ActionBannerProps } from "@tbe/interface";
import React, { createElement } from "react";

const ActionBanner = ({
  backgroundColor,
  heading,
  subtext,
  icon,
  isLocked,
  onClick,
}: ActionBannerProps) => (
  <div
    className={`rounded-xl p-4 mt-3 border transition-all duration-200 flex items-center justify-between gap-3 ${
      isLocked
        ? "bg-card border-border/80 text-muted-foreground cursor-not-allowed opacity-80"
        : "bg-card border-border hover:border-primary/30 text-foreground cursor-pointer shadow-xs"
    }`}
    onClick={!isLocked ? onClick : undefined}
  >
    <div className="space-y-0.5">
      <h3 className="text-sm font-bold font-headings leading-snug">
        {heading}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{subtext}</p>
    </div>
    <div
      className={`text-xl shrink-0 ${isLocked ? "text-muted-foreground" : "text-primary"}`}
    >
      {icon && createElement(icon)}
    </div>
  </div>
);

export default ActionBanner;
