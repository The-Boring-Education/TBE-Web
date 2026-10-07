import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { couponAdminPaths } from "@/api/couponPaths";
import api from "@/lib/axios";
import type { Coupon, CouponFormData } from "@/types";
import { logApiError } from "@/utils/errorLogger";

// Get all coupon
export const useCoupons = () => {
  const query = useQuery<{ data: Coupon[] }>({
    queryKey: ["coupon"],
    queryFn: async () => {
      try {
        const res = await api.get(couponAdminPaths.collection);
        return { data: res.data?.data || [] };
      } catch (error) {
        logApiError(error, "Fetch Coupons", false);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  return {
    ...query,
    data: (query.data?.data || []) as Coupon[],
    isLoading: query.isLoading,
  };
};

// Create coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: CouponFormData) => {
      const res = await api.post(couponAdminPaths.collection, couponData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
    },
  });
};

// Update coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      couponId,
      updatedData,
    }: {
      couponId: string;
      updatedData: CouponFormData;
    }) => {
      const res = await api.put(couponAdminPaths.item(couponId), updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
    },
  });
};

// Delete coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const res = await api.delete(couponAdminPaths.item(couponId));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
    },
  });
};

// Add sheet to coupon's applicable products
export const useAddSheetToCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      couponId,
      sheetId,
    }: {
      couponId: string;
      sheetId: string;
    }) => {
      const res = await api.post(couponAdminPaths.sheet(couponId, sheetId));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
      queryClient.invalidateQueries({ queryKey: ["interview-sheets"] });
    },
  });
};

// Remove sheet from coupon's applicable products
export const useRemoveSheetFromCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      couponId,
      sheetId,
    }: {
      couponId: string;
      sheetId: string;
    }) => {
      const res = await api.delete(couponAdminPaths.sheet(couponId, sheetId));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
      queryClient.invalidateQueries({ queryKey: ["interview-sheets"] });
    },
  });
};

// Bulk apply coupon to multiple sheets
export const useBulkApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      couponId,
      sheetIds,
    }: {
      couponId: string;
      sheetIds: string[];
    }) => {
      const res = await api.post(couponAdminPaths.bulkApply(couponId), {
        sheetIds,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
      queryClient.invalidateQueries({ queryKey: ["interview-sheets"] });
    },
  });
};
