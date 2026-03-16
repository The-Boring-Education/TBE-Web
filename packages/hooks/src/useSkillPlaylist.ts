import { routes } from "@tbe/constants";
import type { PlaylistSkillCardProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

const useSkillPlaylist = (q: string) => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<any>({
    queryKey: queryKeys.youfocus.playlists(q),
    queryFn: () =>
      sendRequest({
        method: "GET",
        url: `${routes.api.youfocusExplore}?q=${encodeURIComponent(q)}`,
      }),
    ...CACHE_TIMES.STANDARD,
    enabled: !!q,
  });

  const playlists: PlaylistSkillCardProps[] = response?.data ?? [];
  const errorMessage =
    error?.message ??
    (response && (!response.data || response.data.length === 0)
      ? "No playlists found for this skill."
      : null);

  return { playlists, loading: isLoading, errorMessage };
};

export default useSkillPlaylist;
