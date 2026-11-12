import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import type {
  ChapterFormData,
  Course,
  CourseFormData,
  UserCourse,
} from "@/types";

interface UserCoursesResponse {
  data: UserCourse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useUserCourses = (page = 1, limit = 10, search = "") => {
  const query = useQuery<UserCoursesResponse>({
    queryKey: ["user-courses", page, limit, search],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard", {
        params: {
          type: "user-courses",
          page,
          limit,
          search,
        },
      });

      const { items, total, totalPages } = response.data?.data || [];

      return {
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    },
  });

  return {
    ...query,
    data: query.data?.data || [],
    pagination: query.data?.pagination || {
      total: 0,
      page,
      limit,
      totalPages: 0,
    },
    isLoading: query.isLoading,
  };
};

export const useCourses = () => {
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.get("/shiksha");
      return response.data?.data || [];
    },
  });
};

export const useCourse = (courseId?: string) => {
  return useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await api.get(`/shiksha/${courseId}`);
      return response.data?.data;
    },
    enabled: Boolean(courseId),
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CourseFormData) => {
      const response = await api.post("/shiksha", {
        ...payload,
        title: payload.name,
      });
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      data,
    }: {
      courseId: string;
      data: Partial<CourseFormData>;
    }) => {
      const response = await api.patch(`/shiksha/${courseId}`, {
        ...data,
        ...(data.name ? { title: data.name } : {}),
      });
      return response.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({
        queryKey: ["course", variables.courseId],
      });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.delete(`/shiksha/${courseId}`);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      status,
    }: {
      courseId: string;
      status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    }) => {
      const response = await api.patch(`/shiksha/${courseId}/status`, {
        status,
      });
      return response.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({
        queryKey: ["course", variables.courseId],
      });
    },
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      data,
    }: {
      courseId: string;
      data: ChapterFormData;
    }) => {
      const response = await api.post(`/shiksha/${courseId}/chapter`, data);
      return response.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({
        queryKey: ["course", variables.courseId],
      });
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      chapterId,
      data,
    }: {
      courseId: string;
      chapterId: string;
      data: Partial<ChapterFormData>;
    }) => {
      const response = await api.patch(
        `/shiksha/${courseId}/chapter/${chapterId}`,
        data,
      );
      return response.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({
        queryKey: ["course", variables.courseId],
      });
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      chapterId,
    }: {
      courseId: string;
      chapterId: string;
    }) => {
      const response = await api.delete(
        `/shiksha/${courseId}/chapter/${chapterId}`,
      );
      return response.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({
        queryKey: ["course", variables.courseId],
      });
    },
  });
};
