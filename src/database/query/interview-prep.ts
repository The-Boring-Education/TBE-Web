import {
  AddInterviewSheetRequestPayloadProps,
  AddInterviewQuestionRequestPayloadProps,
  DatabaseQueryResponseType,
} from '@/interfaces';
import { InterviewSheet } from '@/database';
import { modelSelectParams } from '@/constant';

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
      const course = await InterviewSheet.find()
        .select(modelSelectParams.coursePreview)
        .exec();

      if (!course) {
        return { error: 'InterviewSheet not found' };
      }

      return { data: course };
    } catch (error) {
      return { error };
    }
  };

const getInterviewSheetBySlugFromDB = async (
  slug: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const course = await InterviewSheet.findOne({ slug });

    if (!course) {
      return { error: 'Course not found' };
    }

    return { data: course };
  } catch (error) {
    return { error };
  }
};

const addInterviewSheetWithQuestionsToDB = async (
  sheetPayload: AddInterviewQuestionRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const sheet = new InterviewSheet(sheetPayload);
    await sheet.save();
    return { data: sheet };
  } catch (error) {
    return { error };
  }
};

export {
  addAInterviewSheetToDB,
  getAllInterviewSheetsFromDB,
  getInterviewSheetBySlugFromDB,
  addInterviewSheetWithQuestionsToDB,
};
