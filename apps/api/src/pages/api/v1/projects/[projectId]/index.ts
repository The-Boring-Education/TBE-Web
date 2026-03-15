import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  deleteProjectFromDB,
  getAProjectForUserFromDB,
  getProjectByIDFromDB,
  updateProjectInDB,
} from "@/lib/database";
import type { UpdateProjectRequestPayloadProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req;
  const { projectId, userId } = query as { projectId: string; userId: string };

  switch (req.method) {
    case "GET":
      return handleGetProjectById(req, res, userId, projectId);
    case "PATCH":
      return handleUpdateProject(req, res, projectId as string);
    case "DELETE":
      return handleDeleteProject(req, res, projectId as string);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleGetProjectById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  projectId: string,
) => {
  if (!projectId) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Project ID is required",
      }),
    );
  }

  const { data, error } = await getAProjectForUserFromDB(userId, projectId);

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error fetching project",
      }),
    );
  }

  if (!data) {
    return res.status(apiStatusCodes.NOT_FOUND).json(
      sendAPIResponse({
        status: false,
        message: "Project not found",
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Project fetched successfully",
      data,
    }),
  );
};

const handleUpdateProject = async (
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
) => {
  const { updatedData } = req.body as UpdateProjectRequestPayloadProps;

  const { error: projectNotFound } = await getProjectByIDFromDB(projectId);

  if (projectNotFound) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Project doesn't exists",
      }),
    );
  }

  const { data, error } = await updateProjectInDB({ projectId, updatedData });

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error updating project",
        error: error.message,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Project updated successfully",
      data,
    }),
  );
};

const handleDeleteProject = async (
  req: NextApiRequest,
  res: NextApiResponse,
  projectId: string,
) => {
  const { data, error } = await deleteProjectFromDB(projectId);

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error deleting project",
        error: error.message,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Project deleted successfully",
      data,
    }),
  );
};

export default withApiHandler(handler);
