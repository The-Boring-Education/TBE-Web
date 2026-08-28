import type { AnalyticsCategory, LegacyAnalyticsAction } from "@tbe/constants";
import type { UserPointsActionType } from "@tbe/interface";

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

export interface LeaderboardEntry {
  userId: string;
  name?: string;
  image?: string;
  points: number;
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
  onClose: () => void;
  duration?: number;
  theme?: ThemeType;
}
