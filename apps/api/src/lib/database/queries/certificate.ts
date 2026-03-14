import type {
  AddCertificateRequestPayloadProps,
  DatabaseQueryResponseType,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import Certificate from "../models/Certificate";

const addACertificateToDB = async (
  certificatePayload: AddCertificateRequestPayloadProps,
): Promise<DatabaseQueryResponseType> => {
  try {
    const certificate = new Certificate(certificatePayload);
    await certificate.save();
    return { data: certificate };
  } catch (error) {
    logger.error("DB: addACertificateToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add certificate", details: error };
  }
};

const checkCertificateExistForAProgram = async (
  type: string,
  userId: string,
  programId: string,
) => {
  try {
    const certificate = await Certificate.findOne({ type, userId, programId });

    if (certificate) {
      return { data: certificate };
    } else {
      return { error: "Certificate does not exist" };
    }
  } catch (error) {
    logger.error("DB: checkCertificateExistForAProgram failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed while checking certificate existence",
      details: error,
    };
  }
};

// Get A Certificate by Id
const getCertificateById = async (certificateId: string) => {
  try {
    const certificate = await Certificate.findById(certificateId);

    if (certificate) {
      return { data: certificate };
    } else {
      return { error: "Certificate not found" };
    }
  } catch (error) {
    logger.error("DB: getCertificateById failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching certificate", details: error };
  }
};

// Get All User Certificates
const getUserCertificates = async (userId: string) => {
  try {
    const certificates = await Certificate.find({ userId });

    if (certificates.length > 0) {
      return { data: certificates };
    } else {
      return { error: "No certificates found" };
    }
  } catch (error) {
    logger.error("DB: getUserCertificates failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed while fetching certificates", details: error };
  }
};

export {
  addACertificateToDB,
  checkCertificateExistForAProgram,
  getCertificateById,
  getUserCertificates,
};
