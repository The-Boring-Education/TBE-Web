import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { DashboardStats } from "@/types";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      try {
        const response = await api.get("/admin/dashboard?type=overview");
        return response.data?.data as DashboardStats;
      } catch (error) {
        console.error(
          "Failed to fetch dashboard stats, using mock data:",
          error,
        );
      }
    },
  });
};
