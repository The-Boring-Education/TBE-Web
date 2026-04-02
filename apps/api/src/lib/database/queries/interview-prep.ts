import { DSA_TOPICS, modelSelectParams } from "@/lib/constants";
import type {
  AddInterviewQuestionRequestPayloadProps,
  AddInterviewSheetRequestPayloadProps,
  BaseInterviewSheetResponseProps,
  DatabaseQueryResponseType,
  DSADifficultyType,
  DSADomainType,
  DSATopicType,
  SheetEnrollmentRequestProps,
  UpdateDSAQuestionRequestPayloadProps,
  UpdateInterviewSheetRequestPayloadProps,
} from "@/lib/interfaces";
import { generateYouTubeSearchLink } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

import {
  DSAQuestion,
  InterviewSheet,
  StudyGuide,
  User,
  UserSheet,
} from "../models";
import { toObjectId } from "./common";
import { updateUserPointsInDB } from "./gamification";
import { checkPaymentStatusFromDB } from "./payment";

const DSA_YATRA_SYSTEM_SHEET_ID = "650000000000000000000d5a";

const getUserDSATargetCompanies = async (userId: string): Promise<string[]> => {
  const user = await User.findById(userId)
    .select("prepYatra.targetCompanies dsaYatra.target")
    .lean<{
      prepYatra?: { targetCompanies?: string[] };
      dsaYatra?: { target?: string };
    }>();

  const dsaTarget = user?.dsaYatra?.target;
  let dsaMappedTargets: string[] = [];

  if (dsaTarget === "Product-based") {
    dsaMappedTargets = ["MNC", "FAANG"];
  } else if (dsaTarget === "Startups") {
    dsaMappedTargets = ["Startup"];
  }

  if (dsaMappedTargets.length > 0) {
    return dsaMappedTargets;
  }

  return user?.prepYatra?.targetCompanies || [];
};

const addAInterviewSheetToDB = async (
  sheetPayload: AddInterviewSheetRequestPayloadProps,
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = new InterviewSheet(sheetPayload);
    await sheet.save();
    return { data: sheet };
  } catch (error) {
    logger.error("DB: addAInterviewSheetToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add interview sheet", details: error };
  }
};

const getAllInterviewSheetsFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const sheet = await InterviewSheet.find()
        .select(modelSelectParams.coursePreview)
        .exec();

      if (!sheet) {
        return { error: "InterviewSheet not found" };
      }

      return { data: sheet };
    } catch (error) {
      logger.error("DB: getAllInterviewSheetsFromDB failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return { error: "Failed to fetch interview sheets", details: error };
    }
  };

const getInterviewSheetBySlugFromDB = async (
  slug: string,
  userId?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findOne({ slug });

    if (!sheet) {
      return { error: "Sheet not found" };
    }

    let isEnrolled = false;
    let mappedQuestions = (sheet.questions || []).map((q) => q.toObject());

    if (userId) {
      const targetCompanies = await getUserDSATargetCompanies(userId);
      const userSheet = await UserSheet.findOne({
        userId,
        sheetId: sheet._id,
      });

      isEnrolled = !!userSheet;

      // Filter questions based on personalization settings if targets are set
      if (targetCompanies.length > 0) {
        mappedQuestions = mappedQuestions.filter((question: any) => {
          if (!question.companyTypes || question.companyTypes.length === 0)
            return true;
          return question.companyTypes.some((type: string) =>
            targetCompanies.includes(type),
          );
        });
      }

      if (userSheet) {
        mappedQuestions = mappedQuestions.map((question: any) => {
          const userQuestion = userSheet.questions.find(
            (uq) => uq.questionId.toString() === question._id.toString(),
          );

          return {
            ...question,
            isCompleted: userQuestion?.isCompleted || false,
            isStarred: userQuestion?.isStarred || false,
          };
        });
      } else if (targetCompanies.length > 0) {
        // Even if not enrolled, the list of questions should be personalized
        // mappedQuestions is already filtered above
      }
    }

    return {
      data: {
        ...sheet.toObject(),
        isEnrolled,
        questions: mappedQuestions,
      },
    };
  } catch (error) {
    logger.error("DB: getInterviewSheetBySlugFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch interview sheet by slug", details: error };
  }
};

const getInterviewSheetByIDFromDB = async (
  id: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findOne({ _id: id });

    if (!sheet) {
      return { error: "Sheet not found" };
    }

    return { data: sheet };
  } catch (error) {
    logger.error("DB: getInterviewSheetByIDFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch interview sheet by ID", details: error };
  }
};

const updateInterviewSheetInDB = async ({
  sheetId,
  updatedData,
}: UpdateInterviewSheetRequestPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedCourse = await InterviewSheet.findByIdAndUpdate(
      sheetId,
      updatedData,
      { new: true },
    );

    if (!updatedCourse) return { error: "Sheet does not exists" };

    return { data: updatedCourse };
  } catch (error) {
    logger.error("DB: updateInterviewSheetInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while updating sheet", details: error };
  }
};

const updateInterviewQuestionInDB = async (
  sheetId: string,
  questionId: string,
  {
    title,
    question,
    answer,
    frequency,
    priority,
    companyTypes,
    resources,
  }: Partial<AddInterviewQuestionRequestPayloadProps>,
) => {
  try {
    const course = await InterviewSheet.findOneAndUpdate(
      { _id: sheetId, "questions._id": questionId },
      {
        $set: {
          "questions.$.title": title,
          "questions.$.question": question,
          "questions.$.answer": answer,
          "questions.$.frequency": frequency,
          "questions.$.priority": priority,
          "questions.$.companyTypes": companyTypes,
          "questions.$.resources": resources,
        },
      },
      { new: true },
    );

    return { data: course };
  } catch (error) {
    logger.error("DB: updateInterviewQuestionInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update interview question", details: error };
  }
};

// Delete a question from a sheet
const deleteQuestionFromSheetInDB = async (
  sheetId: string,
  questionId: string,
) => {
  try {
    const course = await InterviewSheet.findOneAndUpdate(
      { _id: sheetId },
      { $pull: { questions: { _id: questionId } } },
      { new: true },
    );

    return { data: course };
  } catch (error) {
    logger.error("DB: deleteQuestionFromSheetInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to delete question from sheet", details: error };
  }
};

const addQuestionToInterviewSheetInDB = async (
  sheetId: string,
  question: AddInterviewQuestionRequestPayloadProps,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedSheet = await InterviewSheet.findOneAndUpdate(
      { _id: sheetId },
      { $push: { questions: question } },
      { new: true },
    );

    if (!updatedSheet) {
      return { error: "Interview sheet not found" };
    }

    return { data: updatedSheet };
  } catch (error) {
    logger.error("DB: addQuestionToInterviewSheetInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to add question to interview sheet",
      details: error,
    };
  }
};

const enrollInASheet = async ({
  userId,
  sheetId,
}: SheetEnrollmentRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findById(sheetId).lean();
    if (!sheet) {
      return { error: "Sheet not found" };
    }

    const questions = (sheet.questions || []).map((question: any) => ({
      questionId: question._id,
      isCompleted: false,
    }));

    const userSheet = await UserSheet.create({
      userId,
      sheetId,
      questions,
    });

    // Enrollment Sheet was successful add Points
    await updateUserPointsInDB(userId, "ENROLL_SHEET");

    return { data: userSheet };
  } catch (error) {
    logger.error("DB: enrollInASheet failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while enrolling in a sheet", details: error };
  }
};

const getEnrolledSheetFromDB = async ({
  userId,
  sheetId,
}: SheetEnrollmentRequestProps): Promise<DatabaseQueryResponseType> => {
  try {
    const enrolledSheet = await UserSheet.findOne({ userId, sheetId });
    return { data: enrolledSheet };
  } catch (error) {
    logger.error("DB: getEnrolledSheetFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching enrolled sheet", details: error };
  }
};

const getAllEnrolledSheetsFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const enrolledSheets = await UserSheet.find({ userId })
      .populate({
        path: "sheet",
        select: `${modelSelectParams.coursePreview} questions`,
      })
      .sort({ updatedAt: -1 }) // Sort by last updated, most recent first
      .exec();

    return {
      data: enrolledSheets
        .map((userSheet) => {
          const sheet = userSheet.sheet as any;
          const totalQuestions = sheet?.questions?.length || 0;
          const completedQuestions =
            userSheet.questions?.filter((q: any) => q.isCompleted).length || 0;
          const progressPercentage =
            totalQuestions > 0
              ? Math.round((completedQuestions / totalQuestions) * 100)
              : 0;

          // Access updatedAt from the document (Mongoose adds it via timestamps)
          const userSheetObj = userSheet.toObject() as any;

          if (!sheet) return null;

          return {
            ...sheet.toObject(),
            isEnrolled: true,
            lastUpdated: userSheetObj.updatedAt || userSheetObj.createdAt,
            progress: {
              completed: completedQuestions,
              total: totalQuestions,
              percentage: progressPercentage,
            },
          };
        })
        .filter(Boolean),
    };
  } catch (error) {
    logger.error("DB: getAllEnrolledSheetsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching enrolled sheets", details: error };
  }
};

const markQuestionCompletedByUser = async (
  userId: string,
  sheetId: string,
  questionId: string,
  isCompleted: boolean,
): Promise<DatabaseQueryResponseType> => {
  try {
    let userSheet = await UserSheet.findOne({ userId, sheetId });

    if (!userSheet) {
      // Auto-enroll if accessible
      const sheet = await InterviewSheet.findById(sheetId);
      if (!sheet) return { error: "Sheet not found" };

      const isPremium = sheet.isPremium;
      let hasAccess = !isPremium;

      if (isPremium) {
        const { data: paymentData } = await checkPaymentStatusFromDB(
          userId,
          sheetId,
          "INTERVIEW_SHEET",
        );
        if (paymentData?.purchased) hasAccess = true;
      }

      if (hasAccess) {
        await enrollInASheet({ userId, sheetId });
        userSheet = await UserSheet.findOne({ userId, sheetId });
      } else {
        return {
          error:
            "User is not enrolled and does not have access to this premium sheet",
        };
      }
    }

    if (!userSheet) return { error: "Failed to auto-enroll user" };

    const qid = toObjectId(questionId);
    let updatedSheet = await UserSheet.findOneAndUpdate(
      { userId, sheetId, "questions.questionId": qid },
      { $set: { "questions.$.isCompleted": isCompleted } },
      { new: true },
    );

    // If question not found in UserSheet, it might be a newly added question
    if (!updatedSheet) {
      updatedSheet = await UserSheet.findOneAndUpdate(
        { userId, sheetId },
        { $push: { questions: { questionId: qid, isCompleted } } },
        { new: true },
      );
    }

    return { data: updatedSheet };
  } catch (error) {
    logger.error("DB: markQuestionCompletedByUser failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to mark question as completed", details: error };
  }
};

const getAllQuestionsByUser = async (userId: string) => {
  try {
    const userSheets = await UserSheet.find({ userId }).populate(
      "questions.questionId",
    );

    if (!userSheets.length) {
      return { data: [], error: "No questions found for this user" };
    }

    const allQuestions = userSheets.flatMap((sheet) => sheet.questions);

    return { data: allQuestions };
  } catch (error) {
    logger.error("DB: getAllQuestionsByUser failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Error fetching questions from the database",
      details: error,
    };
  }
};

const getASheetFromDBById = async (
  sheetId: string,
  userId?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findById(sheetId);

    if (!sheet) {
      return { error: "Sheet not found" };
    }

    if (userId) {
      const { data } = await getEnrolledSheetFromDB({ userId, sheetId });

      return {
        data: {
          ...sheet.toObject(),
          isEnrolled: !!data,
        } as BaseInterviewSheetResponseProps,
      };
    }

    return { data: sheet };
  } catch (error) {
    logger.error("DB: getASheetFromDBById failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching a sheet", details: error };
  }
};

const getASheetForUserFromDB = async (userId: string, sheetId: string) => {
  try {
    const userSheet = await UserSheet.findOne({ userId, sheetId })
      .populate({
        path: "sheet",
      })
      .exec();

    if (!userSheet) {
      const { data: sheet } = await getASheetFromDBById(sheetId);
      return { data: { ...sheet.toObject(), isEnrolled: false } };
    }

    const mappedQuestions = (userSheet.sheet.questions || []).map(
      (question) => {
        const userQuestion = userSheet.questions.find(
          (uc) => uc.questionId.toString() === question._id.toString(),
        );
        return {
          ...question.toObject(),
          isCompleted: userQuestion?.isCompleted,
          isStarred: userQuestion?.isStarred,
        };
      },
    );

    const updatedSheetResponse = {
      ...userSheet.sheet.toObject(),
      questions: mappedQuestions,
    };

    return {
      data: {
        ...updatedSheetResponse,
        isEnrolled: true,
      } as BaseInterviewSheetResponseProps,
    };
  } catch (error) {
    logger.error("DB: getASheetForUserFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch sheet for user",
      details: error,
    };
  }
};

const markQuestionStarredByUser = async (
  userId: string,
  sheetId: string,
  questionId: string,
  isStarred: boolean,
): Promise<DatabaseQueryResponseType> => {
  try {
    let userSheet = await UserSheet.findOne({ userId, sheetId });

    if (!userSheet) {
      // Auto-enroll if accessible
      const sheet = await InterviewSheet.findById(sheetId);
      if (!sheet) return { error: "Sheet not found" };

      const isPremium = sheet.isPremium;
      let hasAccess = !isPremium;

      if (isPremium) {
        const { data: paymentData } = await checkPaymentStatusFromDB(
          userId,
          sheetId,
          "INTERVIEW_SHEET",
        );
        if (paymentData?.purchased) hasAccess = true;
      }

      if (hasAccess) {
        await enrollInASheet({ userId, sheetId });
        userSheet = await UserSheet.findOne({ userId, sheetId });
      } else {
        return {
          error:
            "User is not enrolled and does not have access to this premium sheet",
        };
      }
    }

    if (!userSheet) return { error: "Failed to auto-enroll user" };

    const qid = toObjectId(questionId);
    let updatedSheet = await UserSheet.findOneAndUpdate(
      { userId, sheetId, "questions.questionId": qid },
      { $set: { "questions.$.isStarred": isStarred } },
      { new: true },
    );

    // If question not found in UserSheet, it might be a newly added question
    if (!updatedSheet) {
      updatedSheet = await UserSheet.findOneAndUpdate(
        { userId, sheetId },
        { $push: { questions: { questionId: qid, isStarred } } },
        { new: true },
      );
    }

    return { data: updatedSheet };
  } catch (error) {
    logger.error("DB: markQuestionStarredByUser failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to mark question as starred", details: error };
  }
};

const getStarredQuestionsFromDB = async (userId: string, sheetId: string) => {
  try {
    const userSheet = await UserSheet.findOne({ userId, sheetId });

    if (!userSheet) {
      return { error: "UserSheet not found" };
    }

    const starredQuestions = userSheet.questions.filter(
      (q) => q.isStarred === true,
    );
    return { data: starredQuestions };
  } catch (error) {
    logger.error("DB: getStarredQuestionsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to get starred questions", details: error };
  }
};

const deleteInterviewSheetFromDB = async (
  sheetId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findById(String(sheetId));
    if (!sheet) {
      return { error: "Interview sheet not found" };
    }
    const questionsCount = sheet.questions?.length || 0;
    const sheetName = sheet.name;
    await InterviewSheet.findByIdAndDelete(String(sheetId));

    logger.info("Interview sheet deleted successfully", {
      sheetName,
      sheetId,
      questionsDeleted: questionsCount,
    });
    return {
      data: {
        deletedSheetId: sheetId,
        deletedSheetName: sheetName,
        questionsDeleted: questionsCount,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    logger.error("DB: deleteInterviewSheetFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to delete interview sheet", details: error };
  }
};

interface DSASheetFilters {
  domain?: DSADomainType | DSADomainType[];
  difficulty?: DSADifficultyType | DSADifficultyType[];
  companyTypes?: string | string[];
  topics?: string | string[];
  page?: number;
  limit?: number;
  userId?: string;
}

const getAllDSAQuestionsFromDB = async (
  filters: DSASheetFilters = {},
): Promise<DatabaseQueryResponseType> => {
  try {
    const {
      domain,
      difficulty,
      companyTypes,
      topics,
      page = 1,
      limit = 50,
      userId,
    } = filters;

    // Build match stage for filtering
    const matchStage: any = {};

    if (domain) {
      const domains = Array.isArray(domain) ? domain : [domain];
      matchStage.domain = { $in: domains };
    }

    if (difficulty) {
      const difficulties = Array.isArray(difficulty)
        ? difficulty
        : [difficulty];
      matchStage.difficulty = { $in: difficulties };
    }

    if (companyTypes) {
      const types = Array.isArray(companyTypes) ? companyTypes : [companyTypes];
      matchStage.companyTypes = { $in: types };
    }

    if (topics) {
      const topicsList = Array.isArray(topics) ? topics : [topics];
      matchStage.topics = { $in: topicsList };
    }

    // Intersection logic ensures only questions within user's focus are returned
    if (userId) {
      const targets = await getUserDSATargetCompanies(userId);
      if (targets.length > 0) {
        if (matchStage.companyTypes) {
          const currentIn = matchStage.companyTypes.$in || [];
          const intersection = currentIn.filter((t: string) =>
            targets.includes(t),
          );
          matchStage.companyTypes = {
            $in: intersection.length > 0 ? intersection : targets,
          };
        } else {
          matchStage.companyTypes = { $in: targets };
        }
      }
    }

    const totalCount = await DSAQuestion.countDocuments(matchStage);

    const DSA_TOPIC_SORT_ORDER = [
      "ARRAY",
      "STRING",
      "HASHMAP",
      "TWO_POINTERS",
      "SLIDING_WINDOW",
      "PREFIX_SUM",
      "SORTING",
      "BINARY_SEARCH",
      "MATH",
      "BIT_MANIPULATION",
      "RECURSION",
      "LINKED_LIST",
      "STACK",
      "QUEUE",
      "BINARY_TREE",
      "TREE",
      "BST",
      "HEAP",
      "TRIE",
      "GRAPH",
      "DFS",
      "BFS",
      "BACKTRACKING",
      "DYNAMIC_PROGRAMMING",
      "GREEDY",
      "UNION_FIND",
    ];

    // Fetch user preferences for personalization
    let targetCompanies: string[] = [];
    if (userId) {
      targetCompanies = await getUserDSATargetCompanies(userId);
    }

    const aggregate: any[] = [
      { $match: matchStage },
      {
        $addFields: {
          _topicOrder: {
            $let: {
              vars: {
                idx: {
                  $indexOfArray: [
                    DSA_TOPIC_SORT_ORDER,
                    { $arrayElemAt: ["$topics", 0] },
                  ],
                },
              },
              in: { $cond: [{ $eq: ["$$idx", -1] }, 999, "$$idx"] },
            },
          },
          _difficultyOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$difficulty", "EASY"] }, then: 1 },
                { case: { $eq: ["$difficulty", "MEDIUM"] }, then: 2 },
                { case: { $eq: ["$difficulty", "HARD"] }, then: 3 },
              ],
              default: 4,
            },
          },
          _priorityScore: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $setIntersection: ["$companyTypes", targetCompanies],
                    },
                  },
                  0,
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    ];

    // If userId provided, join with UserSheet to get status and notes
    if (userId) {
      aggregate.push(
        {
          $lookup: {
            from: "usersheets", // MongoDB collection name for UserSheet
            let: { qId: "$_id" },
            pipeline: [
              {
                $match: {
                  userId: toObjectId(userId),
                  sheetId: toObjectId(DSA_YATRA_SYSTEM_SHEET_ID),
                },
              },
              { $unwind: "$questions" },
              {
                $match: { $expr: { $eq: ["$questions.questionId", "$$qId"] } },
              },
              {
                $project: {
                  _id: 0,
                  isCompleted: "$questions.isCompleted",
                  isStarred: "$questions.isStarred",
                  notes: "$questions.notes",
                },
              },
            ],
            as: "userStatus",
          },
        },
        {
          $addFields: {
            userStatus: { $arrayElemAt: ["$userStatus", 0] },
          },
        },
        {
          $addFields: {
            isCompleted: { $ifNull: ["$userStatus.isCompleted", false] },
            isStarred: { $ifNull: ["$userStatus.isStarred", false] },
            notes: { $ifNull: ["$userStatus.notes", ""] },
          },
        },
      );
    }

    aggregate.push(
      {
        $sort: {
          _priorityScore: -1,
          _topicOrder: 1,
          _difficultyOrder: 1,
          order: 1,
          createdAt: -1,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _topicOrder: 0,
          _difficultyOrder: 0,
          _priorityScore: 0,
          userStatus: 0,
        },
      },
    );

    const questions = await DSAQuestion.aggregate(aggregate);

    return {
      data: {
        questions,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount,
        },
      },
    };
  } catch (error) {
    logger.error("DB: getAllDSAQuestionsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch DSA questions", details: error };
  }
};

/** Topic list + counts using primary topic only (topics[0]), for lightweight sheet landing. */
const getDSATopicSummariesFromDB = async (
  userId?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const pipeline: any[] = [];

    // Filter by user career focus if userId is provided
    if (userId) {
      const targetCompanies = await getUserDSATargetCompanies(userId);
      if (targetCompanies.length > 0) {
        pipeline.push({
          $match: { companyTypes: { $in: targetCompanies } },
        });
      }
    }

    pipeline.push(
      { $unwind: "$topics" },
      {
        $group: {
          _id: "$topics",
          count: { $sum: 1 },
        },
      },
    );

    const rows = await DSAQuestion.aggregate(pipeline);

    if (!rows || rows.length === 0) {
      return { data: { topics: [] } };
    }

    const topics = rows
      .map((row) => ({
        topic: (row._id as string).toUpperCase(),
        count: row.count,
      }))
      .filter((t) => t.topic)
      .sort((a, b) => {
        const idxA = DSA_TOPICS.indexOf(a.topic as any);
        if (idxA !== -1 && b.topic) {
          const idxB = DSA_TOPICS.indexOf(b.topic as any);
          if (idxB !== -1) return idxA - idxB;
          return -1;
        }
        return a.topic.localeCompare(b.topic);
      });

    return { data: { topics } };
  } catch (error) {
    logger.error("DB: getDSATopicSummariesFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Failed to fetch DSA topic summaries", details: error };
  }
};
const getDSASheetMetadataFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const [domains, difficulties, companyTypes, topics, totalCount] =
        await Promise.all([
          DSAQuestion.distinct("domain"),
          DSAQuestion.distinct("difficulty"),
          DSAQuestion.distinct("companyTypes"),
          DSAQuestion.distinct("topics"),
          DSAQuestion.countDocuments(),
        ]);

      return {
        data: {
          totalQuestions: totalCount,
          filters: {
            domains: domains.sort(),
            difficulties,
            companyTypes: companyTypes.sort(),
            topics: topics.sort(),
          },
        },
      };
    } catch (error) {
      logger.error("DB: getDSASheetMetadataFromDB failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return { error: "Failed to fetch metadata", details: error };
    }
  };

const addDSAQuestionToDB = async (questionPayload: {
  title: string;
  answer: string;
  domain: DSADomainType[];
  difficulty: DSADifficultyType;
  companyTypes: string[];
  topics: DSATopicType[];
  order?: number;
  leetcodeLink?: string;
  youtubeSearchLink?: string;
}): Promise<DatabaseQueryResponseType> => {
  try {
    // Auto-generate YouTube search link if not provided
    const youtubeSearchLink =
      questionPayload.youtubeSearchLink ||
      generateYouTubeSearchLink(questionPayload.title);

    const question = new DSAQuestion({
      ...questionPayload,
      resources: {
        youtubeURL: youtubeSearchLink,
        leetcodeURL: questionPayload.leetcodeLink || null,
        blogURL: null,
      },
    });
    await question.save();
    return { data: question };
  } catch (error) {
    logger.error("DB: addDSAQuestionToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add DSA question", details: error };
  }
};

const updateDSAQuestionInDB = async (
  questionId: string,
  updatedData: UpdateDSAQuestionRequestPayloadProps,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedQuestion = await DSAQuestion.findByIdAndUpdate(
      questionId,
      { $set: updatedData },
      { new: true },
    );

    if (!updatedQuestion) {
      return { error: "DSA question not found" };
    }

    return { data: updatedQuestion };
  } catch (error) {
    logger.error("DB: updateDSAQuestionInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update DSA question", details: error };
  }
};

const getDSAQuestionByIDFromDB = async (
  questionId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const question = await DSAQuestion.findById(questionId);

    if (!question) {
      return { error: "DSA question not found" };
    }

    return { data: question };
  } catch (error) {
    logger.error("DB: getDSAQuestionByIDFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch DSA question", details: error };
  }
};

const getStudyGuideByTopicFromDB = async (
  topicId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const studyGuide = await StudyGuide.findOne({ topicId });
    if (!studyGuide) {
      return { error: "Study guide not found" };
    }
    return { data: studyGuide };
  } catch (error) {
    logger.error("DB: getStudyGuideByTopicFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch study guide", details: error };
  }
};
const getDSAQuestionsGroupedByTopic = async (
  domain: DSADomainType,
  difficulty?: DSADifficultyType,
  companyType?: string,
  userId?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    // Build match stage for filtering
    const matchStage: any = {
      domain: { $in: [domain] },
    };

    if (difficulty) {
      matchStage.difficulty = difficulty;
    }

    if (companyType) {
      matchStage.companyTypes = { $in: [companyType] };
    }

    // Fetch user preferences for personalization and strict filtering
    let targetCompanies: string[] = [];
    if (userId) {
      targetCompanies = await getUserDSATargetCompanies(userId);

      if (targetCompanies.length > 0) {
        // Enforce strict matching based on user's target goals
        if (!companyType) {
          matchStage.companyTypes = { $in: targetCompanies };
        }
      }
    }

    const aggregationPipeline: any[] = [
      { $match: matchStage },
      {
        $addFields: {
          _difficultyOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$difficulty", "EASY"] }, then: 1 },
                { case: { $eq: ["$difficulty", "MEDIUM"] }, then: 2 },
                { case: { $eq: ["$difficulty", "HARD"] }, then: 3 },
              ],
              default: 4,
            },
          },
          _priorityScore: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $setIntersection: ["$companyTypes", targetCompanies],
                    },
                  },
                  0,
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    ];

    if (userId) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: "usersheets",
            let: { qId: "$_id" },
            pipeline: [
              {
                $match: {
                  userId: toObjectId(userId),
                  sheetId: toObjectId(DSA_YATRA_SYSTEM_SHEET_ID),
                },
              },
              { $unwind: "$questions" },
              {
                $match: { $expr: { $eq: ["$questions.questionId", "$$qId"] } },
              },
              {
                $project: {
                  _id: 0,
                  isCompleted: "$questions.isCompleted",
                  isStarred: "$questions.isStarred",
                  notes: "$questions.notes",
                },
              },
            ],
            as: "userStatus",
          },
        },
        {
          $addFields: {
            userStatus: { $arrayElemAt: ["$userStatus", 0] },
          },
        },
        {
          $addFields: {
            isCompleted: { $ifNull: ["$userStatus.isCompleted", false] },
            isStarred: { $ifNull: ["$userStatus.isStarred", false] },
            notes: { $ifNull: ["$userStatus.notes", ""] },
          },
        },
      );
    }

    aggregationPipeline.push(
      {
        $sort: {
          _priorityScore: -1,
          _difficultyOrder: 1,
          order: 1,
          createdAt: -1,
        },
      },
      { $unwind: "$topics" },
      {
        $group: {
          _id: "$topics",
          questions: {
            $push: {
              _id: "$_id",
              title: "$title",
              answer: "$answer",
              domain: "$domain",
              difficulty: "$difficulty",
              companyTypes: "$companyTypes",
              topics: "$topics",
              sections: "$sections",
              resources: "$resources",
              notes: "$notes",
              isCompleted: "$isCompleted",
              isStarred: "$isStarred",
              _priorityScore: "$_priorityScore",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    );

    const groupedQuestions = await DSAQuestion.aggregate(aggregationPipeline);

    // Transform to a more usable format
    const result = {
      domain,
      filters: {
        difficulty,
        companyType,
      },
      topics: groupedQuestions.map((group) => ({
        topic: group._id,
        questions: group.questions,
        count: group.count,
      })),
      totalQuestions: groupedQuestions.reduce((sum, g) => sum + g.count, 0),
    };

    return { data: result };
  } catch (error) {
    logger.error("DB: getDSAQuestionsGroupedByTopic failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch DSA questions by topic", details: error };
  }
};

const saveDSAQuestionNote = async (
  userId: string,
  questionId: string,
  notes: string,
  sheetId: string = DSA_YATRA_SYSTEM_SHEET_ID,
): Promise<DatabaseQueryResponseType> => {
  try {
    const qid = toObjectId(questionId);
    const uid = toObjectId(userId);
    const sid = toObjectId(sheetId);

    let userSheet = await UserSheet.findOne({ userId: uid, sheetId: sid });

    if (!userSheet) {
      userSheet = await UserSheet.create({
        userId: uid,
        sheetId: sid,
        questions: [{ questionId: qid, notes, isCompleted: false }],
      });
    } else {
      if (!userSheet.questions) userSheet.questions = [];
      const questions = userSheet.questions;
      const questionIndex = questions.findIndex(
        (uq: any) => uq.questionId.toString() === questionId,
      );

      if (questionIndex > -1 && questions[questionIndex]) {
        (questions[questionIndex] as any).notes = notes;
      } else {
        questions.push({
          questionId: qid,
          notes,
          isCompleted: false,
        } as any);
      }
      await (userSheet as any).save();
    }

    return { data: userSheet };
  } catch (error) {
    logger.error("DB: saveDSAQuestionNote failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to save question note", details: error };
  }
};

const syncDSAQuestionsProgress = async (
  userId: string,
  questions: Array<{
    questionId: string;
    isCompleted: boolean;
    notes?: string;
  }>,
  sheetId: string = DSA_YATRA_SYSTEM_SHEET_ID,
): Promise<DatabaseQueryResponseType> => {
  try {
    const uid = toObjectId(userId);
    const sid = toObjectId(sheetId);

    let userSheet = await UserSheet.findOne({ userId: uid, sheetId: sid });

    if (!userSheet) {
      const newQuestions = questions.map((q) => ({
        questionId: toObjectId(q.questionId),
        isCompleted: q.isCompleted,
        notes: q.notes || "",
      }));

      userSheet = await UserSheet.create({
        userId: uid,
        sheetId: sid,
        questions: newQuestions,
      });
    } else {
      if (!userSheet.questions) userSheet.questions = [];

      // Merge logic: update if exists, or push if new
      for (const q of questions) {
        const questionIndex = userSheet.questions.findIndex(
          (uq) => uq.questionId.toString() === q.questionId,
        );

        if (questionIndex > -1) {
          const uq = userSheet.questions[questionIndex];
          if (uq) {
            // Update existing: only update isCompleted if true, and notes if provided
            if (q.isCompleted) {
              uq.isCompleted = true;
            }
            if (q.notes) {
              uq.notes = q.notes;
            }
          }
        } else {
          // Add new
          userSheet.questions.push({
            questionId: toObjectId(q.questionId),
            isCompleted: q.isCompleted,
            notes: q.notes || "",
          } as any);
        }
      }
      await userSheet.save();
    }

    return { data: userSheet };
  } catch (error) {
    logger.error("DB: syncDSAQuestionsProgress failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to sync progress", details: error };
  }
};

export {
  // Interview Sheet functions
  addAInterviewSheetToDB,
  // DSA Question functions
  addDSAQuestionToDB,
  addQuestionToInterviewSheetInDB,
  deleteInterviewSheetFromDB,
  deleteQuestionFromSheetInDB,
  enrollInASheet,
  getAllDSAQuestionsFromDB,
  getAllEnrolledSheetsFromDB,
  getAllInterviewSheetsFromDB,
  getAllQuestionsByUser,
  getASheetForUserFromDB,
  getDSAQuestionByIDFromDB,
  getDSAQuestionsGroupedByTopic,
  getDSASheetMetadataFromDB,
  getDSATopicSummariesFromDB,
  getEnrolledSheetFromDB,
  getInterviewSheetByIDFromDB,
  getInterviewSheetBySlugFromDB,
  getStarredQuestionsFromDB,
  getStudyGuideByTopicFromDB,
  markQuestionCompletedByUser,
  markQuestionStarredByUser,
  saveDSAQuestionNote,
  syncDSAQuestionsProgress,
  updateDSAQuestionInDB,
  updateInterviewQuestionInDB,
  updateInterviewSheetInDB,
};

export type { DSASheetFilters };
