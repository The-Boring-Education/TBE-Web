import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { User } from "@/types";

interface UsersResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useUsers = (page = 1, limit = 10, search = "") => {
  const query = useQuery<UsersResponse>({
    queryKey: ["users", page, limit, search],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard", {
        params: {
          type: "users",
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
