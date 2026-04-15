import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  addDSAQuestionToDB,
  getAllDSAQuestionsFromDB,
  getDSASheetMetadataFromDB,
  getDSATopicSummariesFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import {
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
  const parsed = parseDsaSheetGetQuery(req.query);
  if (!parsed.ok) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: parsed.message,
      }),
    );
  }

  if (parsed.value.mode === "topics") {
    const { data, error } = await getDSATopicSummariesFromDB(
      parsed.value.userId,
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
  const { data, error } = await getAllDSAQuestionsFromDB({
    ...(filters.domain?.length ? { domain: filters.domain } : {}),
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
    ...(filters.realWorld ? { realWorld: filters.realWorld } : {}),
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
