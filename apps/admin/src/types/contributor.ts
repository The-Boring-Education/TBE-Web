export interface AdminContributionItem {
  _id: string;
  contributorId: string;
  userId: string;
  contributorName: string;
  contributorEmail: string;
  category: string;
  typeGroup: "blogs" | "code" | "content" | "community";
  proofUrl: string;
  title: string;
  description?: string;
  standardXp: number;
  awardedXp: number;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface AdminContributionsResponse {
  items: AdminContributionItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface ReviewSubmissionPayload {
  action: "approve" | "reject";
  awardedXp?: number;
  feedback?: string;
}
