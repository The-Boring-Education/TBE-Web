import { Recruiter } from "@/database";
import type {
    AddRecruiterToDBPayloadProps,
    DatabaseQueryResponseType
} from "@/interfaces";

const addRecruiterToDB = async({
    userId,
    recruiterName,
}: AddRecruiterToDBPayloadProps): Promise<DatabaseQueryResponseType> =>{
  try {
    const addRecruiter = new Recruiter({
      user: userId,
      recruiterName
    });

    await addRecruiter.save();
    return { data: addRecruiter };
  } catch (error) {
    return {error:"Error while saving recruiter to DB"}
  }
};

export {
    addRecruiterToDB,
}