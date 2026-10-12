"use client";

import { useUser } from "@tbe/hooks";
import { Trophy } from "lucide-react";

import { useGamificationContext } from "../GamificationProvider";
import type { ThemeType } from "../types";
import useMyLeaderboard from "../useMyLeaderboard";

interface RankChipProps {
  /** Absolute URL of the platform leaderboard page. */
  href: string;
  theme?: ThemeType;
  className?: string;
}

/** Compact "#7 this week" chip for app navbars. Hidden for logged-out visitors. */
const RankChip = ({ href, theme: propTheme, className = "" }: RankChipProps) => {
  const { user } = useUser();
  const { my, loading } = useMyLeaderboard();
  const context = useGamificationContext();
  const isDark = (propTheme ?? context.theme) === "dark";

  if (!user?.id || loading) return null;

  const rank = my?.standings?.WEEKLY?.rank ?? null;
  const label = rank ? `#${rank} this week` : "Get on the board";

  return (
    <a
      aria-label={`Leaderboard: ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
        isDark
          ? "bg-white/10 text-amber-300 hover:bg-white/20"
          : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
      } ${className}`}
      href={href}
    >
      <Trophy size={14} />
      {label}
    </a>
  );
};

export default RankChip;
