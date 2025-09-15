'use client'

import { useEffect, useRef, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { quizApi } from "@/services/api"
import { Question } from "@/types/quiz"
import { ArrowLeft, Trophy, Clock, Target } from "lucide-react"
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { trackEvent } from "@/lib/analytics"

interface QuizQuestion {
    _id?: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    detailedExplanation?: string
    difficulty?: string
}


function ResultsContent() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()

    const id = params.id as string
    const answersParam = searchParams.get('answers')
    const timeTakenParam = searchParams.get('timeTaken')

    const answers: (number | null)[] = useMemo(() => 
        answersParam ? JSON.parse(answersParam) : [], [answersParam])
    const timeTaken = timeTakenParam ? parseInt(timeTakenParam) : 0

    // Fetch quiz data to get questions for results
    const {
        data: quizData,
        isLoading,
        error
    } = useQuery({
        queryKey: ["quiz", id],
        queryFn: () => quizApi.getQuestions(id!),
        enabled: !!id,
        staleTime: 0, // Always fetch fresh data
        gcTime: 0  // Don't cache the data
    })

    const questions: Question[] =
        quizData?.data?.questions?.map((q: QuizQuestion) => ({
            id: q._id || Math.random(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            detailedExplanation: q.detailedExplanation || q.explanation,
            category: quizData?.data?.categoryName || "",
            difficulty: q.difficulty || "medium"
        })) || []

    // Analytics: results view
    useEffect(() => {
        try {
            trackEvent("quiz_results_view", {
                category: "quiz",
                quizId: id,
                timeTaken,
                answeredCount: answers.filter((a) => a !== null).length
            })
        } catch {}
    }, [id, timeTaken, answers])

    // Calculate score
    const score = answers.reduce((acc: number, answer, index) => {
        return acc + (answer === questions[index]?.correctAnswer ? 1 : 0)
    }, 0)

    const totalQuestions = questions.length
    const percentage =
        totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0

    // Submit results to TBE webapp API
    const hasSubmittedRef = useRef(false)
    
    useEffect(() => {
        const submitResults = async () => {
            if (
                hasSubmittedRef.current ||
                !user?.id ||
                !id ||
                answers.length === 0
            )
                return
    
            hasSubmittedRef.current = true
    
            try {
                const answersArray = answers.map((answer) => answer ?? -1)

                // Ensure user has a valid ID before submitting
                if (!user.id) {
                    alert('User authentication error. Please try logging in again.')
                    router.push('/login')
                    return
                }

                await quizApi.submitAttempt(id, {
                    userId: user.id,
                    answers: answersArray,
                    timeTaken
                })
            } catch (error) {
                hasSubmittedRef.current = false // allow retry if needed
            }
        }
    
        submitResults()
    }, [user?.id, id, answers, timeTaken, router])

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-2xl font-semibold'>Loading results...</div>
            </div>
        )
    }

    if (error || questions.length === 0) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-2xl font-semibold text-red-600'>
                    Failed to load results. Please try again.
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <header className='bg-white shadow-sm border-b'>
                <div className='max-w-4xl mx-auto px-4 py-4'>
                    <div className='flex items-center justify-between'>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className='flex items-center space-x-2 text-gray-600 hover:text-gray-900'>
                            <ArrowLeft className='w-5 h-5' />
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Results Content */}
            <div className='max-w-4xl mx-auto px-4 py-8'>
                {/* Score Summary */}
                <div className='bg-white rounded-lg shadow-lg p-8 mb-8'>
                    <div className='text-center mb-8'>
                        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
                            Quiz Complete!
                        </h1>
                        <p className='text-lg text-gray-600'>
                            Great job completing the quiz
                        </p>
                    </div>

                    {/* Score Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        <div className='text-center p-6 bg-blue-50 rounded-lg'>
                            <div className='flex items-center justify-center mb-4'>
                                <Trophy className='w-8 h-8 text-blue-600' />
                            </div>
                            <div className='text-3xl font-bold text-blue-600 mb-2'>
                                {percentage}%
                            </div>
                            <div className='text-sm text-gray-600'>Score</div>
                        </div>

                        <div className='text-center p-6 bg-green-50 rounded-lg'>
                            <div className='flex items-center justify-center mb-4'>
                                <Target className='w-8 h-8 text-green-600' />
                            </div>
                            <div className='text-3xl font-bold text-green-600 mb-2'>
                                {score}/{totalQuestions}
                            </div>
                            <div className='text-sm text-gray-600'>
                                Correct Answers
                            </div>
                        </div>

                        <div className='text-center p-6 bg-purple-50 rounded-lg'>
                            <div className='flex items-center justify-center mb-4'>
                                <Clock className='w-8 h-8 text-purple-600' />
                            </div>
                            <div className='text-3xl font-bold text-purple-600 mb-2'>
                                {Math.floor(timeTaken / 60)}:
                                {String(timeTaken % 60).padStart(2, "0")}
                            </div>
                            <div className='text-sm text-gray-600'>
                                Time Taken
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-4'>
                        <button
                            onClick={() => router.push(`/quiz/${id}`)}
                            className='flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors'>
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className='flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors'>
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className='bg-white rounded-lg shadow-lg p-8'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                        Question Review
                    </h2>

                    <div className='space-y-6'>
                        {questions.map((question, index) => {
                            const userAnswer = answers[index]
                            const isCorrect =
                                userAnswer === question.correctAnswer

                            return (
                                <div
                                    key={question.id}
                                    className={`border-2 rounded-lg p-6 ${
                                        isCorrect
                                            ? "border-green-200 bg-green-50"
                                            : "border-red-200 bg-red-50"
                                    }`}>
                                    <div className='flex items-start justify-between mb-4'>
                                        <h3 className='text-lg font-semibold text-gray-900'>
                                            Question {index + 1}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                isCorrect
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                            {isCorrect
                                                ? "Correct"
                                                : "Incorrect"}
                                        </span>
                                    </div>

                                    <div className='mb-4'>
                                        <MarkdownRenderer
                                            content={question.question}
                                            className='text-gray-900'
                                        />
                                    </div>

                                    <div className='space-y-2 mb-4'>
                                        {question.options.map(
                                            (option, optionIndex) => (
                                                <div
                                                    key={optionIndex}
                                                    className={`p-3 rounded-lg border-2 ${
                                                        optionIndex ===
                                                        question.correctAnswer
                                                            ? "border-green-500 bg-green-100"
                                                            : optionIndex ===
                                                                  userAnswer &&
                                                              !isCorrect
                                                            ? "border-red-500 bg-red-100"
                                                            : "border-gray-200 bg-white"
                                                    }`}>
                                                    <div className='flex items-start'>
                                                        <span className='font-semibold mr-2 mt-1 flex-shrink-0'>
                                                            {String.fromCharCode(
                                                                65 + optionIndex
                                                            )}
                                                            .
                                                        </span>
                                                        <div className='flex-1'>
                                                            <MarkdownRenderer
                                                                content={option}
                                                                className='text-left'
                                                            />
                                                        </div>
                                                    </div>
                                                    {optionIndex ===
                                                        question.correctAnswer && (
                                                        <span className='ml-2 text-green-700 font-semibold'>
                                                            ✓ Correct Answer
                                                        </span>
                                                    )}
                                                    {optionIndex ===
                                                        userAnswer &&
                                                        !isCorrect && (
                                                            <span className='ml-2 text-red-700 font-semibold'>
                                                                ✗ Your Answer
                                                            </span>
                                                        )}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className='bg-white rounded-lg p-4 border border-gray-200'>
                                        <h4 className='font-semibold text-gray-900 mb-2'>
                                            Explanation:
                                        </h4>
                                        <MarkdownRenderer
                                            content={question.explanation}
                                            className='text-gray-700'
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Results() {
    return (
        <ProtectedRoute>
            <ResultsContent />
        </ProtectedRoute>
    )
}