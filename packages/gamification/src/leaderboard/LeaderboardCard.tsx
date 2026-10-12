"use client";

import { LEADERBOARD_LIMITS } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { LeaderboardType } from "@tbe/types";
import { Clock, Target, Trophy } from "lucide-react";
import { useState } from "react";

import type { LeaderboardEntry, LeaderboardViewer } from "../types";
import useLeaderboard from "../useLeaderboard";
import useLeaderboardChampions from "../useLeaderboardChampions";
import useMyLeaderboard from "../useMyLeaderboard";
import {
  LearnerAvatar,
  PERIOD_LABELS,
  PeriodTabs,
  PREVIOUS_PERIOD_LABELS,
  RankBadge,
  useIsChampionsSpotlight,
  useResetCountdown,
} from "./shared";

export const LeaderboardRow = ({
  entry,
  isViewer,
}: {
  entry: LeaderboardEntry;
  isViewer: boolean;
}) => (
  <li
    className={`flex items-center gap-3 px-4 py-2.5 ${
      isViewer ? "bg-indigo-50" : ""
    }`}
  >
    <RankBadge rank={entry.rank} />
    <LearnerAvatar name={entry.displayName} src={entry.image} />
    <span
      className={`flex-1 min-w-0 truncate text-sm ${
        isViewer ? "font-semibold text-indigo-900" : "font-medium text-gray-800"
      }`}
    >
      {entry.displayName}
      {isViewer && (
        <span className="ml-2 text-xs font-semibold text-indigo-600">You</span>
      )}
    </span>
    <span className="text-sm font-bold text-gray-900 tabular-nums">
      {entry.score}
      <span className="ml-1 text-xs font-medium text-gray-500">pts</span>
    </span>
  </li>
);

export const ViewerSummary = ({
  viewer,
  type,
  showRow,
  name,
  image,
}: {
  viewer: LeaderboardViewer | null;
  type: LeaderboardType;
  showRow: boolean;
  name: string;
  image?: string;
}) => {
  if (!viewer || viewer.rank === null) {
    return (
      <p className="px-4 py-3 text-sm text-gray-600 border-t border-gray-100">
        Complete one lesson or question to get on{" "}
        {PERIOD_LABELS[type].toLowerCase()}&apos;s board.
      </p>
    );
  }
  return (
    <div className="border-t border-dashed border-gray-200">
      {showRow && (
        <ul>
          <LeaderboardRow
            entry={{
              rank: viewer.rank,
              displayName: name,
              image,
              score: viewer.score,
            }}
            isViewer
          />
        </ul>
      )}
      {viewer.nextTarget && (
        <p className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700">
          <Target className="text-indigo-600 flex-shrink-0" size={16} />
          <span>
            <strong>{viewer.nextTarget.gap} pts</strong> to pass{" "}
            {viewer.nextTarget.displayName} (#{viewer.nextTarget.rank})
          </span>
        </p>
      )}
    </div>
  );
};

const ChampionsSpotlight = ({ type }: { type: LeaderboardType }) => {
  const { champions } = useLeaderboardChampions(type);
  if (!champions?.champions.length) return null;
  return (
    <div className="mx-4 mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
      <p className="text-xs font-semibold text-amber-800 mb-1">
        🏆 {PREVIOUS_PERIOD_LABELS[type]} Champions
      </p>
      <p className="text-sm text-amber-950">
        {champions.champions
          .map((c) => `${["🥇", "🥈", "🥉"][c.rank - 1] ?? ""} ${c.displayName}`)
          .join("  ·  ")}
      </p>
    </div>
  );
};

interface LeaderboardCardProps {
  /** Link to the full leaderboard page; omit to hide the link. */
  fullPageHref?: string;
  className?: string;
}

/**
 * Dashboard leaderboard: Daily/Weekly/Monthly tabs, top 10, the learner's own
 * row and next target, reset countdown and last Period's Champions early on.
 */
const LeaderboardCard = ({
  fullPageHref,
  className = "",
}: LeaderboardCardProps) => {
  const { user } = useUser();
  const [type, setType] = useState<LeaderboardType>("WEEKLY");
  const { board, entries, viewer, loading } = useLeaderboard(type, {
    limit: LEADERBOARD_LIMITS.DASHBOARD,
  });
  const { my } = useMyLeaderboard();
  const countdown = useResetCountdown(board?.resetsAt);
  const spotlight = useIsChampionsSpotlight(type, board?.periodKey);

  const viewerOnBoard = entries.some((e) => e.userId === user?.id);
  const badges = my?.badges;
  const badgeCount = (badges?.WEEKLY ?? 0) + (badges?.MONTHLY ?? 0);

  return (
    <section
      aria-label="Leaderboard"
      className={`w-full max-w-3xl mx-auto mt-8 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden ${className}`}
    >
      <header className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Trophy className="text-amber-500" size={20} />
            Leaderboard
          </h2>
          {countdown && (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
              <Clock size={14} />
              Resets in {countdown}
            </span>
          )}
        </div>
        {badgeCount > 0 && (
          <p className="text-xs font-semibold text-amber-700">
            {badges?.WEEKLY ? `🏆 Weekly Champion ×${badges.WEEKLY}` : ""}
            {badges?.WEEKLY && badges?.MONTHLY ? "  ·  " : ""}
            {badges?.MONTHLY ? `👑 Monthly Champion ×${badges.MONTHLY}` : ""}
          </p>
        )}
        <PeriodTabs onChange={setType} value={type} />
      </header>

      {spotlight && <ChampionsSpotlight type={type} />}

      <div className="min-h-[240px]">
        {loading ? (
          <ul aria-busy className="px-4 space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li className="h-8 rounded bg-gray-100 animate-pulse" key={i} />
            ))}
          </ul>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <p className="text-base font-semibold text-gray-800">
              The board is wide open
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Complete a lesson, question or quiz to claim the #1 spot{" "}
              {PERIOD_LABELS[type].toLowerCase()}.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <LeaderboardRow
                entry={entry}
                isViewer={!!user?.id && entry.userId === user.id}
                key={entry.userId ?? entry.rank}
              />
            ))}
          </ul>
        )}
      </div>

      {user?.id && !loading && (
        <ViewerSummary
          image={user.image}
          name={user.name ?? "You"}
          showRow={!viewerOnBoard}
          type={type}
          viewer={viewer}
        />
      )}

      {fullPageHref && (
        <a
          className="block border-t border-gray-100 px-4 py-3 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          href={fullPageHref}
        >
          View full leaderboard →
        </a>
      )}
    </section>
  );
};

export default LeaderboardCard;
