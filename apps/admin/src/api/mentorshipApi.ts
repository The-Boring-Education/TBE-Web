import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { UserWithPrepLogs } from "@/types";

// Types for mentorship
export interface MentorshipUser extends UserWithPrepLogs {
  mentorshipSelectedAt?: string;
  mentorshipNote?: string;
}

export interface MentorshipResponse {
  status: boolean;
  message: string;
  data: {
    mentees: MentorshipUser[];
    totalMentees: number;
  };
}

export interface MentorshipToggleRequest {
  userId: string;
  isSelected: boolean;
  note?: string;
}

export interface MentorshipToggleResponse {
  status: boolean;
  message: string;
  data?: any;
}

// Get all mentees
export const useMentees = () => {
  return useQuery<MentorshipUser[]>({
    queryKey: ["mentees"],
    queryFn: async () => {
      // This would call your webapp API endpoint
      const response = await api.get("/admin/mentorship/mentees");
      return response.data.data.mentees;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Toggle mentorship status
export const useMentorshipToggle = () => {
  const queryClient = useQueryClient();

  return useMutation<MentorshipToggleResponse, Error, MentorshipToggleRequest>({
    mutationFn: async (data: MentorshipToggleRequest) => {
      // This would call your webapp API endpoint
      const response = await api.post("/admin/mentorship/toggle", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch mentees list
      queryClient.invalidateQueries({ queryKey: ["mentees"] });
      // Also invalidate prep logs to update the UI
      queryClient.invalidateQueries({ queryKey: ["prep-logs"] });
    },
  });
};

// Remove from mentorship
export const useRemoveFromMentorship = () => {
  const queryClient = useQueryClient();

  return useMutation<MentorshipToggleResponse, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      // This would call your webapp API endpoint
      const response = await api.delete(`/admin/mentorship/mentees/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch mentees list
      queryClient.invalidateQueries({ queryKey: ["mentees"] });
      // Also invalidate prep logs to update the UI
      queryClient.invalidateQueries({ queryKey: ["prep-logs"] });
    },
  });
};

// Send mentorship notification email
export const useSendMentorshipNotification = () => {
  return useMutation<
    MentorshipToggleResponse,
    Error,
    { userId: string; userEmail: string; userName: string }
  >({
    mutationFn: async ({ userId, userEmail, userName }) => {
      // This would call your webapp API endpoint to send email
      const response = await api.post("/admin/mentorship/send-notification", {
        userId,
        userEmail,
        userName,
      });
      return response.data;
    },
  });
};

// Check if user is already a mentee
export const useIsMentee = (userId: string) => {
  return useQuery<boolean>({
    queryKey: ["is-mentee", userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/v1/admin/mentorship/check/${userId}`);
        return response.data.data.isMentee;
      } catch (error) {
        return false;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
