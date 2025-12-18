import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import {
  addAInterviewSheetToDB,
  addQuestionToInterviewSheetInDB,
} from "@/lib/database";
import type { AddInterviewSheetRequestPayloadProps } from "@/lib/interfaces";
import { connectDB, logRequest } from "@/middleware/api";

/**
 * API endpoint to upload/publish completed interview sheets from The-Boring-Agents to database
 * Similar to quiz upload functionality but for interview prep sheets
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  logRequest(req, res);
  
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();
    const { sessionId, name, description, isPremium, price, coverImageURL } =
      req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    // Get the Agents API base URL
    const AGENTS_API_BASE = process.env.AGENTS_API_BASE;

    // Fetch session data from The-Boring-Agents
    const sessionResponse = await axios.get(
      `${AGENTS_API_BASE}/interview/session/${sessionId}/progress`
    );

    if (!sessionResponse.data) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const sessionData = sessionResponse.data;

    console.log("Session data received:", JSON.stringify(sessionData, null, 2));

    if (sessionData.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only upload completed sessions",
      });
    }

    if (!sessionData.sheetData || !sessionData.sheetData.questions) {
      console.log("Missing sheetData or questions:", sessionData.sheetData);
      return res.status(400).json({
        success: false,
        message: "No sheet data found in session",
      });
    }

    const sheetData = sessionData.sheetData;
    console.log(
      `Found ${sheetData.questions.length} questions in session data`
    );

    // Prepare interview sheet payload for database
    const interviewSheetPayload: AddInterviewSheetRequestPayloadProps = {
      name:
        name || sheetData.name || `${sessionData.topic} Interview Questions`,
      topic: sessionData.topic || "General",
      description:
        description ||
        sheetData.description ||
        `Comprehensive ${sessionData.topic} interview questions with detailed answers`,
      slug:
        sheetData.slug ||
        sessionData.topic
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      coverImageURL:
        coverImageURL ||
        sheetData.cover_image_url ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      liveOn: new Date().toISOString(),
      roadmap: (sessionData.roadmap as any) || "Tech",
      isPremium: isPremium || false,
      price: isPremium ? price || 0 : 0,
      features: [
        `${sheetData.questions.length} comprehensive questions`,
        "Detailed explanations and answers",
        "Curated by AI experts",
        "Updated content",
        "Multiple difficulty levels",
      ],
    };

    // Save the sheet to database
    const { data: savedSheet, error: sheetError } =
      await addAInterviewSheetToDB(interviewSheetPayload);

    if (sheetError || !savedSheet) {
      console.error("Error saving interview sheet:", sheetError);
      return res.status(500).json({
        success: false,
        message: "Failed to save interview sheet to database",
        detailedError: sheetError,
      });
    }

    // Add questions to the saved sheet
    let successfulQuestions = 0;
    let failedQuestions = 0;

    console.log(
      "Starting to add questions. Total questions:",
      sheetData.questions.length
    );
    console.log(
      "Questions data:",
      JSON.stringify(sheetData.questions, null, 2)
    );

    for (let index = 0; index < sheetData.questions.length; index++) {
      const question = sheetData.questions[index];
      try {
        // Prepare question data
        const questionPayload = {
          title:
            question.title ||
            question.question?.substring(0, 100) ||
            `Question ${index + 1}`,
          question: question.question || "",
          answer: question.answer || "",
          frequency: question.frequency || "Asked Frequently",
          priority: question.priority || "Medium",
          companyTypes: question.company_types || ["Startup", "MNC"],
        };

        // Add question directly to database
        const { error: questionError } = await addQuestionToInterviewSheetInDB(
          savedSheet._id.toString(),
          questionPayload
        );

        if (questionError) {
          console.error(`Error adding question ${index + 1}:`, questionError);
          failedQuestions++;
        } else {
          successfulQuestions++;
        }
      } catch (error) {
        console.error(`Error adding question ${index + 1}:`, error);
        failedQuestions++;
      }
    }

    const totalQuestions = sheetData.questions.length;

    // Log completion
    console.log(`Interview sheet uploaded: ${savedSheet._id}`);
    console.log(`Questions added: ${successfulQuestions}/${totalQuestions}`);
    if (failedQuestions > 0) {
      console.warn(`Failed to add ${failedQuestions} questions`);
    }

    // Log database save confirmation
    console.log(
      `✓ Saved to MongoDB - Database: ${process.env.MONGODB_URI?.split("/").pop()} | Collection: interviewsheets | Sheet ID: ${savedSheet._id} | Questions: ${successfulQuestions}/${totalQuestions}`
    );

    // Clean up session data from The-Boring-Agents (optional)
    try {
      await axios.delete(`${AGENTS_API_BASE}/interview/session/${sessionId}`);
    } catch (cleanupError) {
      console.warn("Failed to cleanup session:", cleanupError);
      // Don't fail the upload for cleanup errors
    }

    return res.status(200).json({
      success: true,
      message: "Interview sheet uploaded successfully",
      data: {
        sheetId: savedSheet._id,
        name: savedSheet.name,
        questionsAdded: successfulQuestions,
        totalQuestions: totalQuestions,
        slug: savedSheet.slug,
      },
    });
  } catch (error) {
    console.error("Interview sheet upload error:", error);

    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: "Session not found in The-Boring-Agents",
        });
      }
      if (error.response?.status === 400) {
        return res.status(400).json({
          success: false,
          message:
            error.response.data?.message ||
            "Invalid request to The-Boring-Agents",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during upload",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
