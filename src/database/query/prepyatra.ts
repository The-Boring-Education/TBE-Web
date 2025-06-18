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
    return { error: 'Failed to update recruiter: '};
  }
};

const deleteRecruiterInDB = async(
  recruiterId:string
): Promise<DatabaseQueryResponseType> =>{
  try {
      const deletedRecruiter = await Recruiter.findByIdAndDelete(recruiterId);

      if(!deleteRecruiterInDB){
        return {error:"Recruiter not deleted"}
      }

      return {data:deletedRecruiter}

  } catch (error) {
        return { error: 'Failed to update recruiter: '};

  }
}
export {
    addRecruiterToDB,
    deleteRecruiterInDB,
    updateRecruiterInDB,
}