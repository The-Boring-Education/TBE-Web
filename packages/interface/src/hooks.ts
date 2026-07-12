import type {
  AnalyticsCategory,
  AnalyticsLabel,
  LegacyAnalyticsAction,
} from "@tbe/constants";

import type { NotificationModel } from ".";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  isOnboarded: boolean;
}

export interface UseUserReturnType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  isOnboarded: boolean;
  updateSession: () => Promise<any>;
}

export type TrackEventProps = {
  action: LegacyAnalyticsAction;
  category: AnalyticsCategory;
  label?: AnalyticsLabel;
  value?: unknown;
};

export interface useFeedbackProps {
  type: string;
  refId?: string;
}

export interface usePaymentStatusProps {
  userId?: string;
  productId: string;
  productType?: string; // Optional: INTERVIEW_SHEET, SHIKSHA, PROJECTS, PREPYATRA, GENERAL
  isPremium?: boolean;
}

export type NotificationItemProps = Partial<NotificationModel>;

export interface useQuestionStarredProps {
  userId: string;
  sheetId: string;
  questionId: string;
  initialIsStarred: boolean;
}

export interface UsePaymentAccessProps {
  productId: string;
  productType?: string;
  isPremium?: boolean;
  isEnrolled?: boolean;
}
