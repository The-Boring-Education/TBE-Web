import { withAuth } from "@tbe/auth";
import type { NextApiRequest, NextApiResponse } from "next";

import type { GetProgressResponse } from "@/types/resume";

async function handler(
  req: NextApiRequest & { user: any },
  res: NextApiResponse<GetProgressResponse>,
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 50));

    return res.status(200).json({
      success: true,
      progress: undefined,
      message: "No saved progress found",
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
    });
  }
}

export default withAuth(handler);
