import type { NextApiRequest, NextApiResponse } from 'next';
import { apiStatusCodes } from '@/constant';
import {
  addALeadToDB,
  getALeadByIDFromDB,
  getAllLeadsFromDB,
  updateALeadByIDFromDB,
} from '@/database';
import {
  AddALeadRequestPayload,
  UpdateALeadRequestPayload,
} from '@/interfaces';
import { connectDB, router, routerHandler } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

// Add A Lead
const addALead = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    name,
    contactNo,
    email,
    profession,
    cohortName,
    school,
    college,
    workExperience,
  } = req.body as AddALeadRequestPayload;

  try {
    const { data, error } = await addALeadToDB({
      name,
      contactNo,
      email,
      cohortName,
      profession,
      school,
      college,
      workExperience,
    });

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Something went wrong. Please try again.',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: "Thanks for registering. We'll contact you soon",
        data,
      })
    );
  } catch (error: any) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(sendAPIResponse({ status: false, error: error.message }));
  }
};

// Get All Leads
const getAllLeads = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const leads = await getAllLeadsFromDB();

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        data: leads,
      })
    );
  } catch (error: any) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(sendAPIResponse({ status: false, error: error.message }));
  }
};

// Update A Lead By ID
const updateLeadByID = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id, ...updatedPayload } = req.body as UpdateALeadRequestPayload;

    const lead = await getALeadByIDFromDB(id);

    if (!lead) {
      return res
        .status(apiStatusCodes.NOT_FOUND)
        .json(sendAPIResponse({ status: false, error: 'Lead not found' }));
    }

    const { data, error } = await updateALeadByIDFromDB(id, updatedPayload);

    if (error) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Data couldn't be updated. Please try again",
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Lead updated successfully',
        data,
      })
    );
  } catch (error: any) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(sendAPIResponse({ status: false, error: error.message }));
  }
};

router.use(connectDB).get(getAllLeads).post(addALead).patch(updateLeadByID);

export const config = {
  api: {
    externalResolver: true,
  },
};

export default routerHandler;
