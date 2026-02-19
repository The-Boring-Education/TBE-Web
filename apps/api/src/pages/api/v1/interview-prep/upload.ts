import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { addAInterviewSheetToDB } from "@/lib/database";
import type { AddInterviewSheetRequestPayloadProps } from "@/lib/interfaces";

/**
 * API endpoint to upload/publish completed interview sheets from The-Boring-Agents to database
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }

    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required",
            });
        }

        // Get the Agents API base URL - default to localhost:8000 if not set
        const AGENTS_API_BASE = process.env.AGENTS_API_BASE || "http://localhost:8000/api/v1";

        // 1. Fetch session output from The-Boring-Agents
        // We use the output endpoint to get the full generated data
        // Endpoint: /interview/session/{sessionId}/output
        console.log(`Fetching session ${sessionId} from ${AGENTS_API_BASE}...`);

        let sessionData;
        try {
            const response = await axios.get(
                `${AGENTS_API_BASE}/interview/session/${sessionId}/output`
            );
            sessionData = response.data;
        } catch (err: any) {
            if (err.response?.status === 404) {
                return res.status(404).json({ success: false, message: "Session not found in Agents API" });
            }
            throw err;
        }

        if (sessionData.status !== "success" || !sessionData.sheet_data) {
            return res.status(400).json({
                success: false,
                message: "Session output is not ready or valid"
            });
        }

        const sheetData = sessionData.sheet_data;

        // 2. Map questions (Validation happens in addAInterviewSheetToDB via Mongoose)
        const questions = sheetData.questions.map((questionItem: any) => ({
            title: questionItem.title || questionItem.question.substring(0, 50),
            question: questionItem.question,
            answer: questionItem.answer,
            frequency: questionItem.frequency || "Asked Frequently",
            priority: questionItem.priority || "Medium",
            companyTypes: questionItem.companyTypes || [],
            resources: questionItem.resources || { youtubeURL: null, leetcodeURL: null, blogURL: null },
        }));

        // 3. Prepare payload
        const interviewSheetPayload: AddInterviewSheetRequestPayloadProps = {
            name: sheetData.name,
            slug: sheetData.slug,
            description: sheetData.description,
            meta: sheetData.meta || sheetData.description,
            coverImageURL: sheetData.coverImageURL || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
            liveOn: new Date().toISOString(),
            roadmap: sheetData.roadmap || "Tech",
            isPremium: sheetData.isPremium || false,
            price: sheetData.price || 0,
            discountPercentage: sheetData.discountPercentage || 0,
            appliedCoupon: sheetData.appliedCoupon,
            features: sheetData.features || [],
            questions: questions as any, 
        };

        // 4. Save to DB
        const { data: savedSheet, error } = await addAInterviewSheetToDB(interviewSheetPayload);

        if (error) {
            console.error("DB Save Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to save to database",
                error: error
            });
        }

        return res.status(200).json({
            success: true,
            message: "Imported successfully",
            data: savedSheet
        });

    } catch (error: any) {
        console.error("Upload handler error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
