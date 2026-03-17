import { withAuth } from "@tbe/auth";
import type { NextApiRequest, NextApiResponse } from "next";

import type { SaveProgressRequest, SaveProgressResponse } from "@/types/resume";

async function handler(
  req: NextApiRequest & { user: any },
  res: NextApiResponse<SaveProgressResponse>,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { stepData, currentStep, hasResume, showTemplate } =
      req.body as SaveProgressRequest;

    if (!stepData || currentStep === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const totalItems = stepData.reduce(
      (acc, step) => acc + step.checklist.length,
      0,
    );
    const checkedItems = stepData.reduce(
      (acc, step) => acc + step.checklist.filter((item) => item.checked).length,
      0,
    );
    const overallScore = Math.round((checkedItems / totalItems) * 100);

    const progress = {
      userId: req.user.id || req.user.email || "",
      stepData,
      currentStep,
      overallScore,
      hasResume: hasResume !== undefined ? hasResume : null,
      showTemplate: showTemplate || false,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

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

export default withAuth(handler);
