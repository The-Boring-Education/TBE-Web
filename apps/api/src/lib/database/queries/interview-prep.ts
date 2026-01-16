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
        let mappedQuestions = sheet.questions.map((q) => q.toObject())

        if (userId) {
            const userSheet = await UserSheet.findOne({
                userId,
                sheetId: sheet._id
            })

            isEnrolled = !!userSheet

            if (userSheet) {
                mappedQuestions = sheet.questions.map((question) => {
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

        const questions = sheet.questions.map((question: any) => ({
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

        const mappedQuestions = userSheet.sheet.questions.map((question) => {
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

const getDSAQuestionsGroupedByTopic = async (
  domain: DSADomainType = "GENERAL",
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

    // Fetch all matching questions first
    const allQuestions = await DSAQuestion.find(matchStage).lean();

    // Group questions by each topic they belong to
    const groupedQuestions: Record<string, any[]> = {};
    
    allQuestions.forEach((question: any) => {
      const questionTopics = question.topics || [];
      questionTopics.forEach((topic: string) => {
        if (!groupedQuestions[topic]) {
          groupedQuestions[topic] = [];
        }
        // Check if question already exists in this topic group (avoid duplicates)
        const exists = groupedQuestions[topic].some(
          (q: any) => q._id.toString() === question._id.toString()
        );
        if (!exists) {
          groupedQuestions[topic].push({
            _id: question._id,
            title: question.title,
            content: question.content,
            domain: question.domain,
            difficulty: question.difficulty,
            companyTypes: question.companyTypes,
            topics: question.topics, // Preserve full topics array
            createdAt: question.createdAt,
            updatedAt: question.updatedAt
          });
        }
      });
    });

    // Sort topics alphabetically and questions within each topic
    const sortedGroupedQuestions: Record<string, any[]> = {};
    Object.keys(groupedQuestions)
      .sort()
      .forEach((topic) => {
        sortedGroupedQuestions[topic] = groupedQuestions[topic] || [];
      });

    return { data: sortedGroupedQuestions };
  } catch (error) {
    console.error("Error fetching DSA questions grouped by topic:", error);
    return { error: "Failed to fetch DSA questions grouped by topic", details: error };
  }
};

export {
    addAInterviewSheetToDB,
    addQuestionToInterviewSheetInDB,
    deleteInterviewSheetFromDB,
    deleteQuestionFromSheetInDB,
    enrollInASheet,
    getAllEnrolledSheetsFromDB,
    getAllInterviewSheetsFromDB,
    getAllQuestionsByUser,
    getASheetForUserFromDB,
    getDSAQuestionsGroupedByTopic,
    getEnrolledSheetFromDB,
    getInterviewSheetByIDFromDB,
    getInterviewSheetBySlugFromDB,
    getStarredQuestionsFromDB,
    markQuestionCompletedByUser,
    markQuestionStarredByUser,
    updateInterviewQuestionInDB,
    updateInterviewSheetInDB
}
