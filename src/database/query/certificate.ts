import {
  AddCertificateRequestPayloadProps,
  DatabaseQueryResponseType,
} from '@/interfaces';
import { Certificate } from '@/database';

const addACertificateToDB = async (
  certificatePayload: AddCertificateRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const certificate = new Certificate(certificatePayload);
    await certificate.save();
    return { data: certificate };
  } catch (error) {
    return { error };
  }
};

const checkCertificateExistForAProgram = async (
  type: string,
  userId: string,
  programId: string
) => {
  try {
    const certificate = await Certificate.findOne({ type, userId, programId });

    if (certificate) {
      return { data: certificate };
    } else {
      return { error: 'Certificate does not exist' };
    }
  } catch (error) {
    return { error: 'Failed while checking certificate existence' };
  }
};

// Get A Certificate by Id
const getCertificateById = async (certificateId: string) => {
  try {
    const certificate = await Certificate.findById(certificateId);

    if (certificate) {
      return { data: certificate };
    } else {
      return { error: 'Certificate not found' };
    }
  } catch (error) {
    return { error: 'Failed while fetching certificate' };
  }
};

// Get All User Certificates
const getUserCertificates = async (userId: string) => {
  try {
    const certificates = await Certificate.find({ userId });

    if (certificates.length > 0) {
      return { data: certificates };
    } else {
      return { error: 'No certificates found' };
    }
  } catch (error) {
    return { error: 'Failed while fetching certificates' };
  }
};

export {
  addACertificateToDB,
  checkCertificateExistForAProgram,
  getUserCertificates,
  getCertificateById,
};
