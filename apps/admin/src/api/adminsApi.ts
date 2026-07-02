import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import type {
  AdminUser,
  AdminUserFormData,
  AdminUserUpdateData,
} from "@/types";
import { logApiError } from "@/utils/errorLogger";

export const useAdmins = () => {
  const query = useQuery<AdminUser[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/admins");
        return (res.data?.data || []) as AdminUser[];
      } catch (error) {
        logApiError(error, "Fetch Admins", false);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  return {
    ...query,
    data: query.data || [],
  };
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminData: AdminUserFormData) => {
      const res = await api.post("/admin/admins", adminData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      adminId,
      updatedData,
    }: {
      adminId: string;
      updatedData: AdminUserUpdateData;
    }) => {
      const res = await api.patch(`/admin/admins/${adminId}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const res = await api.delete(`/admin/admins/${adminId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};
