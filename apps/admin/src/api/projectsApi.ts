import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { UserProject } from "@/types";

interface UserProjectsResponse {
  data: UserProject[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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
