"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Layout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { CodeRenderer } from "@/components/common/CodeRenderer"
import { useAuth } from "@/contexts/AuthContext"
import { quizApi } from "@/services/api"
import { getValidUserId } from "@/lib/utils"
import { Clock } from "lucide-react"
import useGamifiedAction from "@/hooks/useGamifiedAction"
import { QuizQuestion } from "@/types/api"

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
        "loading" | "playing" | "completed"
    >("loading")
    const [quizStartTime] = useState(Date.now())

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
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        } else {
            completeQuiz()
        }
    }


    const completeQuiz = async () => {
        if (!quiz || !user?.id) {
            return
        }

        try {
            const totalTimeSpent = Math.floor(
                (Date.now() - quizStartTime) / 1000
            )

            const answers = quiz.questions.map((question, index) => {
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

            // Ensure user has a valid ID before submitting
            const validUserId = getValidUserId(user)
            if (!validUserId) {
                alert("User authentication error. Please try logging in again.")
                router.push("/login")
                return
            }

            const submission = {
                userId: validUserId,
                answers,
                totalTimeSpent
            }

            const response = await quizApi.submitQuiz(quizId, submission)

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

                // Redirect to results page with answers and time data
                const answersParam = JSON.stringify(answers.map(a => a.selectedAnswer))
                const timeTakenParam = totalTimeSpent.toString()
                router.push(`/results/${quizId}?answers=${encodeURIComponent(answersParam)}&timeTaken=${timeTakenParam}`)
            } else {
                const message =
                    response &&
                    typeof response === "object" &&
                    "message" in response &&
                    typeof response.message === "string"
                        ? response.message
                        : "Failed to submit quiz"
                throw new Error(message)
            }
        } catch (error) {
            alert("Failed to submit quiz. Please try again.")
        }
    }


    if (gameState === "loading") {
        return (
            <Layout showNavbar={true}>
                <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto'></div>
                        <p className='mt-4 text-lg text-gray-600'>
                            Loading quiz...
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
