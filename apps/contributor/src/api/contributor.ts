import { getAccessToken, getAuthApiUrl } from "@tbe/auth";
import type {
  ContributionCategoryType,
  ContributionStatusType,
  ContributionTypeGroup,
  ContributorRoleType,
} from "@tbe/constants";
import type { APIResponse } from "@tbe/types";

export type ContributorAPIResponse<T> = Pick<
  APIResponse<T>,
  "status" | "data" | "message"
>;

export interface ContributorProfile {
  name: string;
  email: string;
  role: ContributorRoleType;
  totalXp: number;
  approvedCount: number;
  pendingCount: number;
  isCaptain: boolean;
  avatar?: string;
}

export interface ContributionItem {
  _id: string;
  category: ContributionCategoryType;
  typeGroup: ContributionTypeGroup;
  title: string;
  proofUrl: string;
  standardXp: number;
  awardedXp: number;
  status: ContributionStatusType;
  adminFeedback?: string;
  createdAt: string;
}

export interface ContributionsPage {
  items: ContributionItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface SubmitContributionPayload {
  category: ContributionCategoryType;
  title: string;
  proofUrl: string;
  description?: string;
}

const request = async <T>(
  path: string,
  init?: RequestInit,
): Promise<ContributorAPIResponse<T>> => {
  const token = getAccessToken();
  const res = await fetch(`${getAuthApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
};

export const fetchContributorProfile = () =>
  request<ContributorProfile>("/contributor/profile");

export const fetchUserSubmissions = (
  typeGroup?: ContributionTypeGroup | "all",
  page = 1,
  limit = 20,
) => {
  const params = new URLSearchParams();
  if (typeGroup && typeGroup !== "all") {
    params.set("typeGroup", typeGroup);
  }
  params.set("page", String(page));
  params.set("limit", String(limit));
  return request<ContributionsPage>(
    `/contributor/submissions?${params.toString()}`,
  );
};

export const submitContribution = (payload: SubmitContributionPayload) =>
  request<ContributionItem>("/contributor/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
