import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { Types } from "mongoose";
import { addAInterviewSheetToDB } from "@/lib/database";
import type { AddInterviewSheetRequestPayloadProps, InterviewSheetQuestionModel } from "@/lib/interfaces";
import { sendAPIResponse } from "@/lib/utils/functions";

/**
 * API endpoint to upload/publish completed interview sheets from The-Boring-Agents to database
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json(sendAPIResponse({
            status: false,
            message: "Method not allowed",
            success: false,
        }));
    }

    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json(sendAPIResponse({
                status: false,
                message: "Session ID is required",
                success: false,
            }));
        }

        // Get the Agents API base URL - default to localhost:8000 if not set
        const AGENTS_API_BASE = process.env.AGENTS_API_BASE || "http://localhost:8000/api/v1";

        // 1. Fetch session output from The-Boring-Agents
        console.log(`Fetching session ${sessionId} from ${AGENTS_API_BASE}...`);

        let sessionData;
        try {
            const response = await axios.get(
                `${AGENTS_API_BASE}/interview/session/${sessionId}/output`
            );
            sessionData = response.data;
        } catch (err: any) {
            if (err.response?.status === 404) {
                return res.status(404).json(sendAPIResponse({
                    status: false,
                    message: "Session not found in Agents API",
                    success: false,
                }));
            }
            throw err;
        }

        if (sessionData.status !== "success" || !sessionData.sheet_data) {
            return res.status(400).json(sendAPIResponse({
                status: false,
                message: "Session output is not ready or valid",
                success: false,
            }));
        }

        const {
            questions: rawQuestions,
            name,
            slug,
            description,
            meta,
            coverImageURL,
            roadmap,
            isPremium,
            price,
            discountPercentage,
            appliedCoupon,
            features
        } = sessionData.sheet_data;

        // 2. Map questions (Validation happens in addAInterviewSheetToDB via Mongoose)
        const questions: InterviewSheetQuestionModel[] = rawQuestions.map((questionItem: any) => ({
            _id: new Types.ObjectId(),
            title: questionItem.title,
            question: questionItem.question,
            answer: questionItem.answer,
            frequency: questionItem.frequency,
            priority: questionItem.priority,
            companyTypes: questionItem.companyTypes,
            resources: questionItem.resources,
        })) as InterviewSheetQuestionModel[]; // Casting required as strictly typed return expects methods

        // 3. Prepare payload
        const interviewSheetPayload: AddInterviewSheetRequestPayloadProps = {
            name,
            slug,
            description,
            meta: meta,
            coverImageURL,
            liveOn: new Date().toISOString(),
            roadmap,
            isPremium,
            price,
            discountPercentage,
            appliedCoupon,
            features,
            questions,
        };

        // 4. Save to DB
        const { data: savedSheet, error } = await addAInterviewSheetToDB(interviewSheetPayload);

        if (error) {
            console.error("DB Save Error:", error);
            return res.status(500).json(sendAPIResponse({
                status: false,
                message: "Failed to save to database",
                error,
                success: false,
            }));
        }

        return res.status(200).json(sendAPIResponse({
            status: true,
            message: "Imported successfully",
            data: savedSheet,
            success: true,
        }));

    } catch (error: any) {
        console.error("Upload handler error:", error.message);
        return res.status(500).json(sendAPIResponse({
            status: false,
            message: "Internal server error",
            error: error.message,
            success: false,
        }));
    }
}
