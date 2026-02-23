import { Types } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

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
        const { sessionId, metadata: frontendMetadata, sheetData } = req.body;

        if (!sessionId || !sheetData) {
            return res.status(400).json(sendAPIResponse({
                status: false,
                message: "Missing required fields: sessionId and sheetData",
                success: false,
            }));
        }

        // 2. Format Payload
        if (!sheetData || !sheetData.name || !Array.isArray(sheetData.questions)) {
            return res.status(400).json(sendAPIResponse({
                status: false,
                message: "Invalid session data structure. Missing core properties or questions array.",
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
        } = sheetData;

        const metadataOverrides = frontendMetadata || {};

        // Map questions with fresh ObjectIds
        const questions: InterviewSheetQuestionModel[] = rawQuestions.map((questionItem: any) => ({
            _id: new Types.ObjectId(),
            title: questionItem.title,
            question: questionItem.question,
            answer: questionItem.answer,
            frequency: questionItem.frequency,
            priority: questionItem.priority,
            companyTypes: questionItem.companyTypes,
            resources: questionItem.resources,
        })) as InterviewSheetQuestionModel[];

        // Construct final payload with metadata overrides
        const interviewSheetPayload: AddInterviewSheetRequestPayloadProps = {
            name: metadataOverrides.name || name,
            slug: metadataOverrides.slug || slug,
            description: metadataOverrides.description || description,
            meta: metadataOverrides.meta || meta,
            coverImageURL: metadataOverrides.coverImageURL || coverImageURL,
            liveOn: metadataOverrides.liveOn ? new Date(metadataOverrides.liveOn).toISOString() : new Date().toISOString(),
            roadmap: metadataOverrides.roadmap || roadmap,
            isPremium: metadataOverrides.isPremium !== undefined ? metadataOverrides.isPremium : isPremium,
            price: metadataOverrides.price !== undefined ? metadataOverrides.price : price,
            discountPercentage: metadataOverrides.discountPercentage !== undefined ? metadataOverrides.discountPercentage : discountPercentage,
            appliedCoupon: metadataOverrides.appliedCoupon !== undefined ? metadataOverrides.appliedCoupon : appliedCoupon,
            features: metadataOverrides.features || features,
            questions,
        };

        // 3. Save to DB
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
