import { Recruiter } from "@/database";
import type {
    AddRecruiterToDBPayloadProps,
    DatabaseQueryResponseType
} from "@/interfaces";

const addRecruiterToDB = async({
    userId,
    recruiterName,
    contact,
    company,
    appliedPosition,
    applicationStatus,
    lastContacted,
}: AddRecruiterToDBPayloadProps): Promise<DatabaseQueryResponseType> =>{
  try {
    const addRecruiter = new Recruiter({
      user: userId,
      recruiterName,
      contact,
      company,
      appliedPosition,
      applicationStatus,
      lastContacted,
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