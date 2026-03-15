import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import {
  addAProjectToDB,
  getProjectBySlugFromDB,
  getProjectBySlugWithUserFromDB,
  getProjectsFromDB,
} from "@/lib/database";
import type { AddProjectRequestPayloadProps } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      return handleAddProject(req, res);
    case "GET":
      return handleGetProjects(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        }),
      );
  }
};

const handleAddProject = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    name,
    slug,
    description,
    coverImageURL,
    requiredSkills,
    roadmap,
    difficultyLevel,
  } = req.body as AddProjectRequestPayloadProps;

  const { error: projectAlreadyExist } = await getProjectBySlugFromDB(slug);

  if (!projectAlreadyExist) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Project already exists",
      }),
    );
  }

  const { data, error } = await addAProjectToDB({
    name,
    slug,
    description,
    coverImageURL,
    requiredSkills,
    roadmap,
    difficultyLevel,
  });

  if (error) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Project not added",
        error,
      }),
    );
  }

  return res.status(apiStatusCodes.RESOURCE_CREATED).json(
    sendAPIResponse({
      status: true,
      message: "Project Added!",
      data,
    }),
  );
};

const handleGetProjects = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, userId } = req.query as { slug: string; userId: string };

  // If slug is provided, fetch specific project by slug with user data
  if (slug) {
    const { data: project, error } = await getProjectBySlugWithUserFromDB(
      slug,
      userId,
    );

    if (error || !project) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "Project not found",
          error,
        }),
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: project,
      }),
    );
  }

  // No slug? Return all projects (existing logic)
  const { data, error } = await getProjectsFromDB();

  if (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Error fetching projects",
        error: error.message,
      }),
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      message: "Projects fetched successfully",
      data,
    }),
  );
};

export default withApiHandler(handler);
