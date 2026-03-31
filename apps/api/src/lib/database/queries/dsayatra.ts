import type {
  DatabaseQueryResponseType,
  DsaYatraProgressResponseProps,
  DsaYatraTodayStatsPayload,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { User } from "../models";

const normalizeDsaQuestionId = (questionId: string | number): string =>
  String(questionId);

const todayDateString = (): string => new Date().toDateString();

const buildProgressResponse = (
  progress:
    | {
        completedQuestionIds?: string[];
        todayStats?: { date?: string; solvedCount?: number };
      }
    | null
    | undefined,
): DsaYatraProgressResponseProps => {
  const ids = (progress?.completedQuestionIds ?? []).map((id) => String(id));
  const day = todayDateString();
  const ts = progress?.todayStats;
  const solvedToday = ts?.date === day ? Math.max(0, ts.solvedCount ?? 0) : 0;
  return { completedQuestionIds: ids, solvedToday };
};

const getDYUserByIdFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId);
    return { data: user };
  } catch (error) {
    logger.error("DB: getDYUserByIdFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch user from DB", details: error };
  }
};

const updateDYUserByIdInDB = async (
  userId: string,
  update: Record<string, any>,
  options: Record<string, any> = { new: true },
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, update, options);
    return { data: updatedUser };
  } catch (error) {
    logger.error("DB: updateDYUserByIdInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update user in DB", details: error };
  }
};

const getDsaYatraProgressFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId).select("dsaYatra.progress").lean();
    if (!user) {
      return { error: "User not found" };
    }
    const data = buildProgressResponse(user.dsaYatra?.progress);
    return { data };
  } catch (error) {
    logger.error("DB: getDsaYatraProgressFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch DSA Yatra progress", details: error };
  }
};

const patchDsaYatraQuestionCompletionInDB = async (
  userId: string,
  questionId: string | number,
  isCompleted: boolean,
): Promise<DatabaseQueryResponseType> => {
  try {
    const qid = normalizeDsaQuestionId(questionId);
    const user = await User.findById(userId).select("dsaYatra.progress");
    if (!user) {
      return { error: "User not found" };
    }

    const prev = user.dsaYatra?.progress;
    const idSet = new Set(
      (prev?.completedQuestionIds ?? []).map((id) => String(id)),
    );
    const day = todayDateString();
    let todayStats: DsaYatraTodayStatsPayload = {
      date: day,
      solvedCount: 0,
    };
    if (prev?.todayStats?.date === day) {
      todayStats = {
        date: day,
        solvedCount: Math.max(0, prev.todayStats.solvedCount ?? 0),
      };
    }

    const had = idSet.has(qid);
    let didMutate = false;
    if (isCompleted) {
      if (!had) {
        idSet.add(qid);
        todayStats.solvedCount += 1;
        didMutate = true;
      }
    } else if (had) {
      idSet.delete(qid);
      if (todayStats.solvedCount > 0) {
        todayStats.solvedCount -= 1;
      }
      didMutate = true;
    }

    if (didMutate) {
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            "dsaYatra.progress.completedQuestionIds": [...idSet],
            "dsaYatra.progress.todayStats": todayStats,
          },
        },
      );
    }

    return getDsaYatraProgressFromDB(userId);
  } catch (error) {
    logger.error("DB: patchDsaYatraQuestionCompletionInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update DSA Yatra question", details: error };
  }
};

const mergeDsaYatraProgressInDB = async (
  userId: string,
  addCompletedQuestionIds: string[],
  clientToday?: DsaYatraTodayStatsPayload,
): Promise<DatabaseQueryResponseType> => {
  try {
    const user = await User.findById(userId).select("dsaYatra.progress");
    if (!user) {
      return { error: "User not found" };
    }

    const prev = user.dsaYatra?.progress;
    const idSet = new Set(
      (prev?.completedQuestionIds ?? []).map((id) => String(id)),
    );
    for (const raw of addCompletedQuestionIds) {
      idSet.add(String(raw));
    }

    const day = todayDateString();
    let todayStats: DsaYatraTodayStatsPayload = {
      date: day,
      solvedCount: 0,
    };
    if (prev?.todayStats?.date === day) {
      todayStats = {
        date: day,
        solvedCount: Math.max(0, prev.todayStats.solvedCount ?? 0),
      };
    }

    if (clientToday?.date === day) {
      todayStats.solvedCount = Math.max(
        todayStats.solvedCount,
        Math.max(0, clientToday.solvedCount ?? 0),
      );
    }

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          "dsaYatra.progress.completedQuestionIds": [...idSet],
          "dsaYatra.progress.todayStats": todayStats,
        },
      },
    );

    return getDsaYatraProgressFromDB(userId);
  } catch (error) {
    logger.error("DB: mergeDsaYatraProgressInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to merge DSA Yatra progress", details: error };
  }
};

export {
  getDsaYatraProgressFromDB,
  getDYUserByIdFromDB,
  mergeDsaYatraProgressInDB,
  patchDsaYatraQuestionCompletionInDB,
  updateDYUserByIdInDB,
};
