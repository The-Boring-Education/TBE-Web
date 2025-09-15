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
import { Clock, CheckCircle, XCircle, Trophy } from "lucide-react"
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
    const [showExplanation, setShowExplanation] = useState(false)
    const [quizStartTime] = useState(Date.now())
    const [result, setResult] = useState<any>(null)

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
        if (showExplanation) return

        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: answerIndex
        }))
    }

    const nextQuestion = () => {
        // Record time spent on current question
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
        setQuestionTimes((prev) => ({
            ...prev,
            [currentQuestionIndex]: timeSpent
        }))

        if (showExplanation) {
            setShowExplanation(false)
            if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
                setCurrentQuestionIndex((prev) => prev + 1)
            } else {
                completeQuiz()
            }
        } else {
            setShowExplanation(true)
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
                setResult(response.data)
                setGameState("completed")

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

    const restartQuiz = () => {
        setCurrentQuestionIndex(0)
        setSelectedAnswers({})
        setQuestionTimes({})
        setShowExplanation(false)
        setResult(null)
        loadQuiz()
    }

    if (gameState === "loading") {
        return (
            <Layout>
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

    if (gameState === "completed" && result) {
        return (
            <Layout>
                <div className='min-h-screen bg-gray-50'>
                    <div className='container mx-auto px-4 py-12'>
                        <div className='max-w-2xl mx-auto'>
                            <Card className='shadow-lg'>
                                <CardContent className='p-12 text-center'>
                                    <Trophy className='h-20 w-20 text-yellow-500 mx-auto mb-6' />
                                    <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                                        Quiz Completed!
                                    </h2>
                                    <p className='text-xl text-gray-600 mb-8'>
                                        Great job finishing the quiz
                                    </p>

                                    <div className='grid grid-cols-2 gap-6 mb-8'>
                                        <div className='bg-green-50 p-6 rounded-lg'>
                                            <div className='text-3xl font-bold text-green-600'>
                                                {result.score}%
                                            </div>
                                            <div className='text-gray-600'>
                                                Score
                                            </div>
                                        </div>
                                        <div className='bg-blue-50 p-6 rounded-lg'>
                                            <div className='text-3xl font-bold text-blue-600'>
                                                {result.correctAnswers}/
                                                {result.totalQuestions}
                                            </div>
                                            <div className='text-gray-600'>
                                                Correct
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center justify-center space-x-2 mb-8 text-gray-600'>
                                        <Clock className='h-5 w-5' />
                                        <span className='text-lg'>
                                            {Math.floor(
                                                result.totalTimeSpent / 60
                                            )}
                                            m {result.totalTimeSpent % 60}s
                                        </span>
                                    </div>

                                    <div className='space-y-4'>
                                        <Button
                                            onClick={restartQuiz}
                                            className='w-full bg-indigo-600 hover:bg-indigo-700'
                                            size='lg'>
                                            Take Quiz Again
                                        </Button>

                                        <Button
                                            variant='outline'
                                            onClick={() =>
                                                router.push("/dashboard")
                                            }
                                            className='w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                            size='lg'>
                                            Back to Dashboard
                                        </Button>

                                        <Button
                                            variant='ghost'
                                            onClick={() =>
                                                router.push("/performance")
                                            }
                                            className='w-full text-indigo-600 hover:bg-indigo-50'
                                            size='lg'>
                                            View Performance
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
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
    const hasSelectedAnswer = selectedAnswer !== undefined

    return (
        <Layout>
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
                                                showExplanation
                                                    ? index ===
                                                      currentQuestion.correctAnswer
                                                        ? "border-green-500 bg-green-50"
                                                        : index ===
                                                          selectedAnswer
                                                        ? "border-red-500 bg-red-50"
                                                        : "border-gray-200 bg-gray-50 cursor-not-allowed"
                                                    : selectedAnswer === index
                                                    ? "border-indigo-500 bg-indigo-50"
                                                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-25"
                                            }`}>
                                            <div className='flex items-center space-x-4'>
                                                <div
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-medium ${
                                                        showExplanation
                                                            ? index ===
                                                              currentQuestion.correctAnswer
                                                                ? "border-green-500 bg-green-500 text-white"
                                                                : index ===
                                                                  selectedAnswer
                                                                ? "border-red-500 bg-red-500 text-white"
                                                                : "border-gray-300 text-gray-500"
                                                            : selectedAnswer ===
                                                              index
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

                                                {showExplanation && (
                                                    <div className='ml-auto'>
                                                        {index ===
                                                            currentQuestion.correctAnswer && (
                                                            <CheckCircle className='h-6 w-6 text-green-500' />
                                                        )}
                                                        {index ===
                                                            selectedAnswer &&
                                                            index !==
                                                                currentQuestion.correctAnswer && (
                                                                <XCircle className='h-6 w-6 text-red-500' />
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Explanation */}
                                {showExplanation && (
                                    <div
                                        className={`mt-8 p-6 rounded-lg border-2 ${
                                            selectedAnswer ===
                                            currentQuestion.correctAnswer
                                                ? "border-green-200 bg-green-50"
                                                : "border-red-200 bg-red-50"
                                        }`}>
                                        <div className='flex items-center space-x-3 mb-4'>
                                            {selectedAnswer ===
                                            currentQuestion.correctAnswer ? (
                                                <CheckCircle className='h-6 w-6 text-green-600' />
                                            ) : (
                                                <XCircle className='h-6 w-6 text-red-600' />
                                            )}
                                            <span
                                                className={`font-semibold text-lg ${
                                                    selectedAnswer ===
                                                    currentQuestion.correctAnswer
                                                        ? "text-green-900"
                                                        : "text-red-900"
                                                }`}>
                                                {selectedAnswer ===
                                                currentQuestion.correctAnswer
                                                    ? "Correct!"
                                                    : "Incorrect"}
                                            </span>
                                        </div>

                                        <div className='text-gray-700 text-lg'>
                                            <CodeRenderer
                                                content={
                                                    currentQuestion.explanation
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <div className='flex justify-end pt-6'>
                                    {!showExplanation ? (
                                        <Button
                                            onClick={nextQuestion}
                                            disabled={!hasSelectedAnswer}
                                            className='bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg'
                                            size='lg'>
                                            {hasSelectedAnswer
                                                ? "Submit Answer"
                                                : "Select an answer"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={nextQuestion}
                                            className='bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg'
                                            size='lg'>
                                            {currentQuestionIndex <
                                            quiz.questions.length - 1
                                                ? "Next Question"
                                                : "Finish Quiz"}
                                        </Button>
                                    )}
                                </div>
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
