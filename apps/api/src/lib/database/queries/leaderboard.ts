import fs from "fs";
import path from "path";

import type {
  DatabaseQueryResponseType,
  LeaderboardModel,
  LeaderboardType,
  TBEAppType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Gamification, Leaderboard } from "../models";

/** Allow-list of valid leaderboard time-window values */
const VALID_LEADERBOARD_TYPES: LeaderboardType[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
];
/** Allow-list of valid TBE app identifiers */
const VALID_TBE_APPS: TBEAppType[] = [
  "PLATFORM",
  "PREPYATRA",
  "DSA_YATRA",
  "ONCAMPUS",
  "QUIZ",
];

const isSafeLeaderboardType = (v: unknown): v is LeaderboardType =>
  VALID_LEADERBOARD_TYPES.includes(v as LeaderboardType);

const isSafeTBEApp = (v: unknown): v is TBEAppType =>
  VALID_TBE_APPS.includes(v as TBEAppType);

const addLeaderboardTopperToDB = async (
  payload: Omit<LeaderboardModel, "createdAt" | "updatedAt">,
): Promise<DatabaseQueryResponseType> => {
  try {
    const data = await Leaderboard.create(payload);
    return { data };
  } catch (error) {
    logger.error("DB: addLeaderboardTopperToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to save leaderboard winner",
      details: error,
    };
  }
};

const getLeaderboardEntriesFromDB = async (
  type?: LeaderboardType,
  app?: TBEAppType,
): Promise<DatabaseQueryResponseType> => {
  try {
    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (app) query.app = app;
    const data = await Leaderboard.find(query).sort({ date: -1 });
    return { data };
  } catch (error) {
    logger.error("DB: getLeaderboardEntriesFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch leaderboard entries",
      details: error,
    };
  }
};

const saveLeaderboardToDB = async (
  type: LeaderboardType,
  entries: { userId: string; points: number }[],
  app?: TBEAppType,
): Promise<DatabaseQueryResponseType> => {
  try {
    // Look up from allow-list so only constant values reach the query (breaks taint chain)
    const safeType = VALID_LEADERBOARD_TYPES.find((t) => t === type);
    if (!safeType) {
      return { error: `Invalid leaderboard type: ${String(type)}` };
    }
    const safeAppLookup = app ? VALID_TBE_APPS.find((a) => a === app) : null;
    if (app !== undefined && !safeAppLookup) {
      return { error: `Invalid app: ${String(app)}` };
    }
    // null represents the global (no-app) leaderboard – the compound index handles it uniformly
    const safeApp = safeAppLookup ?? null;

    const filter = { type: safeType, app: safeApp };
    const result = await Leaderboard.findOneAndUpdate(
      filter,
      { type: safeType, app: safeApp, entries, date: new Date() },
      { upsert: true, new: true },
    );
    return { data: result };
  } catch (error) {
    logger.error("DB: saveLeaderboardToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to save leaderboard", details: error };
  }
};

const getLeaderboardWithUsersFromDB = async (
  type: LeaderboardType,
  app?: TBEAppType,
): Promise<DatabaseQueryResponseType> => {
  try {
    // Look up from allow-list so only constant values reach the query (breaks taint chain)
    const safeType = VALID_LEADERBOARD_TYPES.find((t) => t === type);
    if (!safeType) {
      return { error: `Invalid leaderboard type: ${String(type)}` };
    }
    const safeAppLookup = app ? VALID_TBE_APPS.find((a) => a === app) : null;
    if (app !== undefined && !safeAppLookup) {
      return { error: `Invalid app: ${String(app)}` };
    }
    const safeApp = safeAppLookup ?? null;

    const filter = { type: safeType, app: safeApp };
    const data = await Leaderboard.findOne(filter)
      .sort({ date: -1 })
      .populate("entries.userId", "name image");
    return { data };
  } catch (error) {
    logger.error("DB: getLeaderboardWithUsersFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch leaderboard with users",
      details: error,
    };
  }
};

const getStartDateByType = (type: LeaderboardType) => {
  const now = new Date();
  if (type === "DAILY") {
    now.setHours(0, 0, 0, 0);
  } else if (type === "WEEKLY") {
    const day = now.getDay();
    now.setDate(now.getDate() - day);
    now.setHours(0, 0, 0, 0);
  } else if (type === "MONTHLY") {
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
  }
  return now;
};

/** Static filename mapping for leaderboard types – ensures only safe strings reach the filesystem */
const LEADERBOARD_TYPE_FILENAMES: Record<LeaderboardType, string> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

/** Static filename mapping for TBE apps – ensures only safe strings reach the filesystem */
const TBE_APP_FILENAMES: Record<TBEAppType, string> = {
  PLATFORM: "platform",
  PREPYATRA: "prepyatra",
  DSA_YATRA: "dsa_yatra",
  ONCAMPUS: "oncampus",
  QUIZ: "quiz",
};

const generateLeaderboard = async (
  type: LeaderboardType,
  app?: TBEAppType,
): Promise<DatabaseQueryResponseType> => {
  try {
    // Look up from allow-list so only constant values reach the filesystem/query (breaks taint chain)
    const safeType = VALID_LEADERBOARD_TYPES.find((t) => t === type);
    if (!safeType) {
      return { error: `Invalid leaderboard type: ${String(type)}` };
    }
    const safeAppLookup = app ? VALID_TBE_APPS.find((a) => a === app) : null;
    if (app !== undefined && !safeAppLookup) {
      return { error: `Invalid app: ${String(app)}` };
    }

    const startDate = getStartDateByType(safeType);
    const endDate = new Date();

    const gamificationData = await Gamification.find();

    const userScores: Record<string, number> = {};

    gamificationData.forEach((user) => {
      const actions = user.actions.filter((a) => {
        const withinRange =
          a.createdAt !== undefined &&
          a.createdAt >= startDate &&
          a.createdAt <= endDate;
        // Filter by app when provided; otherwise include all actions
        const matchesApp = safeAppLookup ? a.app === safeAppLookup : true;
        return withinRange && matchesApp;
      });

      const total = actions.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      if (total > 0) {
        userScores[user.userId.toString()] =
          (userScores[user.userId.toString()] || 0) + total;
      }
    });

    const sorted = Object.entries(userScores)
      .sort((a, b) => b[1] - a[1])
      .map(([userId, points]) => ({ userId, points }));

    // Derive filename exclusively from static lookup maps – no user input reaches the path
    const typeFilename = LEADERBOARD_TYPE_FILENAMES[safeType];
    const appSuffix = safeAppLookup
      ? `_${TBE_APP_FILENAMES[safeAppLookup]}`
      : "";
    const publicDir = path.join(process.cwd(), "public", "leaderboards");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(publicDir, `${typeFilename}${appSuffix}.json`),
      JSON.stringify(sorted, null, 2),
    );

    return { data: sorted };
  } catch (error) {
    logger.error("DB: generateLeaderboard failed", {
      type,
      app,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to generate leaderboard", details: error };
  }
};

export {
  addLeaderboardTopperToDB,
  generateLeaderboard,
  getLeaderboardEntriesFromDB,
  getLeaderboardWithUsersFromDB,
  saveLeaderboardToDB,
};
