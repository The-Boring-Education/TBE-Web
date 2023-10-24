import { CohortLead } from '..';
import {
  AddALeadRequestPayload,
  DatabaseQueryResponseType,
  UpdateALeadByIDFromDBType,
} from '@/interfaces';

// Add A Lead to DB
const addALeadToDB = async (
  payload: AddALeadRequestPayload
): Promise<DatabaseQueryResponseType> => {
  try {
    const newLead = new CohortLead(payload);

    try {
      await newLead.save();
    } catch (error: any) {
      return { error: error.message };
    }

    return { data: newLead };
  } catch (error) {
    return { error };
  }
};

// Get All Leads From DB
const getAllLeadsFromDB = async () => {
  return await CohortLead.find();
};

// Get A Lead By ID
const getALeadByIDFromDB = async (id: string) => {
  return await CohortLead.findById(id);
};

// Update A Lead By ID
const updateALeadByIDFromDB = async (
  id: string,
  updatedPayload: UpdateALeadByIDFromDBType
): Promise<DatabaseQueryResponseType> => {
  try {
    try {
      const updatedLead = await CohortLead.findByIdAndUpdate(
        { _id: id },
        { $set: updatedPayload },
        { new: true }
      );
      return { data: updatedLead };
    } catch (error: any) {
      return { error: error.message };
    }
  } catch (error) {
    return { error };
  }
};

export {
  addALeadToDB,
  getAllLeadsFromDB,
  getALeadByIDFromDB,
  updateALeadByIDFromDB,
};
