import {
  Button,
  FeedbackPopup,
  FlexContainer,
  Footer,
  LearningQuestionList,
  LoadingSpinner,
  MDXRenderer,
  Navbar,
  PaymentCard,
  Pill,
  ResourceTooltip,
  SEO,
  StarButton,
  Text,
} from '@tbe/components';
import { useGamifiedAction } from '@tbe/components';
import { routes } from '@tbe/constants';
import {
  useAnalytics,
  useApi,
  usePaymentAccess,
  useQuestionStarred,
  useUser,
} from '@tbe/hooks';
import type { SheetPageProps } from '@tbe/interface';
import { getSheetPageProps } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';

const SheetPage = ({ sheet, meta, slug, seoMeta }: SheetPageProps) => {
  const router = useRouter();
  const [sheetMeta, setSheetMeta] = useState<string>(meta || '');
  const [questions, setQuestions] = useState(sheet.questions || []);
  const firstQuestionId = questions?.[0]?._id?.toString() || '';
  const [currentQuestionId, setCurrentQuestionId] = useState(firstQuestionId);
  const [isQuestionCompleted, setIsQuestionCompleted] = useState(
    questions.find((question) => question._id.toString() === currentQuestionId)
      ?.isCompleted
  );
  const [isQuestionStarred, setIsQuestionStarred] = useState(
    questions.find((question) => question._id.toString() === currentQuestionId)
      ?.isStarred
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Calculate total and completed questions for the progress bar
  const totalQuestions = questions.length;
  const completedQuestions = questions.filter(
    (question) => question.isCompleted
  ).length;

  const { makeRequest } = useApi(`interview-prep/${slug}`);
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

  // Universal payment access hook - handles all payment status and locked logic
  const { isLocked, isPurchased } = usePaymentAccess({
    productId: sheet?._id,
    productType: 'INTERVIEW_SHEET',
    isPremium: sheet?.isPremium,
    isEnrolled: sheet?.isEnrolled,
  });

  const {
    isStarred,
    isLoading: isStarLoading,
    toggleStar,
    setIsStarred,
  } = useQuestionStarred({
    userId: user?.id || '',
    sheetId: sheet._id?.toString() || '',
    questionId: currentQuestionId || '',
    initialIsStarred:
      questions.find((q) => q._id.toString() === currentQuestionId)
        ?.isStarred || false,
  });

  // Get current question and its resources
  const currentQuestion = useMemo(
    () => questions.find((question) => question._id.toString() === currentQuestionId),
    [questions, currentQuestionId]
  );

  const questionResources = useMemo(() => {
    if (!currentQuestion?.resources) return undefined;

    // Handle new array format
    if (Array.isArray(currentQuestion.resources)) {
      const res: any = {};
      currentQuestion.resources.forEach((r: any) => {
        // Type might be lowercase or capitalized, handle both
        const type = r.type?.toLowerCase();
        if (type === 'youtube') res.youtubeURL = r.url;
        else if (type === 'leetcode') res.leetcodeURL = r.url;
        else if (type === 'blog' || type === 'article') res.blogURL = r.url;
      });
      return res;
    }
    // Handle legacy object format
    return currentQuestion.resources;
  }, [currentQuestion]);

  useEffect(() => {
    setIsQuestionCompleted(currentQuestion?.isCompleted);
    setIsQuestionStarred(currentQuestion?.isStarred);
    setIsStarred(currentQuestion?.isStarred || false);

    if (currentQuestion) {
      let updatedMeta = `${currentQuestion.question}\n\n${currentQuestion.answer}`;
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
          sheetId: sheet._id,
          sheetName: sheet.name,
          totalQuestions: questions.length,
        },
      });
    }

    setShowFeedback(allCompleted);
  }, [currentQuestionId, questions, gamifiedAction, setIsStarred, currentQuestion]);

  if (!sheet) return null;

  const handleQuestionClick = (questionMeta: string, questionId: string) => {
    if (!isLocked) {
      // Find the question to get its full content
      const selectedQuestion = questions.find(q => q._id.toString() === questionId);
      if (selectedQuestion) {
        let updatedMeta = `${selectedQuestion.question}\n\n${selectedQuestion.answer}`;
        setSheetMeta(updatedMeta);
      } else {
        setSheetMeta(questionMeta);
      }
      setCurrentQuestionId(questionId);
    }
  };

  const handleShowPayment = () => {
    setShowPayment(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleCompletion = async () => {
    // Don't allow completion if user is not enrolled
    if (!sheet.isEnrolled) {
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
        // Fire gamified action on completion
        if (newCompletionStatus) {
          await gamifiedAction.triggerGamifiedAction({
            gamificationAction: 'COMPLETE_QUESTION',
            analytics: {
              action: 'QUESTION_COMPLETE',
              category: 'Learning',
              label: 'Question Completed',
            },
            customMessage: 'Question solved! Great work!',
            metadata: {
              sheetId: sheet._id,
              questionId: currentQuestionId,
              sheetName: sheet.name,
            },
          });
        } else {
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
            : question
        );

        setQuestions(updatedQuestions);
        setIsQuestionCompleted(newCompletionStatus);

        // Move to next question if completed
        if (newCompletionStatus) {
          const currentIndex = questions.findIndex(
            (q) => q._id.toString() === currentQuestionId
          );

          const next =
            questions.slice(currentIndex + 1).find((q) => !q.isCompleted) ||
            questions.find((q) => !q.isCompleted); // Loop to beginning if none left

          if (next) {
            const questionId = next._id.toString();
            setCurrentQuestionId(questionId);
            // Updating meta logic duplicated here for immediate transition
            let updatedMeta = `${next.question}\n\n${next.answer}`;
            setSheetMeta(updatedMeta);
          }
        }
      } else {
        // Handle API error - don't update local state
        console.error('Failed to update question completion:', response?.message);
      }
    } catch (error) {
      console.error('Error toggling question completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show small loader if data is not ready
  const isDataLoading = !sheet || !questions || questions.length === 0;

  const questionsSidebar = (
    <LearningQuestionList
      questions={questions ?? []}
      currentQuestionId={currentQuestionId}
      isLocked={isLocked}
      href={router.asPath.split('?')[0]}
      onQuestionSelect={handleQuestionClick}
      theme='dark'
    />
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Navbar
        variant="learning"
        theme="dark"
        showFullNavigation={false}
        showBackButton={true}
        backButtonHref={routes.oncampus.interviewPrep}
        totalChapters={totalQuestions}
        completedChapters={completedQuestions}
        sidebarTitle="Questions"
        sidebarContent={questionsSidebar}
        dashboardRoute="/dashboard"
      />

      {isDataLoading && (
        <div className='min-h-screen bg-[#0A0A0A] flex items-center justify-center py-8 pt-12'>
          <LoadingSpinner height={8} width={8} />
          <Text level='p' className='ml-3 text-contentDark'>Loading interview questions...</Text>
        </div>
      )}

      {!isDataLoading && (
        <div className='min-h-screen bg-[#0A0A0A] p-4 pt-12 flex items-start'>
          <FlexContainer className='w-full max-w-[1600px] mx-auto gap-4' itemCenter={false}>
            <FlexContainer
              className='md:w-8/12 w-full bg-[#0A0A0A]'
              itemCenter={false}
              justifyCenter={false}
            >
              {isLocked ? (
                <div className='w-full'>
                  <Text level='h2' className='heading-4 mb-4 text-contentDark'>
                    Interview Sheet Overview
                  </Text>
                  <MDXRenderer theme='dark' mdxSource={sheet.meta || ''} />
                  <div className='mt-6 w-full rounded bg-yellow-100 p-4 border border-yellow-300 shadow-sm'>
                    <Text level='h4' className='mb-2 flex items-center gap-2'>
                      <FaLock className='text-yellow-600' />
                      🚀 This is a Premium Interview Sheet
                    </Text>
                    <Text level='p' className='mb-4'>
                      To access all the interview questions and detailed
                      solutions, please complete the payment. Once payment is
                      confirmed, all questions will be unlocked instantly.
                    </Text>
                    {!showPayment && (
                      <Button
                        text='Pay Now to Unlock'
                        variant='PRIMARY'
                        className='w-fit'
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
                <div className="w-full">
                  {/* Metadata Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentQuestion?.frequency && (
                      <Pill text={currentQuestion.frequency} variant="PRIMARY" containerClasses="!bg-primary/20" textStyleClasses="!text-primary-light" />
                    )}
                    {currentQuestion?.priority && (
                      <Pill text={`Priority: ${currentQuestion.priority}`} variant="SECONDARY" containerClasses="!bg-secondary/20" textStyleClasses="!text-secondary-light" />
                    )}
                    {currentQuestion?.companyTypes?.map((ct) => (
                      <Pill key={ct} text={ct} variant="GHOST" containerClasses="!bg-gray-800 border border-gray-700" textStyleClasses="!text-gray-300" />
                    ))}
                  </div>

                  <MDXRenderer
                    theme='dark'
                    actions={[
                      currentQuestionId && (
                        <Button
                          key='complete'
                          className='w-fit mt-2'
                          isLoading={isLoading}
                          disabled={!sheet.isEnrolled}
                          text={
                            isLoading
                              ? 'Marking...'
                              : !sheet.isEnrolled
                                ? 'Enroll to Mark Complete'
                                : isQuestionCompleted
                                  ? 'Completed'
                                  : 'Mark As Completed'
                          }
                          variant={
                            isQuestionCompleted
                              ? 'SUCCESS'
                              : !sheet.isEnrolled
                                ? 'SECONDARY'
                                : isLoading
                                  ? 'SECONDARY'
                                  : 'PRIMARY'
                          }
                          onClick={toggleCompletion}
                        />
                      ),
                      currentQuestionId && (
                        <StarButton
                          key='star'
                          isStarred={isStarred}
                          onToggle={toggleStar}
                          isLoading={isStarLoading}
                          className='mt-2 ml-2'
                        />
                      ),
                      currentQuestionId && questionResources && (
                        <ResourceTooltip
                          key='resources'
                          resources={questionResources}
                          theme='dark'
                          className='mt-2 ml-2'
                        />
                      ),
                    ]}
                    mdxSource={sheetMeta}
                  />
                </div>
              )}
            </FlexContainer>
          </FlexContainer>
        </div>
      )}

      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type='INTERVIEW_SHEET' />
      )}
      <Footer variant="oncampus" isMini />
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetPage;

