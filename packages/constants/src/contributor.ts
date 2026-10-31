export const CONTRIBUTION_CATEGORIES = [
  "PR_BUG_FIX",
  "CREATE_ISSUE",
  "REVIEW_PR",
  "BLOG",
  "POST",
  "EVENT_SESSION",
] as const;

export type ContributionCategoryType = (typeof CONTRIBUTION_CATEGORIES)[number];

export const CONTRIBUTION_STATUS = ["pending", "approved", "rejected"] as const;

export type ContributionStatusType = (typeof CONTRIBUTION_STATUS)[number];

export const CONTRIBUTOR_ROLES = ["Contributor", "TBE Captain"] as const;

export type ContributorRoleType = (typeof CONTRIBUTOR_ROLES)[number];

export const CONTRIBUTION_TYPE_GROUPS = [
  "code",
  "blogs",
  "content",
  "community",
] as const;

export type ContributionTypeGroup = (typeof CONTRIBUTION_TYPE_GROUPS)[number];

export const CATEGORY_TO_TYPE_GROUP: Record<
  ContributionCategoryType,
  ContributionTypeGroup
> = {
  PR_BUG_FIX: "code",
  CREATE_ISSUE: "code",
  REVIEW_PR: "code",
  BLOG: "blogs",
  POST: "content",
  EVENT_SESSION: "community",
};

export const BASELINE_CATEGORY_XP: Record<ContributionCategoryType, number> = {
  PR_BUG_FIX: 5,
  CREATE_ISSUE: 3,
  REVIEW_PR: 2,
  BLOG: 5,
  POST: 5,
  EVENT_SESSION: 15,
};

export const CONTRIBUTION_CATEGORY_LABELS: Record<
  ContributionCategoryType,
  string
> = {
  PR_BUG_FIX: "Pull Request / Bug Fix",
  CREATE_ISSUE: "Create Issue / Bug Report",
  REVIEW_PR: "Review a PR",
  BLOG: "Technical Blog / Article",
  POST: "Social Media Post / Content",
  EVENT_SESSION: "Organize Event / Session",
};

export const CAPTAIN_XP_THRESHOLD = 100;
