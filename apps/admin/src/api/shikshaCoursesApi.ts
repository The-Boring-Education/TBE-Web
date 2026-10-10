import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { shikshaCoursePaths } from "@/api/shikshaCoursePaths";
import api from "@/lib/axios";
import type { CourseLifecycleStatus, ShikshaCourse } from "@/types";
import { logApiError } from "@/utils/errorLogger";

export const SHIKSHA_COURSES_QUERY_KEY = ["shiksha-courses"];

// Admin-authenticated reads return courses in every lifecycle status.
export const useShikshaCourses = () => {
  const query = useQuery<{ data: ShikshaCourse[] }>({
    queryKey: SHIKSHA_COURSES_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get(shikshaCoursePaths.collection);
        return { data: res.data?.data || [] };
      } catch (error) {
        logApiError(error, "Fetch Shiksha Courses", false);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  return {
    ...query,
    data: (query.data?.data || []) as ShikshaCourse[],
    isLoading: query.isLoading,
  };
};

export const useUpdateShikshaCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      status,
    }: {
      courseId: string;
      status: CourseLifecycleStatus;
    }) => {
      const res = await api.patch(shikshaCoursePaths.status(courseId), {
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIKSHA_COURSES_QUERY_KEY });
    },
  });
};
