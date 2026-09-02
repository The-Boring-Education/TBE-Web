import {
  Button,
  ContentFeedbackWidget,
  FeedbackPopup,
  LinerProgressBar,
  LoadingSpinner,
  PaymentCard,
  QuestionLink,
  ResourceTooltip,
  SEO,
  SheetHeroContainer,
  Text,
} from '@tbe/components';
import { routes } from '@tbe/constants';
import {
  calculateUserPointsForAction,
  useGamificationContext,
  useGamifiedAction,
} from '@tbe/gamification';
import {
  useAnalytics,
  usePaymentAccess,
  useQuestionStarred,
  useUser,
} from '@tbe/hooks';
import type { SheetPageProps } from '@tbe/interface';
import { queryKeys, useMutation, useQueryClient } from '@tbe/query';
import { getSheetPageProps, sendRequest } from '@tbe/utils';
import { List, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';

import InterviewQuestionContent from '@/components/InterviewQuestionContent';
import { InterviewSheetMDXRenderer } from '@/components/InterviewSheetMDXRenderer';

const SheetPage = ({
  sheet: initialSheet,
  meta,
  slug,
  seoMeta,
}: SheetPageProps) => {
  const router = useRouter();
  const [sheet, setSheet] = useState(initialSheet);
  const [isEnrolled, setIsEnrolled] = useState(
    initialSheet?.isEnrolled || false,
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sheetMeta, setSheetMeta] = useState<string>(meta || '');
  const [questions, setQuestions] = useState(initialSheet?.questions || []);
  const firstQuestionId = questions?.[0]?._id?.toString() || '';
  const [currentQuestionId, setCurrentQuestionId] = useState(firstQuestionId);
  const [isQuestionCompleted, setIsQuestionCompleted] = useState(
    questions.find((question) => question._id.toString() === currentQuestionId)
      ?.isCompleted,
  );
  const [isQuestionStarred, setIsQuestionStarred] = useState(
    questions.find((question) => question._id.toString() === currentQuestionId)
      ?.isStarred,
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Calculate total and completed questions for the progress bar
  const totalQuestions = questions.length;
  const completedQuestions = questions.filter(
    (question) => question.isCompleted,
  ).length;

  // Get current question and its resources
  const currentQuestion = useMemo(
    () =>
      questions.find(
        (question) => question._id.toString() === currentQuestionId,
      ),
    [questions, currentQuestionId],
  );
  const questionResources = currentQuestion?.resources;

  useEffect(() => {
    setIsQuestionCompleted(currentQuestion?.isCompleted);
    setIsQuestionStarred(currentQuestion?.isStarred);
    setIsStarred(currentQuestion?.isStarred || false);

    if (currentQuestion) {
      const updatedMeta = `${currentQuestion.question}\n\n${currentQuestion.answer}`;
      setSheetMeta(updatedMeta);
    }

    // Show feedback popup if all questions are completed
    const allCompleted =
      questions.length > 0 && questions.every((q) => q.isCompleted);

    if (allCompleted && !showFeedback) {
      // Trigger sheet completion celebration
      gamifiedAction.triggerGamifiedAction({
        gamificationAction: 'COMPLETE_INTERVIEW_SHEET',
        analytics: {
          action: 'INTERVIEW_SHEET_COMPLETE',
          category: 'Achievement',
          label: 'Interview Sheet Completed',
        },
        celebrationType: 'achievement',
        customMessage: "Interview sheet completed! You're ready!",
        metadata: {
          sheetId: sheet?._id,
          sheetName: sheet?.name,
          totalQuestions: questions.length,
        },
      });
    }

    setShowFeedback(allCompleted);
  }, [currentQuestionId, questions, currentQuestion]);

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const queryClient = useQueryClient();
  const { triggerCelebration, showToast } = useGamificationContext();

  // Universal payment access hook - handles all payment status and locked logic
  const { isLocked, isPurchased } = usePaymentAccess({
    productId: sheet?._id,
    productType: 'INTERVIEW_SHEET',
    isPremium: sheet?.isPremium,
    isEnrolled,
  });

  const { isStarred, toggleStar, setIsStarred } = useQuestionStarred({
    userId: user?.id || '',
    sheetId: sheet?._id?.toString() || '',
    questionId: currentQuestionId || '',
    initialIsStarred:
      questions.find((q) => q._id.toString() === currentQuestionId)
        ?.isStarred || false,
  });

  if (!sheet) return null;

  const handleEnrollSuccess = () => {
    setIsEnrolled(true);
    setSheet((prev) => (prev ? { ...prev, isEnrolled: true } : prev));
    try {
      queryClient.invalidateQueries();
    } catch {
      // ignore
    }
  };

  const handleQuestionClick = (questionMeta: string, questionId: string) => {
    if (!isLocked) {
      setSheetMeta(questionMeta);
      setCurrentQuestionId(questionId);
    }
  };

  const handleShowPayment = () => {
    setShowPayment(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const enrollSheet = async () => {
    setIsLoading(true);
    try {
      await makeRequest({
        method: 'POST',
        url: routes.api.enrollSheet,
        body: {
          userId: user?.id,
          sheetId: sheet._id,
        },
      });

      trackEvent({
        action: 'INTERVIEW_SHEET_ENROLL',
        category: 'InterviewSheet',
        label: 'Interview Sheet Enrolled',
        value: {
          userId: user?.id,
          sheetId: sheet._id,
        },
      });

      await gamifiedAction.triggerGamifiedAction({
        gamificationAction: 'ENROLL_SHEET',
        analytics: {
          action: 'INTERVIEW_SHEET_ENROLL',
          category: 'InterviewSheet',
          label: 'Interview Sheet Enrolled',
        },
        customMessage: 'Interview sheet enrolled! Time to practice!',
        metadata: {
          sheetId: sheet._id,
          sheetName: sheet.name,
        },
      });

      handleEnrollSuccess();
    } catch (err) {
      console.error('Error enrolling in sheet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompletion = async () => {
    // If not enrolled, trigger enrollment
    if (!isEnrolled) {
      if (!user) {
        router.push(routes.login);
        return;
      }
      await enrollSheet();
      return;
    }

    setIsLoading(true);
    try {
      const newCompletionStatus = !isQuestionCompleted;

      const response = await makeRequest({
        method: 'PATCH',
        url: routes.api.markSheetQuestionAsCompleted,
        body: {
          userId: user?.id,
          sheetId: sheet._id,
          questionId: currentQuestionId,
          isCompleted: newCompletionStatus,
        },
      });

      // Only proceed if the API call was successful
      if (response?.status) {
        if (newCompletionStatus) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.gamification.points(user?.id ?? ''),
          });
          const pointsEarned =
            calculateUserPointsForAction('COMPLETE_QUESTION');
          const intensity =
            pointsEarned >= 50 ? 'high' : pointsEarned >= 20 ? 'medium' : 'low';
          triggerCelebration({ type: 'points', intensity });
          showToast({
            type: 'points',
            message: 'Question solved! Great work!',
            points: pointsEarned,
          });
          trackEvent({
            action: 'QUESTION_COMPLETE',
            category: 'Learning',
            label: 'Question Completed',
            value: {
              userId: user?.id,
              sheetId: sheet._id,
              questionId: currentQuestionId,
              sheetName: sheet.name,
            },
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.gamification.points(user?.id ?? ''),
          });
          trackEvent({
            action: 'INTERVIEW_SHEET_PROGRESS',
            category: 'InterviewSheet',
            label: 'Interview Sheet Progress',
            value: {
              userId: user?.id,
              sheetId: sheet._id,
              questionId: currentQuestionId,
            },
          });
        }

        // Update local state (mark question completed)
        const updatedQuestions = questions.map((question) =>
          question._id.toString() === currentQuestionId
            ? { ...question, isCompleted: newCompletionStatus }
            : question,
        );

        setQuestions(updatedQuestions);
        setIsQuestionCompleted(newCompletionStatus);

        // Move to next question if completed
        if (newCompletionStatus) {
          const currentIndex = questions.findIndex(
            (q) => q._id.toString() === currentQuestionId,
          );

          const next =
            questions.slice(currentIndex + 1).find((q) => !q.isCompleted) ||
            questions.find((q) => !q.isCompleted); // Loop to beginning if none left

          if (next) {
            const questionId = next._id.toString();
            setCurrentQuestionId(questionId);
            setSheetMeta(`${next.question}\n\n${next.answer}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      } else {
        // Handle API error - don't update local state
        console.error(
          'Failed to update question completion:',
          response?.message,
        );
      }
    } catch (error) {
      console.error('Error toggling question completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show small loader if data is not ready
  const isDataLoading = !sheet || !questions || questions.length === 0;

  const handleStarToggle = async () => {
    await toggleStar();
    const updatedQuestions = questions.map((question) =>
      question._id.toString() === currentQuestionId
        ? { ...question, isStarred: !isStarred }
        : question,
    );
    setQuestions(updatedQuestions);
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <div className='bg-[#FAFAFA] min-h-screen font-body text-foreground'>
        <SheetHeroContainer
          id={sheet._id ?? ''}
          isEnrolled={isEnrolled}
          isPremium={sheet.isPremium}
          isPurchased={isPurchased}
          name={sheet.name ?? ''}
          backHref={routes.learn}
          onEnrollSuccess={handleEnrollSuccess}
        />

        {isDataLoading && (
          <div className='w-full max-w-[1536px] mx-auto px-4 py-16 text-center'>
            <div className='inline-flex items-center justify-center gap-3 bg-card border border-border px-6 py-4 rounded-xl shadow-xs'>
              <LoadingSpinner height={6} width={6} />
              <Text
                level='p'
                className='text-muted-foreground font-medium text-sm'
              >
                Loading questions...
              </Text>
            </div>
          </div>
        )}

        {!isDataLoading && (
          <div
            id='sheet-content'
            className='w-full max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-6 font-primary'
          >
            {/* Mobile Floating Questions Toggle Button (Left Side) */}
            {!isMobileSidebarOpen && (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label='View Questions'
                className='fixed left-0 top-1/2 -translate-y-1/2 z-30 lg:hidden bg-primary text-white font-medium py-2 pl-2 pr-2.5 rounded-r-full shadow-lg flex items-center gap-1.5 text-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer'
              >
                <List className='w-3.5 h-3.5 text-white' />
                <span className='text-[11px] font-semibold tracking-wide'>
                  Questions ({questions.length})
                </span>
              </button>
            )}

            {/* Mobile Drawer Backdrop */}
            {isMobileSidebarOpen && (
              <div
                className='fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200'
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}

            {/* Mobile Drawer Panel (Solid White Background) */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-[340px] bg-white text-gray-900 border-r border-gray-200 p-4 shadow-2xl flex flex-col gap-3 lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
              <div className='flex items-center justify-between pb-3 border-b border-gray-100 bg-white'>
                <div className='flex items-center gap-2'>
                  <h2 className='font-semibold text-base text-gray-900'>
                    Questions
                  </h2>
                  <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-primary border border-red-200/60'>
                    {questions.length} questions
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className='p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {!isLocked && (
                <div className='pb-2 bg-white'>
                  <LinerProgressBar
                    completedChapters={completedQuestions}
                    totalChapters={totalQuestions}
                  />
                </div>
              )}

              <div className='flex flex-col gap-1.5 flex-1 overflow-y-auto pt-1 pr-1 custom-scrollbar scroll-smooth bg-white'>
                {questions?.map(
                  ({
                    _id,
                    title,
                    question,
                    answer,
                    isCompleted,
                    frequency,
                    isStarred,
                  }) => {
                    const questionId = _id?.toString();

                    return (
                      <QuestionLink
                        key={questionId}
                        currentQuestionId={currentQuestionId}
                        frequency={frequency}
                        handleQuestionClick={() => {
                          handleQuestionClick(
                            `${question}\n\n${answer}`,
                            questionId,
                          );
                          setIsMobileSidebarOpen(false);
                        }}
                        href={router.asPath.split('?')[0]}
                        isCompleted={isCompleted}
                        question={`${question}\n\n${answer}`}
                        questionId={questionId}
                        title={title}
                        isLocked={isLocked}
                        isStarred={isStarred}
                      />
                    );
                  },
                )}
              </div>
            </div>

            <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 items-start'>
              {/* Desktop Left Sidebar (Questions Navigation) */}
              <aside className='hidden lg:flex w-full lg:w-[320px] xl:w-[360px] shrink-0 self-start sticky top-6 max-h-[calc(100vh-3rem)] bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-col gap-3 overflow-hidden'>
                <div className='w-full sticky top-0 bg-card z-10 pb-3 border-b border-border/60 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <h2 className='font-semibold text-base sm:text-lg text-foreground'>
                      Questions
                    </h2>
                    <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
                      {questions.length} questions
                    </span>
                  </div>
                  {!isLocked && (
                    <LinerProgressBar
                      completedChapters={completedQuestions}
                      totalChapters={totalQuestions}
                    />
                  )}
                </div>

                {/* Sidebar Questions List */}
                <div className='flex flex-col gap-1.5 flex-1 overflow-y-auto pt-1 pr-1 custom-scrollbar scroll-smooth'>
                  {questions?.map(
                    ({
                      _id,
                      title,
                      question,
                      answer,
                      isCompleted,
                      frequency,
                      isStarred,
                    }) => {
                      const questionId = _id?.toString();

                      return (
                        <QuestionLink
                          key={questionId}
                          currentQuestionId={currentQuestionId}
                          frequency={frequency}
                          handleQuestionClick={() =>
                            handleQuestionClick(
                              `${question}\n\n${answer}`,
                              questionId,
                            )
                          }
                          href={router.asPath.split('?')[0]}
                          isCompleted={isCompleted}
                          question={`${question}\n\n${answer}`}
                          questionId={questionId}
                          title={title}
                          isLocked={isLocked}
                          isStarred={isStarred}
                        />
                      );
                    },
                  )}
                </div>
              </aside>

              {/* Main Content Viewer */}
              <main className='flex-1 w-full bg-transparent lg:bg-card border-none lg:border lg:border-border/70 rounded-none lg:rounded-2xl p-0 sm:p-4 lg:p-10 shadow-none lg:shadow-xs min-h-[500px]'>
                {isLocked ? (
                  <div className='w-full space-y-6'>
                    <div>
                      <h2 className='font-headings font-bold text-2xl text-foreground mb-4'>
                        Interview Sheet Overview
                      </h2>
                      <div className='prose prose-slate max-w-none'>
                        <InterviewSheetMDXRenderer
                          mdxSource={sheet.meta || ''}
                          theme='light'
                        />
                      </div>
                    </div>

                    <div className='rounded-xl border border-border bg-card p-5 shadow-xs space-y-3'>
                      <div className='flex items-center gap-2 text-foreground font-bold text-base font-headings'>
                        <FaLock className='text-primary' />
                        <span>🚀 Premium Interview Sheet</span>
                      </div>
                      <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                        To access all the interview questions and detailed
                        solutions, unlock this sheet or complete the payment.
                      </p>
                      {!showPayment && (
                        <Button
                          text='Unlock All Questions'
                          variant='PRIMARY'
                          className='w-fit px-6 py-2.5 rounded-lg font-semibold shadow-xs mt-2'
                          onClick={handleShowPayment}
                        />
                      )}
                    </div>

                    {showPayment && (
                      <div ref={paymentSectionRef}>
                        <PaymentCard
                          course={sheet}
                          onClose={() => setShowPayment(false)}
                          productType='INTERVIEW_SHEET'
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <InterviewQuestionContent
                    questionTitle={currentQuestion?.title || ''}
                    question={currentQuestion?.question || ''}
                    answer={
                      currentQuestion?.content?.markdownContent ||
                      currentQuestion?.answer ||
                      ''
                    }
                    frequency={currentQuestion?.frequency}
                    priority={currentQuestion?.priority}
                    companyTypes={currentQuestion?.companyTypes}
                    theme='light'
                    isStarred={isStarred}
                    onToggleStar={handleStarToggle}
                    actions={[
                      currentQuestionId && (
                        <Button
                          key='complete'
                          className={`w-auto self-start py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-xs transition-all duration-150 cursor-pointer ${!isEnrolled
                            ? 'bg-primary hover:bg-primary/90 border-none text-white'
                            : isQuestionCompleted
                              ? 'bg-emerald-600 hover:bg-emerald-700 border-none text-white'
                              : 'bg-primary hover:bg-primary/90 border-none text-white'
                            }`}
                          isLoading={isLoading}
                          text={
                            isLoading
                              ? 'Marking...'
                              : !isEnrolled
                                ? 'Enroll to Mark Complete'
                                : isQuestionCompleted
                                  ? 'Completed'
                                  : 'Mark As Completed'
                          }
                          variant={
                            isQuestionCompleted
                              ? 'SUCCESS'
                              : !isEnrolled
                                ? 'PRIMARY'
                                : isLoading
                                  ? 'SECONDARY'
                                  : 'PRIMARY'
                          }
                          onClick={toggleCompletion}
                        />
                      ),
                      currentQuestionId && questionResources && (
                        <ResourceTooltip
                          key='resources'
                          resources={questionResources}
                          theme='light'
                          className='mt-2'
                        />
                      ),
                    ]}
                  />
                )}
              </main>
            </div>
          </div>
        )}
      </div>

      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type='INTERVIEW_SHEET' />
      )}

      {/* Content feedback widget (per-question or per-sheet, always-on FAB) */}
      {sheet.isEnrolled && (
        <ContentFeedbackWidget
          contentType='INTERVIEW_SHEET'
          contentId={
            currentQuestionId
              ? `${sheet._id.toString()}:${currentQuestionId}`
              : sheet._id.toString()
          }
          title={currentQuestionId ? 'Rate this question' : 'Rate this sheet'}
          meta={
            currentQuestionId
              ? {
                sheetId: sheet._id.toString(),
                sheetName: sheet.name || '',
                questionId: currentQuestionId,
                questionName:
                  currentQuestion?.title || currentQuestion?.question || '',
              }
              : {
                sheetId: sheet._id.toString(),
                sheetName: sheet.name || '',
              }
          }
          theme='light'
        />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetPage;
