import {Recruiter} from "@/database";
import type { DatabaseQueryResponseType } from "@/interfaces";


const getRecruitersByUserFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const recruiters = await Recruiter.find({ user: userId }).sort({ updatedAt: -1 });
    console.log(recruiters)
    return { data: recruiters };
  } catch (error) {
    return { error: 'Failed to fetch recruiters from DB' };
  }
};

export {
    getRecruitersByUserFromDB
}