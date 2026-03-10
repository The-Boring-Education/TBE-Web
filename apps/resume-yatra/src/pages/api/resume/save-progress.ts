import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import type { SaveProgressRequest, SaveProgressResponse } from "@/types/resume";

import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SaveProgressResponse>,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { stepData, currentStep, hasResume, showTemplate } =
      req.body as SaveProgressRequest;

    // Validate request body
    if (!stepData || currentStep === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Calculate overall score
    const totalItems = stepData.reduce(
      (acc, step) => acc + step.checklist.length,
      0,
    );
    const checkedItems = stepData.reduce(
      (acc, step) => acc + step.checklist.filter((item) => item.checked).length,
      0,
    );
    const overallScore = Math.round((checkedItems / totalItems) * 100);

    // TODO: Save to database
    // For now, we'll simulate a successful save
    // In production, you would:
    // 1. Connect to your database (MongoDB, PostgreSQL, etc.)
    // 2. Update or create the user's resume progress
    // 3. Return the saved progress

    const progress = {
      userId: (session.user as any).id || session.user.email || "",
      stepData,
      currentStep,
      overallScore,
      hasResume: hasResume !== undefined ? hasResume : null,
      showTemplate: showTemplate || false,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    // Simulate database save delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return res.status(200).json({
      success: true,
      message: "Progress saved successfully",
      progress,
    });
  } catch (error) {
    console.error("Error saving progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save progress",
    });
  }
}
