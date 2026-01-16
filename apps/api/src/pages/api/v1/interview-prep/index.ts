import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes, COMPANY_TYPES,DSA_DIFFICULTY, DSA_DOMAIN } from "@/lib/constants";
import {
  addAInterviewSheetToDB,
  getAllInterviewSheetsFromDB,
  getDSAQuestionsGroupedByTopic,
  getInterviewSheetBySlugFromDB,
} from "@/lib/database";
import type { AddInterviewSheetRequestPayloadProps, CompanyType, DSADifficultyType, DSADomainType } from "@/lib/interfaces";
import { cors, sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  await connectDB();
  const { method } = req;

  switch (method) {
    case "POST":
      return handleAddASheet(req, res);
    case "GET":
      return handleAllGetSheet(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const handleAddASheet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sheetPayload = req.body as AddInterviewSheetRequestPayloadProps;

    const { error: sheetAlreadyExist } = await getInterviewSheetBySlugFromDB(
      sheetPayload.slug
    );

    if (!sheetAlreadyExist) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Sheet already exists",
        })
      );
    }

    const { data, error } = await addAInterviewSheetToDB(sheetPayload);

    if (error) {
      console.log("Error:", error);
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Sheet not added",
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Sheet added successfully",
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while adding sheet",
        error,
      })
    );
  }
};

const handleAllGetSheet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { slug, roadmap, domain, difficulty, companyType } = req.query;

    // Check if this is a DSA request
    if (roadmap === "DSA") {
      return handleDSAMode(req, res, {
        domain: domain as string,
        difficulty: difficulty as string,
        companyType: companyType as string,
      });
    }

    // Existing InterviewSheet logic
    const { userId } = req.query;
    if (slug) {
      const { data: sheet, error } = await getInterviewSheetBySlugFromDB(
        slug as string,
        userId as string
      );

      if (error || !sheet) {
        return res.status(apiStatusCodes.NOT_FOUND).json(
          sendAPIResponse({
            status: false,
            message: "Sheet not found",
            error,
          })
        );
      }

      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data: sheet,
        })
      );
    }

    // No slug? Return all sheets
    const { data: allSheets, error } = await getAllInterviewSheetsFromDB();

    if (error || !allSheets) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while fetching sheets",
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: allSheets,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Unexpected error while fetching sheets",
        error,
      })
    );
  }
};

const handleDSAMode = async (
  req: NextApiRequest,
  res: NextApiResponse,
  filters: {
    domain?: string;
    difficulty?: string;
    companyType?: string;
  }
) => {
  try {
    // Validate and set default domain
    let domain: DSADomainType = "GENERAL";
    if (filters.domain && DSA_DOMAIN.includes(filters.domain as DSADomainType)) {
      domain = filters.domain as DSADomainType;
    }

    // Validate difficulty if provided
    let difficulty: DSADifficultyType | undefined;
    if (filters.difficulty && DSA_DIFFICULTY.includes(filters.difficulty as DSADifficultyType)) {
      difficulty = filters.difficulty as DSADifficultyType;
    }

    // Validate companyType if provided
    let companyType: CompanyType | undefined;
    if (filters.companyType && COMPANY_TYPES.includes(filters.companyType as CompanyType)) {
      companyType = filters.companyType as CompanyType;
    }

    // Fetch DSA questions grouped by topic
    const { data, error } = await getDSAQuestionsGroupedByTopic(
      domain,
      difficulty,
      companyType
    );

    if (error || !data) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed while fetching DSA questions",
          error,
        })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "DSA questions retrieved successfully",
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Unexpected error while fetching DSA questions",
        error,
      })
    );
  }
};

export default handler;
