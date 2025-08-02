import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import {
  addACertificateToDB,
  checkCertificateExistForAProgram,
  updateCertificateToUserShikshaCourseDoc,
  updateUserPointsInDB,
} from '@/database';
import type {
  AddCertificateRequestPayloadProps,
  CertificateType,
} from '@/interfaces';
import { connectDB } from '@/middlewares';
import { applyMultiOriginCorsHeaders, sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  const isPreflight = applyMultiOriginCorsHeaders(req, res);
  if (isPreflight) return;

  await connectDB();
  const { method, query } = req;
  const { type, userId, programId } = query as {
    type: CertificateType;
    userId: string;
    programId: string;
  };

  switch (method) {
    case 'POST':
      return handleAddACertificate(req, res);
    case 'GET':
      return handleGetACertificate(req, res, type, userId, programId);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleAddACertificate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const certificatePayload = req.body as AddCertificateRequestPayloadProps;

    const { data: existingCertificate } =
      await checkCertificateExistForAProgram(
        certificatePayload.type,
        certificatePayload.userId,
        certificatePayload.programId
      );

    if (existingCertificate) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: 'Certificate already exists',
          data: existingCertificate,
        })
      );
    }

    const { data: addedCertificate, error: certificateError } =
      await addACertificateToDB(certificatePayload);

    if (certificatePayload.type === 'SHIKSHA') {
      await updateCertificateToUserShikshaCourseDoc(
        certificatePayload.userId,
        certificatePayload.programId,
        addedCertificate._id.toString()
      );
      // Course was Completed successful add Points
      await updateUserPointsInDB(
        certificatePayload.userId,
        'COMPLETE_COURSE_CERTIFICATE'
      );
    }

    if (certificateError) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Failed while adding Certificate',
          error: certificateError,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: addedCertificate,
        message: 'Certificate added successfully',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while adding Certificate',
        error,
      })
    );
  }
};

const handleGetACertificate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  type: CertificateType,
  userId: string,
  programId: string
) => {
  try {
    const missingFields = [];
    if (!userId) missingFields.push('User ID');
    if (!type) missingFields.push('Certificate type');
    if (!programId) missingFields.push('Program ID');

    if (missingFields.length > 0) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        })
      );
    }

    const { data: existingCertificate } =
      await checkCertificateExistForAProgram(type, userId, programId);

    if (existingCertificate) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: existingCertificate,
        })
      );
    }

    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: 'Certificate not found',
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed while fetching Certificate',
        error,
      })
    );
  }
};

export default handler;
