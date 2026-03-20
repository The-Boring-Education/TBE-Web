import type { NextApiRequest, NextApiResponse } from "next";

import {
  apiStatusCodes,
  APTITUDE_CATEGORIES,
  APTITUDE_SUB_CATEGORIES,
  COMPANY_TYPES,
  DSA_DIFFICULTY,
  DSA_DOMAIN,
  PAGINATION_LIMITS,
} from "@/lib/constants";
import {
  addAInterviewSheetToDB,
  getAllInterviewSheetsFromDB,
  getAptitudeMetadataFromDB,
  getAptitudeQuestionsByTopicFromDB,
  getAptitudeTopicsWithQuestionCountFromDB,
  getDSAQuestionsGroupedByTopic,
  getDSASheetMetadataFromDB,
  getInterviewSheetBySlugFromDB,
} from "@/lib/database";
import type {
  AddInterviewSheetRequestPayloadProps,
  AptitudeCategoryType,
  AptitudeSubCategoryType,
  CompanyType,
  DSADifficultyType,
  DSADomainType,
} from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

type RoadmapType = "DSA" | "APTITUDE";

const ROADMAP_HANDLERS: Record<
  RoadmapType,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void>
> = {
  DSA: handleDSAMode,
  APTITUDE: handleAptitudeMode,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      return handleAddASheet(req, res);
    case "GET":
      return handleGet(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleAddASheet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sheetPayload = req.body as AddInterviewSheetRequestPayloadProps;

    const { error: sheetAlreadyExist } = await getInterviewSheetBySlugFromDB(
      sheetPayload.slug,
    );

    if (!sheetAlreadyExist) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: "Sheet already exists",
        }),
      );
    }

    const { data, error } = await addAInterviewSheetToDB(sheetPayload);

    if (error) {
      logger.error("Error adding interview sheet", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Sheet not added",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data,
        message: "Sheet added successfully",
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while adding sheet",
        error,
      }),
    );
  }
};

// ─── Main GET Router ──────────────────────────────────────────────────────────

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { roadmap } = req.query;

    const roadmapHandler = roadmap
      ? ROADMAP_HANDLERS[roadmap as RoadmapType]
      : undefined;

    if (roadmap && !roadmapHandler) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Invalid roadmap: ${roadmap}. Supported: ${Object.keys(ROADMAP_HANDLERS).join(", ")}`,
        }),
      );
    }

    if (roadmapHandler) {
      return roadmapHandler(req, res);
    }

    return handleSheetsMode(req, res);
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Unexpected error while fetching data",
        error,
      }),
    );
  }
};

// ─── Sheets Mode (default, no roadmap) ───────────────────────────────────────

async function handleSheetsMode(req: NextApiRequest, res: NextApiResponse) {
  const { slug, userId } = req.query;

  if (slug) {
    const { data: sheet, error } = await getInterviewSheetBySlugFromDB(
      slug as string,
      userId as string,
    );

    if (error || !sheet) {
      return res
        .status(apiStatusCodes.NOT_FOUND)
        .json(
          sendAPIResponse({ status: false, message: "Sheet not found", error }),
        );
    }

    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data: sheet }));
  }

  const { data: allSheets, error } = await getAllInterviewSheetsFromDB();

  if (error || !allSheets) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while fetching sheets",
        error,
      }),
    );
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data: allSheets }));
}

// ─── DSA Mode (?roadmap=DSA) ─────────────────────────────────────────────────
// Query params:
//   metadata=true          → available filters (domains, difficulties, companyTypes, topics)
//   domain, difficulty, companyType → filter questions grouped by topic
//   (default)              → all questions grouped by topic

async function handleDSAMode(req: NextApiRequest, res: NextApiResponse) {
  const { metadata, domain, difficulty, companyType } = req.query;

  if (metadata === "true") {
    const { data, error } = await getDSASheetMetadataFromDB();
    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to fetch DSA metadata",
          error,
        }),
      );
    }
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  let validDomain: DSADomainType = "GENERAL";
  if (domain && DSA_DOMAIN.includes(domain as DSADomainType)) {
    validDomain = domain as DSADomainType;
  }

  let validDifficulty: DSADifficultyType | undefined;
  if (difficulty && DSA_DIFFICULTY.includes(difficulty as DSADifficultyType)) {
    validDifficulty = difficulty as DSADifficultyType;
  }

  let validCompanyType: CompanyType | undefined;
  if (companyType && COMPANY_TYPES.includes(companyType as CompanyType)) {
    validCompanyType = companyType as CompanyType;
  }

  const { data, error } = await getDSAQuestionsGroupedByTopic(
    validDomain,
    validDifficulty,
    validCompanyType,
  );

  if (error || !data) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed while fetching DSA questions",
        error,
      }),
    );
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data }));
}

// ─── Aptitude Mode (?roadmap=APTITUDE) ───────────────────────────────────────
// Query params:
//   metadata=true          → full metadata (categories, counts, grouped topics)
//   topic=<slug>           → questions for a specific topic (+ difficulty, page, limit)
//   category, subCategory  → filter topics list
//   (default)              → topics with question counts

async function handleAptitudeMode(req: NextApiRequest, res: NextApiResponse) {
  const { metadata, topic, category, subCategory, difficulty, page, limit } =
    req.query;

  if (metadata === "true") {
    const { data, error } = await getAptitudeMetadataFromDB();
    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to fetch aptitude metadata",
          error,
        }),
      );
    }
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  if (topic) {
    const { data, error } = await getAptitudeQuestionsByTopicFromDB(
      topic as string,
      {
        difficulty: difficulty as DSADifficultyType | undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit
          ? Math.min(
              parseInt(limit as string),
              PAGINATION_LIMITS.APTITUDE_ROADMAP,
            )
          : PAGINATION_LIMITS.DEFAULT,
      },
    );

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: "Failed to fetch aptitude questions",
          error,
        }),
      );
    }
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  const validCategory =
    category && APTITUDE_CATEGORIES.includes(category as AptitudeCategoryType)
      ? (category as AptitudeCategoryType)
      : undefined;
  const validSubCategory =
    subCategory &&
    APTITUDE_SUB_CATEGORIES.includes(subCategory as AptitudeSubCategoryType)
      ? (subCategory as AptitudeSubCategoryType)
      : undefined;

  const { data, error } = await getAptitudeTopicsWithQuestionCountFromDB({
    category: validCategory,
    subCategory: validSubCategory,
  });

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to fetch aptitude topics",
        error,
      }),
    );
  }

  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data }));
}

export default withApiHandler(handler);
