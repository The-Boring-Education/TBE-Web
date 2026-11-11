import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";

export interface ProjectSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageURL?: string;
  roadmap?: string;
  difficultyLevel?: string;
  isActive?: boolean;
  sections?: unknown[];
}

export interface UserProjectProgress {
  _id: string;
  user?: {
    userName?: string;
    userEmail?: string;
    userContactNo?: string;
  };
  project?: {
    name?: string;
    slug?: string;
  };
  isCompleted?: boolean;
  lastUpdated?: string;
}

interface UserProjectsResponse {
  data: UserProjectProgress[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useProjects = () =>
  useQuery<ProjectSummary[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return response.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useUserProjects = (page = 1, limit = 10, search = "") => {
  const query = useQuery<UserProjectsResponse>({
    queryKey: ["user-projects", page, limit, search],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard", {
        params: {
          type: "user-projects",
          page,
          limit,
          search,
        },
      });

      const responseData = response.data?.data || {};
      return {
        data: responseData.items || [],
        pagination: {
          total: responseData.total || 0,
          page,
          limit,
          totalPages: responseData.totalPages || 0,
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
