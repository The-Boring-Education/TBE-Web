import { useMutation, useQuery, useQueryClient } from "react-query"

import { resumeProgressService } from "@/services/resume-progress"
import type { SaveProgressRequest } from "@/types/resume"

export const useResumeProgress = () => {
    const queryClient = useQueryClient()

    const { data: progressData, isLoading } = useQuery(
        "resumeProgress",
        () => resumeProgressService.getProgress(),
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1
        }
    )

    const saveProgressMutation = useMutation(
        (data: SaveProgressRequest) => resumeProgressService.saveProgress(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("resumeProgress")
            }
        }
    )

    return {
        progress: progressData?.progress,
        isLoading,
        saveProgress: saveProgressMutation.mutate,
        isSaving: saveProgressMutation.isLoading,
        saveError: saveProgressMutation.error
    }
}
