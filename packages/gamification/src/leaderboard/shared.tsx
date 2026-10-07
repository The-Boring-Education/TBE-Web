import { LEADERBOARD_CHAMPIONS_SPOTLIGHT_MS, LEADERBOARD_TABS } from "@tbe/constants";
import type { LeaderboardType } from "@tbe/types";
import {
  formatResetCountdown,
  getPeriodBounds,
} from "@tbe/utils/leaderboard";
import { useEffect, useState } from "react";

export const PERIOD_LABELS: Record<LeaderboardType, string> = {
  DAILY: "Today",
  WEEKLY: "This week",
  MONTHLY: "This month",
};

export const PREVIOUS_PERIOD_LABELS: Record<LeaderboardType, string> = {
  DAILY: "Yesterday's",
  WEEKLY: "Last week's",
  MONTHLY: "Last month's",
};

export const MEDAL_STYLES: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-950",
  2: "bg-slate-300 text-slate-900",
  3: "bg-orange-400 text-orange-950",
};

/** "Resets in 2d 4h", re-rendered every minute; empty until mounted (SSR-safe). */
export const useResetCountdown = (resetsAt?: string) => {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!resetsAt) return;
    const update = () =>
      setLabel(formatResetCountdown(new Date(resetsAt).getTime() - Date.now()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [resetsAt]);
  return label;
};

/** True during the first hours of a Period, when last Period's Champions are spotlighted. */
export const useIsChampionsSpotlight = (
  type: LeaderboardType,
  periodKey?: string,
) => {
  const [spotlight, setSpotlight] = useState(false);
  useEffect(() => {
    if (!periodKey) return;
    try {
      const { start } = getPeriodBounds(type, periodKey);
      setSpotlight(
        Date.now() - start.getTime() < LEADERBOARD_CHAMPIONS_SPOTLIGHT_MS,
      );
    } catch {
      setSpotlight(false);
    }
  }, [type, periodKey]);
  return spotlight;
};

export const LearnerAvatar = ({
  src,
  name,
  size = 32,
}: {
  src?: string;
  name: string;
  size?: number;
}) => {
  const [failed, setFailed] = useState(false);
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  const style = { width: size, height: size };
  if (!src || failed) {
    return (
      <div
        aria-hidden
        className="rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0"
        style={style}
      >
        {initial}
      </div>
    );
  }
  return (
    <img
      alt=""
      className="rounded-full object-cover flex-shrink-0"
      loading="lazy"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      src={src}
      style={style}
    />
  );
};

export const RankBadge = ({ rank }: { rank: number }) =>
  rank <= 3 ? (
    <span
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${MEDAL_STYLES[rank]}`}
    >
      {rank}
    </span>
  ) : (
    <span className="w-6 text-center text-xs font-semibold text-gray-500 flex-shrink-0">
      #{rank}
    </span>
  );

export const PeriodTabs = ({
  value,
  onChange,
}: {
  value: LeaderboardType;
  onChange: (type: LeaderboardType) => void;
}) => (
  <div
    className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1"
    role="tablist"
  >
    {LEADERBOARD_TABS.map((tab) => (
      <button
        aria-selected={value === tab}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
          value === tab
            ? "bg-white text-indigo-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
        key={tab}
        onClick={() => onChange(tab)}
        role="tab"
        type="button"
      >
        {tab.charAt(0) + tab.slice(1).toLowerCase()}
      </button>
    ))}
  </div>
);
