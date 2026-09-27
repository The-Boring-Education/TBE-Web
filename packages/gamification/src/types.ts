import type { AnalyticsCategory, LegacyAnalyticsAction } from "@tbe/constants";
import type { UserPointsActionType } from "@tbe/interface";
import type { LeaderboardType } from "@tbe/types";

// ── Theme ──

export type ThemeType = "light" | "dark";

// ── Celebration & Toast ──

export type CelebrationType = "points" | "levelup" | "achievement";
export type CelebrationIntensity = "low" | "medium" | "high";

export interface CelebrationData {
  type: CelebrationType;
  intensity: CelebrationIntensity;
}

export interface ToastData {
  type: CelebrationType;
  message: string;
  points?: number;
  level?: number;
  levelName?: string;
  /** e.g. "#7 this week ↑3" or a Pace Limit note. */
  rankLine?: string;
}

// ── Gamification Context ──

export interface GamificationContextType {
  triggerCelebration: (data: CelebrationData) => void;
  showToast: (data: ToastData) => void;
  theme: ThemeType;
}

// ── Gamified Action ──

export interface GamificationEvent {
  gamificationAction?: UserPointsActionType;
  analytics: {
    action: LegacyAnalyticsAction | string;
    category: AnalyticsCategory | string;
    label: string;
  };
  celebrationType?: CelebrationType;
  customMessage?: string;
  metadata?: Record<string, unknown>;
  /**
   * Outcome returned by the API that awarded a Learning Action. Learning Actions
   * are never posted from the browser; pass this to celebrate the server's result.
   */
  serverResult?: GamificationSummary | null;
}

// ── Level Info ──

export interface GamificationLevel {
  level: number;
  name: string;
  value: string;
  minPoints: number;
}

export interface LevelProgress {
  currentLevel: number;
  currentLevelName: string;
  nextLevelName: string | null;
  pointsLeftToNextLevel: number;
  percentageProgress: number;
}

// ── Leaderboard ──

export type NotCountedReason =
  | "ENGAGEMENT"
  | "MISSING_ITEM"
  | "ALREADY_CREDITED"
  | "NOT_CREDITED"
  | "PACE_LIMIT";

/** Points/rank outcome the API returns alongside an awarded action. */
export interface GamificationSummary {
  pointsEarned: number;
  lifetimePoints: number;
  countedForLeaderboard: boolean;
  notCountedReason?: NotCountedReason;
  weekly: { score: number; rank: number | null; previousRank: number | null };
}

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  displayName: string;
  image?: string;
  score: number;
  hidden?: boolean;
  excluded?: boolean;
}

export interface LeaderboardNextTarget {
  displayName: string;
  gap: number;
  rank: number;
}

export interface LeaderboardViewer {
  rank: number | null;
  score: number;
  nextTarget: LeaderboardNextTarget | null;
}

export interface LeaderboardBoard {
  type: LeaderboardType;
  periodKey: string;
  resetsAt: string;
  totalLearners: number;
  entries: LeaderboardEntry[];
  viewer?: LeaderboardViewer;
}

export interface LeaderboardChampion {
  rank: number;
  userId: string;
  displayName: string;
  image?: string;
  score: number;
}

export interface PeriodChampions {
  type: LeaderboardType;
  periodKey: string;
  closedAt: string;
  champions: LeaderboardChampion[];
}

export interface LeaderboardPreferences {
  visible: boolean;
  emails: boolean;
  excluded: boolean;
}

export interface MyLeaderboard {
  standings: Record<
    LeaderboardType,
    LeaderboardViewer & { periodKey: string; resetsAt: string }
  >;
  badges: { WEEKLY: number; MONTHLY: number };
  preferences: LeaderboardPreferences;
}

// ── Component Props ──

export interface PointsBadgeProps {
  variant?: "navbar" | "inline";
  className?: string;
  theme?: ThemeType;
}

export interface CelebrationAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
  type?: CelebrationType;
  intensity?: CelebrationIntensity;
}

export interface GamificationToastProps {
  isVisible: boolean;
  type: CelebrationType;
  message: string;
  points?: number;
  level?: number;
  levelName?: string;
  rankLine?: string;
  onClose: () => void;
  duration?: number;
  theme?: ThemeType;
}
