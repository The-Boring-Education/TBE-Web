import type { PrimaryCardWithCTAProps } from "@tbe/interface";
import { BookOpen, ChevronRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ShikshaCardProps extends PrimaryCardWithCTAProps {
  roadmap?: string;
  difficultyLevel?: string;
}

const ShikshaCard = ({
  image,
  imageAltText,
  title,
  content,
  href,
  active,
  ctaText,
  isPremium,
  isPurchased,
  difficultyLevel,
  launchingOn,
}: ShikshaCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLocked = isPremium && !isPurchased;
  const buttonText = isPurchased
    ? "Continue Learning"
    : active && ctaText
      ? ctaText
      : launchingOn
        ? "Coming Soon"
        : "View Course";

  const isDisabled = !active && !isPurchased;
  const hasImage = Boolean(image && !imageError);

  return (
    <Link href={isDisabled ? "#" : href} className="group block h-full">
      <div className="relative h-full rounded-xl border border-border/80 dark:border-white/10 bg-card hover:bg-muted/40 dark:hover:bg-white/[0.04] hover:border-primary/40 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Cover image from DB */}
        {hasImage ? (
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted/60 shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted/80 animate-pulse z-0" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={imageAltText || title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 relative z-10 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

            {/* Badges */}
            {difficultyLevel && (
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-xs z-20">
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">
                  {difficultyLevel}
                </span>
              </div>
            )}
            {isLocked && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-xs z-20">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Premium
                </span>
              </div>
            )}
            {isPurchased && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-xs z-20">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  Enrolled
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-primary/10 via-muted to-background flex items-center justify-center border-b border-border/60 shrink-0">
            <BookOpen className="w-8 h-8 text-primary/40" />
            {isLocked && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Premium
                </span>
              </div>
            )}
            {isPurchased && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  Enrolled
                </span>
              </div>
            )}
          </div>
        )}

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

          {/* Additional Info Badges */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/40">
              Self-Paced
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/40">
              Projects Included
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              Course
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

export default ShikshaCard;
