import { ProtectedRoute, useAuth } from '@tbe/auth';
import { LoadingSpinner } from '@tbe/components';
import { CodeRenderer } from '@tbe/components/quizes';
import { quizApi } from '@tbe/services';
import type { QuizQuestion } from '@tbe/types';
import { cleanOptionText } from '@tbe/utils';
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

interface QuizCategory {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
  questions: QuizQuestion[];
}

const DEFAULT_FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    _id: 'q-1',
    question: 'What is the primary role of the Event Loop in Node.js?',
    options: [
      'To execute CPU-intensive tasks on multiple worker threads',
      'To handle asynchronous non-blocking I/O callbacks on a single thread',
      'To compile JavaScript source code directly into machine binaries',
      'To manage database transactions and connection pools',
    ],
    correctAnswer: 1,
    explanation:
      'The Event Loop allows Node.js to perform non-blocking I/O operations by offloading tasks to the system kernel whenever possible, while processing callbacks on a single thread.',
  },
  {
    _id: 'q-2',
    question:
      'Which Node.js core module provides utilities for working with file and directory paths cross-platform?',
    options: ['fs', 'url', 'path', 'os'],
    correctAnswer: 2,
    explanation:
      'The `path` module provides utilities for handling file and directory paths across different operating systems (Windows vs POSIX).',
  },
  {
    _id: 'q-3',
    question: 'In JavaScript and Node.js, what is the output of `typeof null`?',
    options: ['"null"', '"undefined"', '"object"', '"number"'],
    correctAnswer: 2,
    explanation:
      'In JavaScript, `typeof null === "object"` is a legacy specification behavior where values had a type tag in the lower bits.',
  },
  {
    _id: 'q-4',
    question:
      'Which built-in middleware is used in Express.js to parse incoming requests with JSON payloads?',
    options: [
      'express.bodyParser()',
      'express.json()',
      'express.urlencoded()',
      'express.static()',
    ],
    correctAnswer: 1,
    explanation:
      '`express.json()` is a built-in middleware function in Express based on body-parser to parse JSON request bodies.',
  },
  {
    _id: 'q-5',
    question: 'What does `process.nextTick()` do in the Node.js event loop?',
    options: [
      'Schedules a callback to be invoked in the next event loop iteration after I/O',
      'Defers execution until all pending timer callbacks are processed',
      'Fires immediately after the current operation completes, before the event loop continues',
      'Spawns a child process in a background thread pool',
    ],
    correctAnswer: 2,
    explanation:
      '`process.nextTick()` adds the callback to the next tick queue, which is processed immediately after the current operation finishes, before moving on in the event loop.',
  },
];

const ScoreEmoji = (score: number, total: number): string => {
  const pct = total > 0 ? (score / total) * 100 : 0;
  if (pct === 100) return '🏆';
  if (pct >= 80) return '🎉';
  if (pct >= 60) return '👍';
  if (pct >= 40) return '📚';
  return '💪';
};

const getScoreLabel = (pct: number): string => {
  if (pct === 100) return 'Perfect Score!';
  if (pct >= 80) return 'Excellent!';
  if (pct >= 60) return 'Good Job!';
  if (pct >= 40) return 'Keep Practicing!';
  return 'Keep Going!';
};

const getScoreColor = (pct: number): string => {
  if (pct >= 80) return 'text-emerald-600';
  if (pct >= 60) return 'text-amber-600';
  if (pct >= 40) return 'text-orange-600';
  return 'text-red-600';
};

const isMongoObjectId = (val?: string): boolean => {
  if (!val) return false;
  return /^[a-fA-F0-9]{24}$/.test(val);
};

const QuizContent = () => {
  const router = useRouter();
  const { user } = useAuth();
  const quizId = router.query.id as string;

  const [quiz, setQuiz] = useState<QuizCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<{
    [key: number]: number;
  }>({});
  const [gameState, setGameState] = useState<
    'loading' | 'playing' | 'completed' | 'submitting'
  >('loading');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  const selectedAnswersRef = useRef<{ [key: number]: number }>({});
  const questionTimesRef = useRef<{ [key: number]: number }>({});

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    questionTimesRef.current = questionTimes;
  }, [questionTimes]);

  const resolveGoogleIdToMongoId = async (
    googleId: string,
    email: string,
    sessionData?: any,
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `/api/proxy/user?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (data?.success && data?.data?._id && isMongoObjectId(data.data._id)) {
        return data.data._id;
      }

      const createResponse = await fetch(`/api/proxy/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sessionData?.user?.name || 'User',
          email,
          googleId,
          image: sessionData?.user?.image || '',
        }),
      });

      const createData = await createResponse.json();

      if (
        createData?.success &&
        createData?.data?._id &&
        isMongoObjectId(createData.data._id)
      ) {
        return createData.data._id;
      }

      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const resolveUserId = async () => {
      if (user?.id && isMongoObjectId(user.id)) {
        setResolvedUserId(user.id);
        return;
      }

      const effectiveId = user?.id || (user as any)?._id;
      if (effectiveId && isMongoObjectId(effectiveId)) {
        setResolvedUserId(effectiveId);
        return;
      }

      if (user?.id && user?.email && !isMongoObjectId(user.id)) {
        const mongoId = await resolveGoogleIdToMongoId(user.id, user.email);
        if (mongoId) {
          setResolvedUserId(mongoId);
        }
      }
    };

    if (user) {
      resolveUserId();
    }
  }, [user]);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return;

      try {
        setGameState('loading');
        let questions: QuizQuestion[] = [];
        let categoryName = 'Technical Assessment';
        let categoryDescription = '';
        let categoryIcon = '💡';

        try {
          const response = await quizApi.getQuestions(quizId);
          if (response?.success && response?.data) {
            questions = response.data.questions || [];
            categoryName = response.data.categoryName || categoryName;
            categoryDescription =
              response.data.categoryDescription || categoryDescription;
            categoryIcon = response.data.categoryIcon || categoryIcon;
          }
        } catch {
          // Fallback to sample questions
        }

        if (questions.length === 0) {
          questions = DEFAULT_FALLBACK_QUESTIONS;
          categoryName = quizId
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        }

        setQuiz({
          _id: quizId,
          categoryName,
          categoryDescription,
          categoryIcon,
          questions,
        });
        setGameState('playing');
        setQuestionStartTime(Date.now());
      } catch (error) {
        console.error('Failed to load quiz questions:', error);
        router.push('/quizzes/dashboard');
      }
    };

    loadQuiz();
  }, [quizId, router]);

  const submitQuizWithUserId = async (
    userId: string,
    answersSnapshot?: { [key: number]: number },
    timesSnapshot?: { [key: number]: number },
  ) => {
    if (!quiz) return;
    const currentAnswers = answersSnapshot ?? selectedAnswersRef.current;
    const currentTimes = timesSnapshot ?? questionTimesRef.current;

    try {
      const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      const answers = quiz.questions.map((question, index) => {
        const selected = currentAnswers[index] ?? -1;
        const isCorrect = selected === question.correctAnswer;
        const timeSpent = currentTimes[index] || 0;

        return {
          questionIndex: index,
          selectedAnswer: selected,
          isCorrect,
          timeSpent,
        };
      });

      const submission = {
        userId,
        answers,
        totalTimeSpent,
      };

      await quizApi.submitQuiz(quizId, submission);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const completeQuiz = async (
    answersSnapshot?: { [key: number]: number },
    timesSnapshot?: { [key: number]: number },
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const effectiveUserId = user?.id || (user as any)?._id || resolvedUserId;

    if (effectiveUserId) {
      await submitQuizWithUserId(
        effectiveUserId,
        answersSnapshot,
        timesSnapshot,
      );
    } else {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        if (sessionData?.user?.id) {
          await submitQuizWithUserId(
            sessionData.user.id,
            answersSnapshot,
            timesSnapshot,
          );
        }
      } catch {
        // Ignore background session resolution errors
      }
    }
    setIsSubmitting(false);
  };

  const handleSelect = (idx: number) => {
    if (answerState !== 'idle' || !quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = idx === currentQuestion.correctAnswer;
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    setShowAnswer(true);

    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestionIndex]: idx,
    };
    setSelectedAnswers(updatedAnswers);
    selectedAnswersRef.current = updatedAnswers;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const updatedTimes = {
      ...questionTimes,
      [currentQuestionIndex]: timeSpent,
    };
    setQuestionTimes(updatedTimes);
    questionTimesRef.current = updatedTimes;

    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    const total = quiz.questions.length;
    if (currentQuestionIndex + 1 >= total) {
      setFinished(true);
      void completeQuiz(selectedAnswers, questionTimes);
    } else {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setQuestionStartTime(Date.now());
      const existingAnswer = selectedAnswers[nextIndex];
      const nextQ = quiz.questions[nextIndex];
      if (existingAnswer !== undefined && nextQ) {
        setAnswerState(
          existingAnswer === nextQ.correctAnswer ? 'correct' : 'wrong',
        );
        setShowAnswer(true);
      } else {
        setAnswerState('idle');
        setShowAnswer(false);
      }
    }
  };

  const handlePrev = () => {
    if (!quiz || currentQuestionIndex === 0) return;
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    const prevAnswer = selectedAnswers[prevIndex];
    const prevQ = quiz.questions[prevIndex];
    if (prevAnswer !== undefined && prevQ) {
      setAnswerState(prevAnswer === prevQ.correctAnswer ? 'correct' : 'wrong');
      setShowAnswer(true);
    } else {
      setAnswerState('idle');
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuestionTimes({});
    setScore(0);
    setAnswerState('idle');
    setShowAnswer(false);
    setFinished(false);
    setGameState('playing');
    setQuestionStartTime(Date.now());
  };

  if (gameState === 'loading' || !quiz) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-6'>
        <LoadingSpinner label='Preparing your quiz questions...' />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const total = quiz.questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const currentSelectedAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <div className='min-h-screen bg-gray-50/70 pt-2 sm:pt-4 pb-8 px-0 sm:px-4 md:px-6 flex flex-col items-center justify-start relative overflow-hidden'>
      {/* Subtle Ambient Glow */}
      <div
        aria-hidden
        className='pointer-events-none absolute top-[-5%] right-[-5%] h-[280px] w-[280px] rounded-full blur-[140px]'
        style={{ background: 'rgba(239,68,68,0.05)' }}
      />

      {/* Top Back Link (Matching Screenshot) */}
      <div className='w-full max-w-3xl mb-1.5 sm:mb-2 px-3 sm:px-0 flex items-center justify-between z-10'>
        <button
          type='button'
          onClick={() => router.push('/quizzes/dashboard')}
          className='inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group'
        >
          <span>←</span>
          <span className='group-hover:underline'>Back to quizzes</span>
        </button>
      </div>

      {/* Main Quiz Modal Container (Slim & Compact matching reference design) */}
      <div className='relative w-full max-w-3xl mx-auto rounded-none sm:rounded-2xl border-0 sm:border border-gray-200/90 bg-white shadow-none sm:shadow-sm overflow-hidden flex flex-col z-10'>
        {/* Header */}
        <div className='flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3 border-b border-gray-150 bg-white'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-red-50 text-[#EF4444] border border-red-100 shadow-2xs shrink-0'>
              <Brain className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-gray-900 leading-tight'>
                {quiz.categoryName}
              </p>
              <p className='text-[10px] sm:text-[11px] text-gray-400 font-medium'>
                Showing {total} Questions
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={() => router.push('/quizzes/dashboard')}
            className='flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer'
            aria-label='Close quiz'
          >
            <X className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
          </button>
        </div>

        {/* Progress Section */}
        {!finished && (
          <div className='px-3.5 pt-2 pb-1 sm:px-5 sm:pt-2.5 sm:pb-1.5'>
            <div className='flex items-center justify-between mb-1 sm:mb-1.5'>
              <span className='text-[10px] sm:text-[11px] font-semibold text-gray-500'>
                Question {currentQuestionIndex + 1} of {total}
              </span>
              <span className='text-[10px] sm:text-[11px] font-bold text-[#EF4444]'>
                {score} correct
              </span>
            </div>

            {/* Segmented Progress Indicators */}
            <div className='flex items-center gap-1 w-full'>
              {quiz.questions.map((q, i) => {
                const ans = selectedAnswers[i];
                let color = 'bg-gray-200';
                if (ans !== undefined) {
                  color =
                    ans === q.correctAnswer ? 'bg-emerald-500' : 'bg-red-500';
                } else if (i === currentQuestionIndex) {
                  color = 'bg-[#EF4444]';
                }
                return (
                  <div
                    key={i}
                    className={`h-1 rounded-full flex-1 transition-all duration-300 ${color}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className='px-3.5 py-3 sm:px-5 sm:py-3.5 flex-1'>
          {!finished && currentQuestion ? (
            <div>
              {/* Question Statement */}
              <div className='mb-3 sm:mb-3.5'>
                <div className='flex items-start gap-2.5'>
                  <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-700'>
                    {currentQuestionIndex + 1}
                  </span>
                  <div className='text-xs sm:text-sm font-semibold text-gray-900 leading-snug'>
                    <CodeRenderer content={currentQuestion.question} />
                  </div>
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div className='space-y-1.5 sm:space-y-2'>
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = currentSelectedAnswer === idx;
                  const isCorrect = idx === currentQuestion.correctAnswer;
                  const revealed = showAnswer;

                  let optClass =
                    'w-full flex items-center gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm text-left border transition-all duration-200 cursor-pointer ';

                  if (!revealed) {
                    optClass +=
                      'bg-white border-gray-200/90 text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-2xs';
                  } else if (isCorrect) {
                    optClass +=
                      'bg-emerald-50/90 border-2 border-emerald-500 text-emerald-950 font-medium';
                  } else if (isSelected && !isCorrect) {
                    optClass +=
                      'bg-red-50/90 border-2 border-red-500 text-red-950 font-medium';
                  } else {
                    optClass +=
                      'bg-gray-50/60 border-gray-150 text-gray-400 opacity-60 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={idx}
                      type='button'
                      className={optClass}
                      onClick={() => handleSelect(idx)}
                      disabled={revealed}
                    >
                      <span
                        className={`flex h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full text-[9px] sm:text-[10px] font-semibold transition-all ${
                          revealed && isCorrect
                            ? 'bg-emerald-500 text-white border border-emerald-500'
                            : revealed && isSelected && !isCorrect
                              ? 'bg-red-500 text-white border border-red-500'
                              : 'bg-gray-100 border border-gray-200 text-gray-500'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className='flex-1 font-normal text-gray-800 leading-snug'>
                        <CodeRenderer content={cleanOptionText(opt)} />
                      </span>
                      {revealed && isCorrect && (
                        <CheckCircle2 className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0' />
                      )}
                      {revealed && isSelected && !isCorrect && (
                        <XCircle className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 shrink-0' />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Feedback Banner */}
              {showAnswer && (
                <div
                  className={`mt-2.5 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm border ${
                    answerState === 'correct'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className='flex items-start gap-2'>
                    {answerState === 'correct' ? (
                      <CheckCircle2 className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5' />
                    ) : (
                      <XCircle className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 shrink-0 mt-0.5' />
                    )}
                    <div className='flex-1'>
                      <div className='font-semibold'>
                        {answerState === 'correct'
                          ? 'Correct! Well done.'
                          : `Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
                      </div>
                      {currentQuestion.explanation && (
                        <div className='mt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-200/60 pt-1'>
                          {currentQuestion.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen inside Modal */
            <div className='flex flex-col items-center py-4 text-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 border border-red-100 mb-2.5 text-xl shadow-2xs'>
                {ScoreEmoji(score, total)}
              </div>
              <p className='text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5'>
                Quiz Complete
              </p>
              <h2
                className={`text-lg sm:text-xl font-bold tracking-tight mb-1 ${getScoreColor(
                  pct,
                )}`}
              >
                {getScoreLabel(pct)}
              </h2>
              <p className='text-3xl sm:text-4xl font-black text-gray-900 mb-1'>
                {score}
                <span className='text-lg font-medium text-gray-400'>
                  /{total}
                </span>
              </p>
              <p className='text-xs text-gray-500 mb-4'>{pct}% accuracy</p>

              {/* Score Bar in Primary Red */}
              <div className='w-full max-w-xs mb-4'>
                <div className='h-1.5 w-full rounded-full bg-gray-100 overflow-hidden'>
                  <div
                    className='h-full rounded-full bg-[#EF4444] transition-all duration-500'
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Per-question summary mini dots */}
              <div className='flex flex-wrap gap-1.5 justify-center mb-4 max-w-sm'>
                {quiz.questions.map((q, i) => {
                  const ans = selectedAnswers[i];
                  const correct = ans === q.correctAnswer;
                  return (
                    <div
                      key={i}
                      title={`Q${i + 1}: ${correct ? 'Correct' : 'Wrong'}`}
                      className={`h-2 w-2 rounded-full ${
                        correct ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row items-center gap-2'>
                <button
                  type='button'
                  onClick={handleRestart}
                  className='flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 border border-gray-200 shadow-2xs hover:bg-gray-50 transition-all cursor-pointer'
                >
                  <RotateCcw className='h-3.5 w-3.5' />
                  Retry
                </button>
                <button
                  type='button'
                  onClick={() => router.push('/quizzes/dashboard')}
                  className='flex items-center gap-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer'
                >
                  <Trophy className='h-3.5 w-3.5' />
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        {!finished && (
          <div className='flex items-center justify-between px-3.5 py-2 sm:px-5 sm:py-2.5 border-t border-gray-150 bg-white'>
            <button
              type='button'
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className='flex items-center gap-1 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'
            >
              <ChevronLeft className='h-3.5 w-3.5' />
              Prev
            </button>

            <div className='flex items-center gap-1.5 text-[11px] text-gray-400'>
              <Zap className='h-3 w-3 text-amber-500' />
              <span>
                {currentSelectedAnswer === undefined ? 'Select an answer' : ''}
              </span>
            </div>

            <button
              type='button'
              onClick={handleNext}
              disabled={currentSelectedAnswer === undefined}
              className={`flex items-center gap-1 rounded-lg px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm transition-all ${
                currentSelectedAnswer !== undefined
                  ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold shadow-xs cursor-pointer'
                  : 'bg-gray-50 text-gray-400 font-medium border border-gray-200 opacity-40 cursor-not-allowed'
              }`}
            >
              <span>
                {currentQuestionIndex + 1 === total ? 'Finish' : 'Next'}
              </span>
              <ChevronRight className='h-3.5 w-3.5' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}

// Disable static generation for dynamic quiz IDs
export const getStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps = async () => ({
  props: {},
  revalidate: 1,
});
