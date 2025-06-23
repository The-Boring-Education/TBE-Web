import mongoose from 'mongoose';

import { PrepLog,Recruiter } from "@/database";
import type {
  AddPrepLogToDBPayloadProps,
  AddRecruiterToDBPayloadProps,
  DatabaseQueryResponseType} from "@/interfaces";

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
  {
    userId,
    title,
    description,
    timeSpent
  }:AddPrepLogToDBPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const newLog = await PrepLog.create({
      user:userId,
      title,
      description,
      timeSpent
    });
    return { data: newLog };
  } catch (error: any) {
    return { error: error.message };
  }
};


const getPrepLogsByUserFromDB = async (userId: string) => {
  try {
    const logs = await PrepLog.find({ user: userId }).sort({ createdAt: -1 });
    return { data: logs };
  } catch (error: any) {
    return { error: error.message };
  }
};

const updatePrepLogInDB = async (prepLogId: string, updateData: any) => {
  try {
    const updatedLog = await PrepLog.findByIdAndUpdate(prepLogId, updateData, {
      new: true,
    });

    if (!updatedLog) return { error: 'Prep log not found' };

    return { data: updatedLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

const deletePrepLogInDB = async (prepLogId: string) => {
  try {
    const deletedLog = await PrepLog.findByIdAndDelete(prepLogId);

    if (!deletedLog) return { error: 'Log not found' };

    return { data: deletedLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

export {
  addPrepLogToDB,
  addRecruiterToDB,
  deletePrepLogInDB,
  deleteRecruiterInDB,
  getPrepLogsByUserFromDB,
  getRecruitersByUserFromDB,
  updatePrepLogInDB,
  updateRecruiterInDB};
