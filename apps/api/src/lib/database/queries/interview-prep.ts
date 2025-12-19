import { modelSelectParams } from "@/lib/constants";
import type {
  AddInterviewQuestionRequestPayloadProps,
  AddInterviewSheetRequestPayloadProps,
  BaseInterviewSheetResponseProps,
  DatabaseQueryResponseType,
  SheetEnrollmentRequestProps,
  UpdateInterviewSheetRequestPayloadProps,
} from "@/lib/interfaces";

import { InterviewSheet, UserSheet } from "../models";
import { toObjectId } from "./common";
import { updateUserPointsInDB } from "./gamification";

const addAInterviewSheetToDB = async (
  sheetPayload: AddInterviewSheetRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = new InterviewSheet(sheetPayload);
    await sheet.save();
    return { data: sheet };
  } catch (error) {
    return { error };
  }
};

const getAllInterviewSheetsFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const sheets = await InterviewSheet.find()
        .select(modelSelectParams.interviewSheetPreview)
        .exec();

      if (!sheets || sheets.length === 0) {
        return { data: [], error: null };
      }

      // Format the response with all required fields
      const formattedSheets = sheets.map((sheet) => {
        const sheetObj = sheet.toObject();
        return {
          id: sheetObj._id,
          name: sheetObj.name,
          topic: sheetObj.topic || "General",
          slug: sheetObj.slug,
          coverImageURL: sheetObj.coverImageURL,
          description: sheetObj.description,
          liveOn: sheetObj.liveOn
            ? new Date(sheetObj.liveOn).toISOString()
            : new Date().toISOString(),
          isPremium: sheetObj.isPremium || false,
          question_count: sheetObj.questions?.length || 0,
          questions: sheetObj.questions || [],
          created_at: (sheetObj as any).createdAt
            ? new Date((sheetObj as any).createdAt).toISOString()
            : new Date().toISOString(),
          updated_at: (sheetObj as any).updatedAt
            ? new Date((sheetObj as any).updatedAt).toISOString()
            : new Date().toISOString(),
        };
      });

      return { data: formattedSheets };
    } catch (error) {
      console.error("Error fetching all interview sheets:", error);
      return { error: String(error) };
    }
  };

const getInterviewSheetBySlugFromDB = async (
  slug: string,
  userId?: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findOne({ slug });

    if (!sheet) {
      return { error: "Sheet not found" };
    }

    let isEnrolled = false;
    let mappedQuestions = sheet.questions.map((q) => q.toObject());

    if (userId) {
      const userSheet = await UserSheet.findOne({
        userId,
        sheetId: sheet._id,
      });

      isEnrolled = !!userSheet;

      if (userSheet) {
        mappedQuestions = sheet.questions.map((question) => {
          const userQuestion = userSheet.questions.find(
            (uq) => uq.questionId.toString() === question._id.toString()
          );

          return {
            ...question.toObject(),
            isCompleted: userQuestion?.isCompleted || false,
            isStarred: userQuestion?.isStarred || false,
          };
        });
      }
    }

    const sheetObj = sheet.toObject();

    // Format response with ISO 8601 dates
    const formattedSheet = {
      id: sheetObj._id,
      name: sheetObj.name,
      topic: sheetObj.topic || "General",
      slug: sheetObj.slug,
      coverImageURL: sheetObj.coverImageURL,
      description: sheetObj.description,
      liveOn: sheetObj.liveOn
        ? new Date(sheetObj.liveOn).toISOString()
        : new Date().toISOString(),
      isPremium: sheetObj.isPremium || false,
      price: sheetObj.price || 0,
      question_count: mappedQuestions.length,
      questions: mappedQuestions,
      isEnrolled,
      created_at: sheetObj.createdAt
        ? new Date(sheetObj.createdAt).toISOString()
        : new Date().toISOString(),
      updated_at: sheetObj.updatedAt
        ? new Date(sheetObj.updatedAt).toISOString()
        : new Date().toISOString(),
    };

    return {
      data: formattedSheet,
    };
  } catch (error) {
    return { error };
  }
};

const getInterviewSheetByIDFromDB = async (
  id: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = await InterviewSheet.findOne({ _id: id });

    if (!sheet) {
      return { error: "Sheet not found" };
    }

    return { data: sheet };
  } catch (error) {
    return { error };
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
      { new: true }
    );

    if (!updatedCourse) return { error: "Sheet does not exists" };

    return { data: updatedCourse };
  } catch (error) {
    return { error: "Failed while updating sheet" };
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
          "questions.$.frequency": frequency,
        },
      },
      { new: true }
    );

    return { data: course };
  } catch (error) {
    return { error: "Failed to update question in interview sheet" };
  }
};

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
    );

    return { data: course };
  } catch (error) {
    return { error: "Failed to delete question from sheet" };
  }
};

const addQuestionToInterviewSheetInDB = async (
  sheetId: string,
  question: AddInterviewQuestionRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedSheet = await InterviewSheet.findOneAndUpdate(
      { _id: sheetId },
      { $push: { questions: question } },
      { new: true }
    );

    if (!updatedSheet) {
      return { error: "Interview sheet not found" };
    }

    return { data: updatedSheet };
  } catch (error) {
    return { error: "Failed to add question to interview sheet" };
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

    const questions = sheet.questions.map((question: any) => ({
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
    return { error: "Failed while enrolling in a sheet" };
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
    return { error: "Failed while fetching enrolled sheet" };
  }
};

const getAllEnrolledSheetsFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const enrolledSheets = await UserSheet.find({ userId })
      .populate({
        path: "sheet",
        select: modelSelectParams.coursePreview,
      })
      .exec();

    return {
      data: enrolledSheets.map((sheet) => ({
        ...sheet.sheet.toObject(),
        isEnrolled: true,
      })),
    };
  } catch (error) {
    return { error: "Failed while fetching enrolled sheets" };
  }
};

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
    );

    if (!updatedSheet) {
      return { error: "User or question not found" };
    }

    return { data: updatedSheet };
  } catch (error) {
    return { error: "Failed to mark question as completed" };
  }
};

const getAllQuestionsByUser = async (userId: string) => {
  try {
    const userSheets = await UserSheet.find({ userId }).populate(
      "questions.questionId"
    );

    if (!userSheets.length) {
      return { data: [], error: "No questions found for this user" };
    }

    const allQuestions = userSheets.flatMap((sheet) => sheet.questions);

    return { data: allQuestions, error: null };
  } catch (error) {
    return {
      data: null,
      error: "Error fetching questions from the database",
    };
  }
};

const getASheetFromDBById = async (
  sheetId: string,
  userId?: string
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
    return { error: `Failed while fetching a sheet ${error}` };
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

    const mappedQuestions = userSheet.sheet.questions.map((question) => {
      const userQuestion = userSheet.questions.find(
        (uc) => uc.questionId.toString() === question._id.toString()
      );
      return {
        ...question.toObject(),
        isCompleted: userQuestion?.isCompleted,
        isStarred: userQuestion?.isStarred,
      };
    });

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
    return { error: "Failed to fetch courses with chapter status" };
  }
};

const markQuestionStarredByUser = async (
  userId: string,
  sheetId: string,
  questionId: string,
  isStarred: boolean
): Promise<DatabaseQueryResponseType> => {
  try {
    const qid = toObjectId(questionId);

    const updatedSheet = await UserSheet.findOneAndUpdate(
      { userId, sheetId, "questions.questionId": qid },
      { $set: { "questions.$.isStarred": isStarred } },
      { new: true }
    );

    if (!updatedSheet) {
      return { error: "User or question not found" };
    }

    return { data: updatedSheet };
  } catch (error) {
    return { error: "Failed to mark question as starred" };
  }
};

const getStarredQuestionsFromDB = async (userId: string, sheetId: string) => {
  try {
    const userSheet = await UserSheet.findOne({ userId, sheetId });

    if (!userSheet) {
      return { data: [], error: "UserSheet not found" };
    }

    const starredQuestions = userSheet.questions.filter(
      (q) => q.isStarred === true
    );
    return { data: starredQuestions };
  } catch (error) {
    return { error: "Failed to get starred questions" };
  }
};

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

    // Delete the sheet
    await InterviewSheet.findByIdAndDelete(sheetId);

    // Update coupons that reference this sheet
    if (global.mongoose?.connection?.db) {
      try {
        const couponsCollection =
          global.mongoose.connection.db.collection("coupons");
        if (couponsCollection) {
          await couponsCollection.updateMany(
            { applicableProducts: toObjectId(sheetId) },
            { $pull: { applicableProducts: toObjectId(sheetId) } }
          );
        }
      } catch (couponError) {
        console.warn("Could not update coupons:", couponError);
        // Continue with deletion even if coupon update fails
      }
    }

    // Clean up user sheet enrollments
    try {
      await UserSheet.deleteMany({ sheetId: toObjectId(sheetId) });
    } catch (userSheetError) {
      console.warn("Could not delete user sheet data:", userSheetError);
      // Continue with deletion even if user sheet cleanup fails
    }

    console.log(
      `✓ Interview sheet "${sheetName}" (${sheetId}) deleted successfully | Questions removed: ${questionsCount}`
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
  getEnrolledSheetFromDB,
  getInterviewSheetByIDFromDB,
  getInterviewSheetBySlugFromDB,
  getStarredQuestionsFromDB,
  markQuestionCompletedByUser,
  markQuestionStarredByUser,
  updateInterviewQuestionInDB,
  updateInterviewSheetInDB,
};
