import { apiStatusCodes } from '@/constant';
import { addAnAdminToDB, getAnAdminByEmailFromDB } from '@/database';
import { AddAnAdminRequestPayload } from '@/interfaces';
import { connectDB, router, routerHandler } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

// Add An Admin
const addAnAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email } = req.body as AddAnAdminRequestPayload;

  const admin = await getAnAdminByEmailFromDB(email);

  if (admin) {
    return res
      .status(apiStatusCodes.FORBIDDEN)
      .json(sendAPIResponse({ status: false, error: 'Admin already added' }));
  }

  try {
    const admin = await addAnAdminToDB({ name, email });
    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Admin added successfully',
        data: admin,
      })
    );
  } catch (error: any) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(sendAPIResponse({ status: false, error: error.message }));
  }
};

// Get Admin by Email
const getAdminByEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email } = req.query;

  try {
    const admin = await getAnAdminByEmailFromDB(email as string);

    if (!admin) {
      return res
        .status(apiStatusCodes.NOT_FOUND)
        .json(sendAPIResponse({ status: false, error: 'Admin not found' }));
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data: admin }));
  } catch (error: any) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(sendAPIResponse({ status: false, error: 'Admin not found' }));
  }
};

router.use(connectDB).post(addAnAdmin).get(getAdminByEmail);

export const config = {
  api: {
    externalResolver: true,
  },
};

export default routerHandler;
