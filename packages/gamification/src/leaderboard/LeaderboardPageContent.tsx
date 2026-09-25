"use client";

import { LEADERBOARD_LIMITS, LEADERBOARD_TABS } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { LeaderboardType } from "@tbe/types";
import { Clock, Trophy, Users } from "lucide-react";
import { useState } from "react";

import useLeaderboard from "../useLeaderboard";
import useLeaderboardChampions from "../useLeaderboardChampions";
import { LeaderboardRow, ViewerSummary } from "./LeaderboardCard";
import {
  LearnerAvatar,
  PERIOD_LABELS,
  PeriodTabs,
  PREVIOUS_PERIOD_LABELS,
  useResetCountdown,
} from "./shared";

const ChampionsPodium = ({ type }: { type: LeaderboardType }) => {
  const { champions, loading } = useLeaderboardChampions(type);
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-bold text-amber-900">
        🏆 {PREVIOUS_PERIOD_LABELS[type]} Champions
      </h3>
      {loading ? (
        <div className="mt-3 h-16 rounded bg-amber-100 animate-pulse" />
      ) : !champions?.champions.length ? (
        <p className="mt-2 text-sm text-amber-800">
          Crowned when the Period closes. Could be you.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {champions.champions.map((c) => (
            <li className="flex items-center gap-2" key={c.userId}>
              <span aria-hidden>{["🥇", "🥈", "🥉"][c.rank - 1]}</span>
              <LearnerAvatar name={c.displayName} size={24} src={c.image} />
              <span className="flex-1 truncate text-sm font-medium text-amber-950">
                {c.displayName}
              </span>
              <span className="text-xs font-semibold text-amber-800 tabular-nums">
                {c.score} pts
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

/**
 * Full leaderboard page body: top 50 per Period, the learner's own row,
 * and Champions of each Period type.
 */
const LeaderboardPageContent = () => {
  const { user } = useUser();
  const [type, setType] = useState<LeaderboardType>("WEEKLY");
  const { board, entries, viewer, loading } = useLeaderboard(type, {
    limit: LEADERBOARD_LIMITS.PAGE,
  });
  const countdown = useResetCountdown(board?.resetsAt);
  const viewerOnBoard = entries.some((e) => e.userId === user?.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <header className="p-4 space-y-3 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Trophy className="text-amber-500" size={22} />
              TBE Leaderboard
            </h1>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
              {board && (
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {board.totalLearners} learning {PERIOD_LABELS[type].toLowerCase()}
                </span>
              )}
              {countdown && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Resets in {countdown}
                </span>
              )}
            </div>
          </div>
          <PeriodTabs onChange={setType} value={type} />
        </header>

        {loading ? (
          <ul aria-busy className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <li className="h-8 rounded bg-gray-100 animate-pulse" key={i} />
            ))}
          </ul>
        ) : entries.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            Nobody has learned yet {PERIOD_LABELS[type].toLowerCase()}. Be the first.
          </p>
        ) : (
          <ol className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <LeaderboardRow
                entry={entry}
                isViewer={!!user?.id && entry.userId === user.id}
                key={entry.userId ?? entry.rank}
              />
            ))}
          </ol>
        )}

        {user?.id && !loading && (
          <ViewerSummary
            image={user.image}
            name={user.name ?? "You"}
            showRow={!viewerOnBoard}
            type={type}
            viewer={viewer}
          />
        )}
      </section>

      <aside className="space-y-4">
        {LEADERBOARD_TABS.map((t) => (
          <ChampionsPodium key={t} type={t} />
        ))}
        <p className="text-xs text-gray-500 leading-relaxed">
          Points come from learning: chapters, questions, quizzes, projects and
          prep logs. Each item counts once, and the leaderboard counts one
          learning action every 3 minutes. Periods reset at midnight IST; weeks
          start Monday.
        </p>
      </aside>
    </div>
  );
};

export default LeaderboardPageContent;
