import { modelSelectParams } from "@/lib/constants"
import type {
    AddInterviewQuestionRequestPayloadProps,
    AddInterviewSheetRequestPayloadProps,
    BaseInterviewSheetResponseProps,
    DatabaseQueryResponseType,
    DSADifficultyType,
    DSADomainType,
    SheetEnrollmentRequestProps,
    UpdateInterviewSheetRequestPayloadProps
} from "@/lib/interfaces"

import { DSAQuestion, InterviewSheet, UserSheet } from "../models"
import { toObjectId } from "./common"
import { updateUserPointsInDB } from "./gamification"

const addAInterviewSheetToDB = async (
    sheetPayload: AddInterviewSheetRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
    try {
        const sheet = new InterviewSheet(sheetPayload)
        await sheet.save()
        return { data: sheet }
    } catch (error) {
        return { error }
    }
}

const getAllInterviewSheetsFromDB =
    async (): Promise<DatabaseQueryResponseType> => {
        try {
            const sheet = await InterviewSheet.find()
                .select(modelSelectParams.coursePreview)
                .exec()

            if (!sheet) {
                return { error: "InterviewSheet not found" }
            }

            return { data: sheet }
        } catch (error) {
            return { error }
        }
    }

const getInterviewSheetBySlugFromDB = async (
    slug: string,
    userId?: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const sheet = await InterviewSheet.findOne({ slug })

        if (!sheet) {
            return { error: "Sheet not found" }
        }

        let isEnrolled = false
        let mappedQuestions = (sheet.questions || []).map((q) => q.toObject())

        if (userId) {
            const userSheet = await UserSheet.findOne({
                userId,
                sheetId: sheet._id
            })

            isEnrolled = !!userSheet

            if (userSheet) {
                mappedQuestions = (sheet.questions || []).map((question) => {
                    const userQuestion = userSheet.questions.find(
                        (uq) =>
                            uq.questionId.toString() === question._id.toString()
                    )

                    return {
                        ...question.toObject(),
                        isCompleted: userQuestion?.isCompleted || false,
                        isStarred: userQuestion?.isStarred || false
                    }
                })
            }
        }

        return {
            data: {
                ...sheet.toObject(),
                isEnrolled,
                questions: mappedQuestions
            }
        }
    } catch (error) {
        return { error }
    }
}

const getInterviewSheetByIDFromDB = async (
    id: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const sheet = await InterviewSheet.findOne({ _id: id })

        if (!sheet) {
            return { error: "Sheet not found" }
        }

        return { data: sheet }
    } catch (error) {
        return { error }
    }
}

const updateInterviewSheetInDB = async ({
    sheetId,
    updatedData
}: UpdateInterviewSheetRequestPayloadProps): Promise<DatabaseQueryResponseType> => {
    try {
        const updatedCourse = await InterviewSheet.findByIdAndUpdate(
            sheetId,
            updatedData,
            { new: true }
        )

        if (!updatedCourse) return { error: "Sheet does not exists" }

        return { data: updatedCourse }
    } catch (error) {
        return { error: "Failed while updating sheet", details: error }
    }
}

const updateInterviewQuestionInDB = async (
    sheetId: string,
    questionId: string,
    {
        title,
        question,
        answer,
        frequency
    }: Partial<AddInterviewQuestionRequestPayloadProps>
) => {
    try {
        const course = await InterviewSheet.findOneAndUpdate(
            { _id: sheetId, "questions._id": questionId },
            {
                $set: {
                    "questions.$.title": title,
                    "questions.$.question": question,
                    "questions.$.answer": answer,
                    "questions.$.frequency": frequency
                }
            },
            { new: true }
        )

        return { data: course }
    } catch (error) {
        return { error: "Failed to update chapter to course", details: error }
    }
}

// Delete a question from a sheet
const deleteQuestionFromSheetInDB = async (
    sheetId: string,
    questionId: string
) => {
    try {
        const course = await InterviewSheet.findOneAndUpdate(
            { _id: sheetId },
            { $pull: { questions: { _id: questionId } } },
            { new: true }
        )

        return { data: course }
    } catch (error) {
        return { error: "Failed to delete question from sheet", details: error }
    }
}

const addQuestionToInterviewSheetInDB = async (
    sheetId: string,
    question: AddInterviewQuestionRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
    try {
        const updatedSheet = await InterviewSheet.findOneAndUpdate(
            { _id: sheetId },
            { $push: { questions: question } },
            { new: true }
        )

        if (!updatedSheet) {
            return { error: "Interview sheet not found" }
        }

        return { data: updatedSheet }
    } catch (error) {
        return { error: "Failed to add question to interview sheet", details: error }
    }
}

const enrollInASheet = async ({
    userId,
    sheetId
}: SheetEnrollmentRequestProps): Promise<DatabaseQueryResponseType> => {
    try {
        const sheet = await InterviewSheet.findById(sheetId).lean()
        if (!sheet) {
            return { error: "Sheet not found" }
        }

        const questions = (sheet.questions || []).map((question: any) => ({
            questionId: question._id,
            isCompleted: false
        }))

        const userSheet = await UserSheet.create({
            userId,
            sheetId,
            questions
        })

        // Enrollment Sheet was successful add Points
        await updateUserPointsInDB(userId, "ENROLL_SHEET")

        return { data: userSheet }
    } catch (error) {
        return { error: "Failed while enrolling in a sheet", details: error }
    }
}

const getEnrolledSheetFromDB = async ({
    userId,
    sheetId
}: SheetEnrollmentRequestProps): Promise<DatabaseQueryResponseType> => {
    try {
        const enrolledSheet = await UserSheet.findOne({ userId, sheetId })
        return { data: enrolledSheet }
    } catch (error) {
        return { error: "Failed while fetching enrolled sheet", details: error }
    }
}

const getAllEnrolledSheetsFromDB = async (
    userId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const enrolledSheets = await UserSheet.find({ userId })
            .populate({
                path: "sheet",
                select: `${modelSelectParams.coursePreview} questions`
            })
            .sort({ updatedAt: -1 }) // Sort by last updated, most recent first
            .exec()

        return {
            data: enrolledSheets.map((userSheet) => {
                const sheet = userSheet.sheet as any
                const totalQuestions = sheet?.questions?.length || 0
                const completedQuestions = userSheet.questions?.filter(
                    (q: any) => q.isCompleted
                ).length || 0
                const progressPercentage = totalQuestions > 0
                    ? Math.round((completedQuestions / totalQuestions) * 100)
                    : 0

                // Access updatedAt from the document (Mongoose adds it via timestamps)
                const userSheetObj = userSheet.toObject() as any

                return {
                    ...sheet.toObject(),
                    isEnrolled: true,
                    lastUpdated: userSheetObj.updatedAt || userSheetObj.createdAt,
                    progress: {
                        completed: completedQuestions,
                        total: totalQuestions,
                        percentage: progressPercentage
                    }
                }
            })
        }
    } catch (error) {
        return { error: "Failed while fetching enrolled sheets", details: error }
    }
}

const markQuestionCompletedByUser = async (
    userId: string,
    sheetId: string,
    questionId: string,
    isCompleted: boolean
): Promise<DatabaseQueryResponseType> => {
    try {
        const updatedSheet = await UserSheet.findOneAndUpdate(
            { userId, sheetId, "questions.questionId": questionId },
            { $set: { "questions.$.isCompleted": isCompleted } },
            { new: true }
        )

        if (!updatedSheet) {
            return { error: "User or question not found" }
        }

        return { data: updatedSheet }
    } catch (error) {
        return { error: "Failed to mark question as completed", details: error }
    }
}

const getAllQuestionsByUser = async (userId: string) => {
    try {
        const userSheets = await UserSheet.find({ userId }).populate(
            "questions.questionId"
        )

        if (!userSheets.length) {
            return { data: [], error: "No questions found for this user" }
        }

        const allQuestions = userSheets.flatMap((sheet) => sheet.questions)

        return { data: allQuestions }
    } catch (error) {
        return {
            error: "Error fetching questions from the database",
            details: error
        }
    }
}

const getASheetFromDBById = async (
    sheetId: string,
    userId?: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const sheet = await InterviewSheet.findById(sheetId)

        if (!sheet) {
            return { error: "Sheet not found" }
        }

        if (userId) {
            const { data } = await getEnrolledSheetFromDB({ userId, sheetId })

            return {
                data: {
                    ...sheet.toObject(),
                    isEnrolled: !!data
                } as BaseInterviewSheetResponseProps
            }
        }

        return { data: sheet }
    } catch (error) {
        return { error: `Failed while fetching a sheet`, details: error }
    }
}

const getASheetForUserFromDB = async (userId: string, sheetId: string) => {
    try {
        const userSheet = await UserSheet.findOne({ userId, sheetId })
            .populate({
                path: "sheet"
            })
            .exec()

        if (!userSheet) {
            const { data: sheet } = await getASheetFromDBById(sheetId)
            return { data: { ...sheet.toObject(), isEnrolled: false } }
        }

        const mappedQuestions = (userSheet.sheet.questions || []).map((question) => {
            const userQuestion = userSheet.questions.find(
                (uc) => uc.questionId.toString() === question._id.toString()
            )
            return {
                ...question.toObject(),
                isCompleted: userQuestion?.isCompleted,
                isStarred: userQuestion?.isStarred
            }
        })

        const updatedSheetResponse = {
            ...userSheet.sheet.toObject(),
            questions: mappedQuestions
        }

        return {
            data: {
                ...updatedSheetResponse,
                isEnrolled: true
            } as BaseInterviewSheetResponseProps
        }
    } catch (error) {
        return { error: "Failed to fetch courses with chapter status", details: error }
    }
}

const markQuestionStarredByUser = async (
    userId: string,
    sheetId: string,
    questionId: string,
    isStarred: boolean
): Promise<DatabaseQueryResponseType> => {
    try {
        const qid = toObjectId(questionId)

        const updatedSheet = await UserSheet.findOneAndUpdate(
            { userId, sheetId, "questions.questionId": qid },
            { $set: { "questions.$.isStarred": isStarred } },
            { new: true }
        )

        if (!updatedSheet) {
            return { error: "User or question not found" }
        }

        return { data: updatedSheet }
    } catch (error) {
        return { error: "Failed to mark question as starred", details: error }
    }
}

const getStarredQuestionsFromDB = async (userId: string, sheetId: string) => {
    try {
        const userSheet = await UserSheet.findOne({ userId, sheetId })

        if (!userSheet) {
            return { error: "UserSheet not found" }
        }

        const starredQuestions = userSheet.questions.filter(
            (q) => q.isStarred === true
        )
        return { data: starredQuestions }
    } catch (error) {
        return { error: "Failed to get starred questions", details: error }
    }
}

const deleteInterviewSheetFromDB = async (
  sheetId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findById(sheetId);
    if (!sheet) {
      return { error: "Interview sheet not found" };
    }
    const questionsCount = sheet.questions?.length || 0;
    const sheetName = sheet.name;
    await InterviewSheet.findByIdAndDelete(sheetId);

    console.log(
      `Interview sheet "${sheetName}" (${sheetId}) deleted successfully | Questions removed: ${questionsCount}`
    );
    return {
      data: {
        deletedSheetId: sheetId,
        deletedSheetName: sheetName,
        questionsDeleted: questionsCount,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error deleting interview sheet:", error);
    return { error: String(error) };
  }
};

interface DSASheetFilters {
  domain?: DSADomainType | DSADomainType[];
  difficulty?: DSADifficultyType | DSADifficultyType[];
  companyTypes?: string | string[];
  topics?: string | string[];
  page?: number;
  limit?: number;
}

const getAllDSAQuestionsFromDB = async (
  filters: DSASheetFilters = {}
): Promise<DatabaseQueryResponseType> => {
  try {
    const { domain, difficulty, companyTypes, topics, page = 1, limit = 50 } = filters;
    
    // Build match stage for filtering
    const matchStage: any = {};

    if (domain) {
      const domains = Array.isArray(domain) ? domain : [domain];
      matchStage.domain = { $in: domains };
    }

    if (difficulty) {
      const difficulties = Array.isArray(difficulty) ? difficulty : [difficulty];
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

    const totalCount = await DSAQuestion.countDocuments(matchStage);

    const questions = await DSAQuestion.find(matchStage)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      data: {
        questions,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount
        }
      }
    };
  } catch (error) {
    console.error("Error fetching DSA questions:", error);
    return { error: "Failed to fetch DSA questions", details: error };
  }
};

const getDSASheetMetadataFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const [domains, difficulties, companyTypes, topics, totalCount] = await Promise.all([
      DSAQuestion.distinct('domain'),
      DSAQuestion.distinct('difficulty'),
      DSAQuestion.distinct('companyTypes'),
      DSAQuestion.distinct('topics'),
      DSAQuestion.countDocuments()
    ]);

    return {
      data: {
        totalQuestions: totalCount,
        filters: {
          domains: domains.sort(),
          difficulties,
          companyTypes: companyTypes.sort(),
          topics: topics.sort()
        }
      }
    };
  } catch (error) {
    return { error: "Failed to fetch metadata", details: error };
  }
};

const addDSAQuestionToDB = async (
  questionPayload: {
    title: string;
    content: string;
    domain: DSADomainType[];
    difficulty: DSADifficultyType;
    companyTypes: string[];
    topics: string[];
  }
): Promise<DatabaseQueryResponseType> => {
  try {
    const question = new DSAQuestion(questionPayload);
    await question.save();
    return { data: question };
  } catch (error) {
    return { error: "Failed to add DSA question", details: error };
  }
};

const getDSAQuestionsGroupedByTopic = async (
  domain: DSADomainType,
  difficulty?: DSADifficultyType,
  companyType?: string
): Promise<DatabaseQueryResponseType> => {
  try {
    // Build match stage for filtering
    const matchStage: any = {
      domain: { $in: [domain] }
    };

    if (difficulty) {
      matchStage.difficulty = difficulty;
    }

    if (companyType) {
      matchStage.companyTypes = { $in: [companyType] };
    }

    // Use aggregation to group questions by topic
    const groupedQuestions = await DSAQuestion.aggregate([
      { $match: matchStage },
      { $unwind: "$topics" },
      {
        $group: {
          _id: "$topics",
          questions: {
            $push: {
              _id: "$_id",
              title: "$title",
              content: "$content",
              domain: "$domain",
              difficulty: "$difficulty",
              companyTypes: "$companyTypes",
              topics: "$topics"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Transform to a more usable format
    const result = {
      domain,
      filters: {
        difficulty,
        companyType
      },
      topics: groupedQuestions.map((group) => ({
        topic: group._id,
        questions: group.questions,
        count: group.count
      })),
      totalQuestions: groupedQuestions.reduce((sum, g) => sum + g.count, 0)
    };

    return { data: result };
  } catch (error) {
    return { error: "Failed to fetch DSA questions by topic", details: error };
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
    getDSAQuestionsGroupedByTopic,
    getDSASheetMetadataFromDB,
    getEnrolledSheetFromDB,
    getInterviewSheetByIDFromDB,
    getInterviewSheetBySlugFromDB,
    getStarredQuestionsFromDB,
    markQuestionCompletedByUser,
    markQuestionStarredByUser,
    updateInterviewQuestionInDB,
    updateInterviewSheetInDB}

export type { DSASheetFilters }
