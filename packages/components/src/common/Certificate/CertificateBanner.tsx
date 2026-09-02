import type { CertificateBannerProps } from "@tbe/interface";
import { createElement } from "react";

const CertificateBanner = ({
  backgroundColor,
  heading,
  subtext,
  icon,
  isLocked,
  onClick,
}: CertificateBannerProps) => (
  <div
    className={`rounded-xl p-4 mt-3 border transition-all duration-200 flex items-center justify-between gap-3 ${
      isLocked
        ? "bg-card border-border/80 text-muted-foreground cursor-not-allowed opacity-80"
        : "bg-primary/10 border-primary/30 text-foreground hover:bg-primary/15 cursor-pointer shadow-xs"
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

export default CertificateBanner;
