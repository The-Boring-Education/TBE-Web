import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";

interface UserInterest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  eventType: string;
  eventDescription?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API";
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserInterestsResponse {
  data: {
    interests: UserInterest[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const useUserInterests = (
  page = 1,
  limit = 10,
  eventType = "",
  source = "",
  isActive = "",
) => {
  const query = useQuery<UserInterestsResponse>({
    queryKey: ["userInterests", page, limit, eventType, source, isActive],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (eventType) params.eventType = eventType;
      if (source) params.source = source;
      if (isActive !== "") params.isActive = isActive;

      const response = await api.get("/user/interest", { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ...query,
    data: query.data?.data?.interests || [],
    pagination: query.data?.data?.pagination || {
      currentPage: page,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: limit,
      hasNextPage: false,
      hasPrevPage: false,
    },
    isLoading: query.isLoading,
  };
};

export const useUpdateUserInterest = () => {
  // For future use if we need to update interest status
  return {
    mutate: async (data: { interestId: string; isActive: boolean }) => {
      const response = await api.patch("/user/interest", data);
      return response.data;
    },
  };
};
