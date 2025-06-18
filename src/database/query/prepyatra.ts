import mongoose from 'mongoose';
import { Recruiter } from "@/database";
import type {
  AddRecruiterToDBPayloadProps,
  DatabaseQueryResponseType
} from "@/interfaces";

const getRecruitersByUserFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const recruiters = await Recruiter.find({
      user: new mongoose.Types.ObjectId(userId)
    }).sort({ updatedAt: -1 });
    return { data: recruiters };
  } catch (error) {
    return { error: 'Failed to fetch recruiters from DB' };
  }
};

const addRecruiterToDB = async ({
  userId,
  recruiterName,
}: AddRecruiterToDBPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const addRecruiter = new Recruiter({
      user: userId,
      recruiterName
    });

    await addRecruiter.save();
    return { data: addRecruiter };
  } catch (error) {
    return { error: "Error while saving recruiter to DB" };
  }
};

export {
  getRecruitersByUserFromDB,
  addRecruiterToDB
};
