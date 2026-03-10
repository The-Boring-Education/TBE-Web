export type ChallengeStatus = "active" | "completed" | "paused" | "cancelled";

export interface Challenge {
  _id: string;
  user: string;
  name: string;
  description?: string;
  totalDays: number;
  currentDay: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  category?: string;
  predefinedType?: string; // ID of the predefined challenge template
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ChallengeLog {
  _id: string;
  challenge: string;
  day: number;
  progressText: string;
  hoursSpent: number;
  nextGoals: string[];
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateChallengeRequest {
  name: string;
  description?: string;
  totalDays: number;
  category?: string;
  predefinedType?: string; // ID of the predefined challenge template
  learningPath?: string[];
}

export interface UpdateChallengeRequest {
  challengeId: string;
  name?: string;
  description?: string;
  totalDays?: number;
  category?: string;
  isActive?: boolean;
}

export interface CreateChallengeLogRequest {
  challengeId: string;
  day: number;
  progressText: string;
  hoursSpent: number;
  nextGoals: string[];
  copyToPrepLogs?: boolean;
}

export interface ChallengeProgress {
  challengeId: string;
  totalDays: number;
  completedDays: number;
  currentDay: number;
  progressPercentage: number;
  totalHours: number;
  currentStreak: number;
  maxStreak: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ChallengesResponse {
  success: boolean;
  message: string;
  data: Challenge[];
}

export interface ChallengeLogsResponse {
  success: boolean;
  message: string;
  data: ChallengeLog[];
}

export interface SingleChallengeResponse {
  success: boolean;
  message: string;
  data: Challenge;
}

export interface SocialMediaTemplate {
  challengeName: string;
  currentDay: number;
  progressText: string;
  nextGoals: string[];
  appUrl: string;
}
