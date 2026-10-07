"use client";

import usePublicLeaderboard from "../usePublicLeaderboard";
import { LearnerAvatar, RankBadge } from "./shared";

interface PublicLeaderboardStripProps {
  ctaHref: string;
  ctaLabel?: string;
}

/**
 * Logged-out social proof: this week's top learners (names masked "Priya S.")
 * and how many people learned this week.
 */
const PublicLeaderboardStrip = ({
  ctaHref,
  ctaLabel = "Start learning free",
}: PublicLeaderboardStripProps) => {
  const { board, loading } = usePublicLeaderboard("WEEKLY");

  if (loading || !board || board.entries.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Live leaderboard
      </p>
      <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
        {board.totalLearners.toLocaleString("en-IN")} learners levelled up this
        week
      </h2>
      <ol className="mx-auto mt-6 max-w-md divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white text-left shadow-sm">
        {board.entries.map((entry) => (
          <li className="flex items-center gap-3 px-4 py-3" key={entry.rank}>
            <RankBadge rank={entry.rank} />
            <LearnerAvatar name={entry.displayName} src={entry.image} />
            <span className="flex-1 truncate text-sm font-medium text-gray-800">
              {entry.displayName}
            </span>
            <span className="text-sm font-bold tabular-nums text-gray-900">
              {entry.score} pts
            </span>
          </li>
        ))}
      </ol>
      <a
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        href={ctaHref}
      >
        {ctaLabel}
      </a>
    </section>
  );
};

export default PublicLeaderboardStrip;
