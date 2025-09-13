import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { addAInterviewSheetToDB } from '@/database'
import { AddInterviewSheetRequestPayloadProps } from '@/interfaces'

/**
 * API endpoint to upload/publish completed interview sheets from The-Boring-Agents to database
 * Similar to quiz upload functionality but for interview prep sheets
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        })
    }

    try {
        const { sessionId, name, description, isPremium, price, coverImageURL } = req.body

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            })
        }

        // Get the Agents API base URL
        const AGENTS_API_BASE = process.env.VITE_AGENTS_API_BASE || 'http://localhost:8088/api/v1'

        // Fetch session data from The-Boring-Agents
        const sessionResponse = await axios.get(`${AGENTS_API_BASE}/interview/session/${sessionId}/progress`)
        
        if (!sessionResponse.data) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            })
        }

        const sessionData = sessionResponse.data

        if (sessionData.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only upload completed sessions'
            })
        }

        if (!sessionData.sheetData || !sessionData.sheetData.questions) {
            return res.status(400).json({
                success: false,
                message: 'No sheet data found in session'
            })
        }

        const sheetData = sessionData.sheetData

        // Prepare interview sheet payload for database
        const interviewSheetPayload: AddInterviewSheetRequestPayloadProps = {
            title: name || sheetData.name || `${sessionData.topic} Interview Questions`,
            description: description || sheetData.description || `Comprehensive ${sessionData.topic} interview questions with detailed answers`,
            slug: sheetData.slug || sessionData.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            coverImageURL: coverImageURL || sheetData.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            liveOn: new Date().toISOString(),
            roadmap: (sessionData.roadmap as any) || 'Tech',
            isPremium: isPremium || false,
            price: isPremium ? (price || 0) : 0,
            features: [
                `${sheetData.questions.length} comprehensive questions`,
                'Detailed explanations and answers',
                'Curated by AI experts',
                'Updated content',
                'Multiple difficulty levels'
            ]
        }

        // Save the sheet to database
        const { data: savedSheet, error: sheetError } = await addAInterviewSheetToDB(interviewSheetPayload)

        if (sheetError || !savedSheet) {
            console.error('Error saving interview sheet:', sheetError)
            return res.status(500).json({
                success: false,
                message: 'Failed to save interview sheet to database',
                error: sheetError
            })
        }

        // Add questions to the saved sheet
        const questionPromises = sheetData.questions.map(async (question: any, index: number) => {
            try {
                // Prepare question data
                const questionPayload = {
                    title: question.title || question.question?.substring(0, 100) || `Question ${index + 1}`,
                    question: question.question || '',
                    answer: question.answer || '',
                    frequency: question.frequency || 'Asked Frequently',
                    priority: question.priority || 'Medium',
                    companyTypes: question.company_types || ['Startup', 'MNC']
                }

                // Add question via API call to maintain consistency
                const questionResponse = await axios.post(
                    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/interview-prep/${savedSheet._id}/question`,
                    questionPayload,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )

                return questionResponse.data
            } catch (error) {
                console.error(`Error adding question ${index + 1}:`, error)
                return null
            }
        })

        // Wait for all questions to be added
        const questionResults = await Promise.allSettled(questionPromises)
        const successfulQuestions = questionResults.filter(result => result.status === 'fulfilled' && result.value).length
        const failedQuestions = questionResults.length - successfulQuestions

        // Log completion
        console.log(`Interview sheet uploaded: ${savedSheet._id}`)
        console.log(`Questions added: ${successfulQuestions}/${questionResults.length}`)
        if (failedQuestions > 0) {
            console.warn(`Failed to add ${failedQuestions} questions`)
        }

        // Clean up session data from The-Boring-Agents (optional)
        try {
            await axios.delete(`${AGENTS_API_BASE}/interview/session/${sessionId}`)
        } catch (cleanupError) {
            console.warn('Failed to cleanup session:', cleanupError)
            // Don't fail the upload for cleanup errors
        }

        return res.status(200).json({
            success: true,
            message: 'Interview sheet uploaded successfully',
            data: {
                sheetId: savedSheet._id,
                name: savedSheet.name,
                questionsAdded: successfulQuestions,
                totalQuestions: questionResults.length,
                slug: savedSheet.slug
            }
        })

    } catch (error) {
        console.error('Interview sheet upload error:', error)
        
        // Handle specific axios errors
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found in The-Boring-Agents'
                })
            }
            if (error.response?.status === 400) {
                return res.status(400).json({
                    success: false,
                    message: error.response.data?.message || 'Invalid request to The-Boring-Agents'
                })
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error during upload',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        })
    }
}