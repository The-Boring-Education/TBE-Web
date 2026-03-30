import type { NextApiRequest, NextApiResponse } from "next";

import { getStudyGuideByTopicFromDB } from "@/lib/database/queries/interview-prep";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { topic } = req.query;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "Topic is required" });
  }

  const result = await getStudyGuideByTopicFromDB(topic);

  if (result.error) {
    // If not found, return 200 with hasGuide: false rather than 404 to avoid frontend errors
    if (result.error === "Study guide not found") {
      return res.status(200).json({ status: true, data: { hasGuide: false } });
    }
    return res.status(500).json({ message: result.error });
  }

  return res.status(200).json({ status: true, data: result.data });
}
