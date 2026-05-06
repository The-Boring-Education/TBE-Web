import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  addDSAQuestionToDB,
  checkPaymentStatusFromDB,
  getAllDSAQuestionsFromDB,
  getDSASheetMetadataFromDB,
  getDSATopicSummariesFromDB,
} from "@/lib/database";
import {
  sendAPIResponse,
  trackPersonalizationInvalidInput,
  trackPersonalizationNormalizationFallback,
} from "@/lib/utils";
import {
  allQueryValues,
  firstQueryValue,
  isCanonicalCompanyTypeInput,
  isCanonicalDsaDurationInput,
  parseDsaSheetCreateBody,
  parseDsaSheetGetQuery,
} from "@/lib/validation";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGetQuestion(req, res);
    case "POST":
      return handleCreateQuestion(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleCreateQuestion = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const parsed = parseDsaSheetCreateBody(req.body);
  if (!parsed.ok) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: parsed.message,
      }),
    );
  }

  const { data, error } = await addDSAQuestionToDB({
    ...parsed.value,
  } as Parameters<typeof addDSAQuestionToDB>[0]);

  if (error) {
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        sendAPIResponse({ status: false, message: "Failed to create", error }),
      );
  }

  return res
    .status(apiStatusCodes.RESOURCE_CREATED)
    .json(
      sendAPIResponse({ status: true, data, message: "DSA question created" }),
    );
};

const handleGetQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  const rawDuration = firstQueryValue(req.query.duration)?.trim();
  const rawCompanyTypes =
    allQueryValues(req.query.companyType)
      ?.map((entry) => String(entry).trim())
      .filter(Boolean) ?? [];

  const parsed = parseDsaSheetGetQuery(req.query);
  if (!parsed.ok) {
    if (parsed.message.startsWith("Invalid duration")) {
      trackPersonalizationInvalidInput({
        route: "GET /api/v1/interview-prep/dsa-sheet",
        field: "duration",
        reason: parsed.message,
        value: rawDuration,
      });
    } else if (parsed.message.startsWith("Invalid companyType")) {
      trackPersonalizationInvalidInput({
        route: "GET /api/v1/interview-prep/dsa-sheet",
        field: "companyType",
        reason: parsed.message,
        value: rawCompanyTypes,
      });
    } else if (parsed.message.startsWith("Invalid productType")) {
      trackPersonalizationInvalidInput({
        route: "GET /api/v1/interview-prep/dsa-sheet",
        field: "productType",
        reason: parsed.message,
        value: firstQueryValue(req.query.productType),
      });
    } else if (parsed.message.startsWith("Invalid userId")) {
      trackPersonalizationInvalidInput({
        route: "GET /api/v1/interview-prep/dsa-sheet",
        field: "userId",
        reason: parsed.message,
        value: firstQueryValue(req.query.userId),
      });
    }

    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: parsed.message,
      }),
    );
  }

  const parsedDuration =
    parsed.value.mode === "metadata"
      ? undefined
      : parsed.value.mode === "topics"
        ? parsed.value.duration
        : parsed.value.filters.duration;

  if (
    rawDuration &&
    parsedDuration &&
    !isCanonicalDsaDurationInput(rawDuration)
  ) {
    trackPersonalizationNormalizationFallback({
      route: "GET /api/v1/interview-prep/dsa-sheet",
      field: "duration",
      rawValue: rawDuration,
      normalizedValue: parsedDuration,
    });
  }

  if (parsed.value.mode === "list" && rawCompanyTypes.length > 0) {
    const fallbackCount = rawCompanyTypes.filter(
      (entry) => !isCanonicalCompanyTypeInput(entry),
    ).length;

    if (fallbackCount > 0) {
      trackPersonalizationNormalizationFallback({
        route: "GET /api/v1/interview-prep/dsa-sheet",
        field: "companyType",
        fallbackCount,
        rawValue: rawCompanyTypes
          .filter((entry) => !isCanonicalCompanyTypeInput(entry))
          .slice(0, 3)
          .join(", "),
        normalizedValue: (parsed.value.filters.companyTypes ?? []).join(", "),
      });
    }
  }

  if (parsed.value.mode === "topics") {
    const isPaidUser =
      parsed.value.userId && parsed.value.duration
        ? (
            await checkPaymentStatusFromDB(
              parsed.value.userId,
              "lifetime",
              parsed.value.productType,
            )
          ).data?.purchased === true
        : false;

    const { data, error } = await getDSATopicSummariesFromDB(
      parsed.value.userId,
      parsed.value.productType,
      parsed.value.experienceLevel,
      parsed.value.duration,
      parsed.value.offCampus,
      isPaidUser,
    );
    if (error)
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, error }));
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  if (parsed.value.mode === "metadata") {
    const { data, error } = await getDSASheetMetadataFromDB();
    if (error)
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, error }));
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  const { filters } = parsed.value;

  // Check subscription status for freemium gating.
  const userId = filters.userId;
  const isPaidUser = userId
    ? (await checkPaymentStatusFromDB(userId, "lifetime", filters.productType))
        .data?.purchased === true
    : false;

  const { data, error } = await getAllDSAQuestionsFromDB({
    ...(filters.difficulty?.length ? { difficulty: filters.difficulty } : {}),
    ...(filters.companyTypes?.length
      ? { companyTypes: filters.companyTypes }
      : {}),
    ...(filters.topics?.length ? { topics: filters.topics } : {}),
    page: filters.page,
    limit: filters.limit,
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.duration ? { duration: filters.duration } : {}),
    offCampus: filters.offCampus,
    productType: filters.productType,
    ...(filters.experienceLevel
      ? { experienceLevel: filters.experienceLevel }
      : {}),
    ...(filters.realWorld ? { realWorld: filters.realWorld } : {}),
    isPaidUser,
  });

  if (error)
    return res
      .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
      .json(sendAPIResponse({ status: false, error }));
  return res
    .status(apiStatusCodes.OKAY)
    .json(sendAPIResponse({ status: true, data }));
};

export default withApiHandler(handler);
