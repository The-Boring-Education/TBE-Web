import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { challengesService } from "@tbe/services";
import type { Challenge, ChallengeProgress } from "@tbe/types";

export default function useChallenges(userId: string) {
  const {
    data: challenges = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Challenge[]>({
    queryKey: queryKeys.challenges.lists(),
    queryFn: () => challengesService.getByUserId(userId),
    ...CACHE_TIMES.STANDARD,
    enabled: !!userId,
  });

  const activeChallenges = challenges.filter((challenge) => challenge.isActive);
  const completedChallenges = challenges.filter(
    (challenge) => !challenge.isActive,
  );
  const totalChallenges = challenges.length;

  const currentChallenge =
    activeChallenges.length > 0
      ? activeChallenges.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      : null;

  const totalDaysCommitted = challenges.reduce(
    (acc, challenge) => acc + challenge.totalDays,
    0,
  );

  const completionRate =
    totalChallenges > 0
      ? Math.round((completedChallenges.length / totalChallenges) * 100)
      : 0;

  const getRecentChallenges = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return challenges.filter(
      (challenge) => new Date(challenge.createdAt) >= thirtyDaysAgo,
    );
  };

  const recentChallenges = getRecentChallenges();

  return {
    challenges,
    activeChallenges,
    completedChallenges,
    currentChallenge,
    totalChallenges,
    totalDaysCommitted,
    completionRate,
    recentChallenges,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

export function useChallengeProgress(challengeId: string | null) {
  const {
    data: progress,
    isLoading,
    error,
    refetch,
  } = useQuery<ChallengeProgress>({
    queryKey: queryKeys.challenges.progress(challengeId ?? ""),
    queryFn: () => challengesService.getProgress(challengeId!),
    ...CACHE_TIMES.STANDARD,
    enabled: !!challengeId,
  });

  return {
    progress: progress ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
