import mongoose from 'mongoose';
import { Recruiter,PrepLog } from "@/database";
import type {
  AddRecruiterToDBPayloadProps,
  DatabaseQueryResponseType,
  AddPrepLogToDBPayloadProps
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

const updateRecruiterInDB = async (
  recruiterId: string,
  updatePayload: Partial<Record<string, any>>
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      updatePayload,
      { new: true }
    );

    if (!updatedRecruiter) {
      return { error: 'Recruiter not found' };
    }

    return { data: updatedRecruiter };
  } catch (error: any) {
    return { error: 'Failed to update recruiter' };
  }
};

const deleteRecruiterInDB = async(
  recruiterId:string
): Promise<DatabaseQueryResponseType> =>{
  try {
      const deletedRecruiter = await Recruiter.findByIdAndDelete(recruiterId);

      if(!deletedRecruiter){
        return {error:"Recruiter not deleted"}
      }

      return {data:deletedRecruiter}

  } catch (error) {
        return { error: 'Failed to update recruiter: '};

  }
}

const addPrepLogToDB = async (
  logData: AddPrepLogToDBPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const newLog = await PrepLog.create(logData);
    return { data: newLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

export {
  getRecruitersByUserFromDB,
  addRecruiterToDB,
  updateRecruiterInDB,
  deleteRecruiterInDB,
  addPrepLogToDB
};
