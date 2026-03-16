import {
  CACHE_TIMES,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tbe/query";

import { resumeProgressService } from "@/services/resume-progress";
import type { SaveProgressRequest } from "@/types/resume";

export const useResumeProgress = () => {
  const queryClient = useQueryClient();

  const { data: progressData, isLoading } = useQuery({
    queryKey: queryKeys.resume.progress(),
    queryFn: () => resumeProgressService.getProgress(),
    ...CACHE_TIMES.STANDARD,
  });

  const saveProgressMutation = useMutation({
    mutationFn: (data: SaveProgressRequest) =>
      resumeProgressService.saveProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resume.all });
    },
  });

  return {
    progress: progressData?.progress,
    isLoading,
    saveProgress: saveProgressMutation.mutate,
    isSaving: saveProgressMutation.isPending,
    saveError: saveProgressMutation.error,
  };
};
