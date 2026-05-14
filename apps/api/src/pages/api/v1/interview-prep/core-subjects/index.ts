import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { CoreSubject } from "@/lib/database/models";
import { sendAPIResponse } from "@/lib/utils";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method !== "GET") {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: `Method ${req.method} Not Allowed`,
      }),
    );
  }

  try {
    const coreSubjects = await CoreSubject.find({ isActive: true }).sort({
      order: 1,
    });

    // Map to frontend expected shape
    const formattedData = coreSubjects.map((subject) => ({
      id: subject.subjectId,
      label: subject.label,
      chapters: subject.chapters.map((chapter) => ({
        id: chapter._id?.toString(),
        title: chapter.title,
        description: chapter.description,
        content: chapter.content,
      })),
    }));

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: formattedData,
      }),
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Failed to fetch core subjects",
        error,
      }),
    );
  }
};

export default withApiHandler(handler);
