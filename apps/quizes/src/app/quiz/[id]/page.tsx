"use client"

import { useAuth } from "@tbe/auth"
import { Card, CardContent, CardHeader } from "@tbe/components/quizes"
import { Progress } from "@tbe/components/quizes"
import { Layout } from "@tbe/components/quizes"
import { ProtectedRoute } from "@tbe/components/quizes"
import { CodeRenderer } from "@tbe/components/quizes"
import { quizApi } from "@tbe/services"
import type { QuizQuestion } from "@tbe/types"
import { useParams, useRouter } from "next/navigation"
import { useCallback,useEffect, useState } from "react"

import useGamifiedAction from "@/hooks/useGamifiedAction"

interface QuizCategory {
    _id: string
    categoryName: string
    categoryDescription: string
    categoryIcon: string
    questions: QuizQuestion[]
}

function QuizContent() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const quizId = params.id as string
    const gamifiedAction = useGamifiedAction()

    const [quiz, setQuiz] = useState<QuizCategory | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<{
        [key: number]: number
    }>({})
    const [questionStartTime, setQuestionStartTime] = useState(Date.now())
    const [questionTimes, setQuestionTimes] = useState<{
        [key: number]: number
    }>({})
    const [gameState, setGameState] = useState<
        "loading" | "playing" | "completed" | "submitting"
    >("loading")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [quizStartTime] = useState(Date.now())
    const [resolvedUserId, setResolvedUserId] = useState<string | null>(null)

    // Helper: Mongo ObjectId check
    const isMongoObjectId = (val?: string): boolean => {
        if (!val) return false
        return /^[a-fA-F0-9]{24}$/.test(val)
    }

    // Helper: Resolve Google ID to MongoDB user ID
    const resolveGoogleIdToMongoId = async (googleId: string, email: string, sessionData?: any): Promise<string | null> => {
        try {
            console.log('🔍 Resolving Google ID to MongoDB ID:', { googleId, email })
            
            // First try to get user by email
            const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
            const response = await fetch(`${base}/user?email=${encodeURIComponent(email)}`)
            const data = await response.json()
            
            console.log('📊 User lookup response:', data)
            
            if (data?.success && data?.data?._id && isMongoObjectId(data.data._id)) {
                console.log('✅ Found MongoDB user ID:', data.data._id)
                return data.data._id
            }
            
            // If not found by email, try to create user or get by Google ID
            console.log('⚠️ User not found by email, trying to create user...')
            const createResponse = await fetch(`${base}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: sessionData?.user?.name || 'User',
                    email: email,
                    googleId: googleId,
                    image: sessionData?.user?.image || ''
                })
            })
            
            const createData = await createResponse.json()
            console.log('📊 User creation response:', createData)
            
            if (createData?.success && createData?.data?._id && isMongoObjectId(createData.data._id)) {
                console.log('✅ Created new user with MongoDB ID:', createData.data._id)
                return createData.data._id
            }
            
            console.error('❌ Failed to resolve or create user')
            return null
        } catch (error) {
            console.error('❌ Error resolving Google ID to MongoDB ID:', error)
            return null
        }
    }

    // Resolve MongoDB userId once
    useEffect(() => {
        const resolveUserId = async () => {
            if (!user?.email && !user?.id) return
            try {
                if (isMongoObjectId(user?.id)) {
                    setResolvedUserId(user!.id)
                    return
                }
                // Fallback: fetch by email to get _id
                const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
                const resp = await fetch(`${base}/user?email=${encodeURIComponent(user!.email!)}`)
                const json = await resp.json()
                const dbId = json?.data?._id
                if (isMongoObjectId(dbId)) {
                    setResolvedUserId(dbId)
                }
            } catch (_e) {
                // ignore
            }
        }

        if (user && !resolvedUserId) {
            void resolveUserId()
        }
    }, [user?.id, user?.email]) // Remove resolvedUserId from dependencies

    const loadQuiz = useCallback(async () => {
        try {
            const response = await quizApi.getQuestions(quizId)

            if (response.success) {
                setQuiz(response.data)
                setGameState("playing")
            } else {
                throw new Error(response.message || "Failed to load quiz")
            }
        } catch (error) {
            alert("Failed to load quiz. Please try again.")
        }
    }, [quizId])

    useEffect(() => {
        loadQuiz()
    }, [quizId, loadQuiz])

    useEffect(() => {
        if (gameState === "playing") {
            setQuestionStartTime(Date.now())
        }
    }, [currentQuestionIndex, gameState])

    const selectAnswer = (answerIndex: number) => {
        // Record time spent on current question
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
        setQuestionTimes((prev) => ({
            ...prev,
            [currentQuestionIndex]: timeSpent
        }))

        // Save the selected answer
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: answerIndex
        }))

        // Auto-navigate to next question or complete quiz
        console.log('➡️ Answer selected, checking if last question...', { 
            currentIndex: currentQuestionIndex, 
            totalQuestions: quiz?.questions.length,
            isLastQuestion: currentQuestionIndex >= (quiz?.questions.length || 0) - 1,
            isSubmitting,
            gameState
        })
        
        if (isSubmitting || gameState === "submitting" || gameState === "completed") {
            console.log('⚠️ Quiz already being submitted or completed, ignoring...')
            return
        }
        
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        } else {
            console.log('🏁 Last question reached, completing quiz...')
            completeQuiz()
        }
    }


    const completeQuiz = async () => {
        // Prevent duplicate submissions
        if (isSubmitting || gameState === "submitting" || gameState === "completed") {
            console.log('⚠️ Quiz already being submitted or completed, ignoring duplicate call')
            return
        }

        console.log('🎯 completeQuiz called!', { quiz: !!quiz, userId: user?.id, resolvedUserId })
        
        // Set submitting state immediately
        setIsSubmitting(true)
        setGameState("submitting")
        
        // Try to get user ID from multiple sources
        const effectiveUserId = user?.id || (user as any)?._id || resolvedUserId
        
        if (!quiz || !effectiveUserId) {
            console.log('❌ Cannot complete quiz - missing data:', { 
                quiz: !!quiz, 
                userId: user?.id, 
                _id: (user as any)?._id,
                resolvedUserId,
                effectiveUserId
            })
            
            // Try to get user data from session directly as fallback
            try {
                const sessionResponse = await fetch('/api/auth/session')
                const sessionData = await sessionResponse.json()
                console.log('🔍 Session data fallback:', sessionData)
                
                if (sessionData?.user?.id) {
                    console.log('✅ Using session user ID as fallback:', sessionData.user.id)
                    // Check if it's already a MongoDB ID or needs resolution
                    if (isMongoObjectId(sessionData.user.id)) {
                        console.log('✅ Session user ID is already MongoDB ID')
                        await submitQuizWithUserId(sessionData.user.id)
                        return
                    } else {
                        console.log('⚠️ Session user ID is Google ID, resolving to MongoDB ID')
                        // Resolve Google ID to MongoDB user ID
                        const mongoUserId = await resolveGoogleIdToMongoId(sessionData.user.id, sessionData.user.email, sessionData)
                        if (mongoUserId) {
                            await submitQuizWithUserId(mongoUserId)
                            return
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Failed to get session data:', error)
            }
            
            // Reset state on error
            setIsSubmitting(false)
            setGameState("playing")
            return
        }
        
        await submitQuizWithUserId(effectiveUserId)
    }

    const submitQuizWithUserId = async (userId: string) => {
        try {
            const totalTimeSpent = Math.floor(
                (Date.now() - quizStartTime) / 1000
            )

            const answers = quiz!.questions.map((question, index) => {
                const selectedAnswer = selectedAnswers[index] ?? -1
                const isCorrect = selectedAnswer === question.correctAnswer
                const timeSpent = questionTimes[index] || 0

                return {
                    questionIndex: index,
                    selectedAnswer,
                    isCorrect,
                    timeSpent
                }
            })

            // Check if userId is a valid Mongo ObjectId
            if (!isMongoObjectId(userId)) {
                console.log('⚠️ User ID is not a Mongo ObjectId, using as-is:', userId)
            }

            const submission = {
                userId: userId,
                answers,
                totalTimeSpent
            }

            console.log('🚀 Submitting quiz with data:', submission)
            const response = await quizApi.submitQuiz(quizId, submission)
            console.log('📊 Quiz submission response:', response)

            // Type guard to check if response has the expected structure
            if (
                response &&
                typeof response === "object" &&
                "success" in response &&
                response.success &&
                "data" in response
            ) {
                // Trigger gamification action for completing quiz
                await gamifiedAction.triggerGamifiedAction({
                    actionType: "COMPLETE_QUIZ",
                    customMessage: "Quiz completed! Great job!",
                    metadata: {
                        quizId,
                        totalTimeSpent,
                        correctAnswers: answers.filter((a) => a.isCorrect)
                            .length,
                        totalQuestions: answers.length
                    }
                })

                // Set completed state
                setGameState("completed")
                setIsSubmitting(false)
                
                // Redirect to results page with answers and time data
                const answersParam = JSON.stringify(answers.map(a => a.selectedAnswer))
                const timeTakenParam = totalTimeSpent.toString()
                console.log('✅ Quiz submitted successfully, redirecting to results...')
                
                // Use replace instead of push to prevent back navigation to quiz
                router.replace(`/results/${quizId}?answers=${encodeURIComponent(answersParam)}&timeTaken=${timeTakenParam}`)
            } else {
                const message =
                    response &&
                    typeof response === "object" &&
                    "message" in response &&
                    typeof response.message === "string"
                        ? response.message
                        : "Failed to submit quiz"
                console.error('❌ Quiz submission failed:', message, response)
                throw new Error(message)
            }
        } catch (error) {
            console.error('❌ Quiz submission error:', error)
            
            // Set completed state even on error
            setGameState("completed")
            setIsSubmitting(false)
            
            // Even if submission fails, redirect to results with local data
            console.log('🔄 Submission failed, redirecting to results with local data...')
            
            // Recreate the answers and time data for fallback redirect
            const fallbackAnswers = quiz!.questions.map((question, index) => {
                const selectedAnswer = selectedAnswers[index] ?? -1
                return { selectedAnswer }
            })
            const fallbackTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000)
            
            const answersParam = JSON.stringify(fallbackAnswers.map(a => a.selectedAnswer))
            const timeTakenParam = fallbackTimeSpent.toString()
            
            // Use replace instead of push
            router.replace(`/results/${quizId}?answers=${encodeURIComponent(answersParam)}&timeTaken=${timeTakenParam}`)
        }
    }


    if (gameState === "loading") {
        return (
            <Layout showNavbar>
                <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto' />
                        <p className='mt-4 text-lg text-gray-600'>
                            Loading quiz...
                        </p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (gameState === "submitting") {
        return (
            <Layout showNavbar>
                <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto' />
                        <p className='mt-4 text-lg text-gray-600'>
                            Submitting quiz...
                        </p>
                        <p className='mt-2 text-sm text-gray-500'>
                            Please wait while we process your results
                        </p>
                    </div>
                </div>
            </Layout>
        )
    }


    if (!quiz || gameState !== "playing") {
        return null
    }

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const selectedAnswer = selectedAnswers[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

    return (
        <Layout showNavbar={gameState !== "playing"}>
            <div className='min-h-screen bg-gray-50'>
                <div className='container mx-auto px-4 py-8'>
                    {/* Quiz Header */}
                    <div className='max-w-4xl mx-auto mb-8'>
                        <div className='text-center mb-6'>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                {quiz.categoryName}
                            </h1>
                            <p className='text-lg text-gray-600'>
                                Question {currentQuestionIndex + 1} of{" "}
                                {quiz.questions.length}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className='mb-8'>
                            <Progress value={progress} className='h-3' />
                            <div className='flex justify-between text-sm text-gray-500 mt-2'>
                                <span>{Math.round(progress)}% Complete</span>
                                <span>{quiz.categoryName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className='max-w-4xl mx-auto'>
                        <Card className='shadow-lg'>
                            <CardHeader className='bg-white'>
                                <div className='text-2xl leading-relaxed text-gray-900'>
                                    <CodeRenderer
                                        content={currentQuestion.question}
                                    />
                                </div>
                            </CardHeader>

                            <CardContent className='bg-white p-8 space-y-6'>
                                {/* Options */}
                                {currentQuestion.options.map(
                                    (option, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectAnswer(index)}
                                            className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                                selectedAnswer === index
                                                    ? "border-indigo-500 bg-indigo-50"
                                                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-25"
                                            }`}>
                                            <div className='flex items-center space-x-4'>
                                                <div
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-medium ${
                                                        selectedAnswer === index
                                                            ? "border-indigo-500 bg-indigo-500 text-white"
                                                            : "border-gray-300 text-gray-500"
                                                    }`}>
                                                    {String.fromCharCode(
                                                        65 + index
                                                    )}
                                                </div>

                                                <div className='flex-1 text-lg'>
                                                    <CodeRenderer
                                                        content={option}
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    )
                                )}


                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default function QuizPage() {
    return (
        <ProtectedRoute>
            <QuizContent />
        </ProtectedRoute>
    )
}
