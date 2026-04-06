import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  addDSAQuestionToDB,
  getAllDSAQuestionsFromDB,
  getDSASheetMetadataFromDB,
  getDSATopicSummariesFromDB,
} from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
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
  const {
    title,
    answer,
    content,
    domain,
    difficulty,
    companyTypes,
    topics,
    sections,
    isRealWorldProblem,
  } = req.body;

  const questionAnswer = answer || content;
  if (
    !title ||
    !questionAnswer ||
    !domain ||
    !difficulty ||
    !companyTypes ||
    !topics
  )
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message:
          "Required: title, answer, domain, difficulty, companyTypes, topics",
      }),
    );

  const { data, error } = await addDSAQuestionToDB({
    title,
    answer: questionAnswer,
    domain: Array.isArray(domain) ? domain : [domain],
    difficulty,
    companyTypes: Array.isArray(companyTypes) ? companyTypes : [companyTypes],
    topics: Array.isArray(topics) ? topics : [topics],
    ...(sections && { sections }),
    ...(typeof isRealWorldProblem === "boolean" && { isRealWorldProblem }),
  });

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
  const {
    domain,
    difficulty,
    companyType,
    topic,
    page,
    limit,
    metadata,
    query,
    userId,
  } = req.query;

  if (query === "topics") {
    const { data, error } = await getDSATopicSummariesFromDB(userId as string);
    if (error)
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, error }));
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  if (metadata === "true") {
    const { data, error } = await getDSASheetMetadataFromDB();
    if (error)
      return res
        .status(apiStatusCodes.INTERNAL_SERVER_ERROR)
        .json(sendAPIResponse({ status: false, error }));
    return res
      .status(apiStatusCodes.OKAY)
      .json(sendAPIResponse({ status: true, data }));
  }

  const toArray = (val: any) =>
    val ? (Array.isArray(val) ? val : [val]) : undefined;

  const { data, error } = await getAllDSAQuestionsFromDB({
    domain: toArray(domain),
    difficulty: toArray(difficulty),
    companyTypes: toArray(companyType),
    topics: toArray(topic),
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : topic ? undefined : 50,
    userId: userId as string,
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
