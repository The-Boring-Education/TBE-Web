import {
  Button,
  FeedbackPopup,
  FlexContainer,
  LinerProgressBar,
  LoadingSpinner,
  PaymentCard,
  QuestionLink,
  ResourceTooltip,
  Section,
  SEO,
  SheetHeroContainer,
  Text,
} from '@tbe/components';
import { routes } from '@tbe/constants';
import { useGamifiedAction } from '@tbe/gamification';
import {
  useAnalytics,
  usePaymentAccess,
  useQuestionStarred,
  useUser,
} from '@tbe/hooks';
import type { SheetPageProps } from '@tbe/interface';
import { useMutation } from '@tbe/query';
import { getSheetPageProps, sendRequest } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';

import InterviewQuestionContent from '@/components/InterviewQuestionContent';
import { InterviewSheetMDXRenderer } from '@/components/InterviewSheetMDXRenderer';

const SheetPage = ({ sheet, meta, slug, seoMeta }: SheetPageProps) => {
  const router = useRouter();
  const [sheetMeta, setSheetMeta] = useState<string>(meta || '');
  const [questions, setQuestions] = useState(sheet.questions || []);
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
          sheetId: sheet._id,
          sheetName: sheet.name,
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

  // Universal payment access hook - handles all payment status and locked logic
  const { isLocked, isPurchased } = usePaymentAccess({
    productId: sheet?._id,
    productType: 'INTERVIEW_SHEET',
    isPremium: sheet?.isPremium,
    isEnrolled: sheet?.isEnrolled,
  });

  const { isStarred, toggleStar, setIsStarred } = useQuestionStarred({
    userId: user?.id || '',
    sheetId: sheet._id?.toString() || '',
    questionId: currentQuestionId || '',
    initialIsStarred:
      questions.find((q) => q._id.toString() === currentQuestionId)
        ?.isStarred || false,
  });

  if (!sheet) return null;

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
      <Section className='md:p-2 p-2'>
        <SheetHeroContainer
          id={sheet._id ?? ''}
          isEnrolled={sheet.isEnrolled}
          name={sheet.name ?? ''}
          isPremium={sheet.isPremium}
          isPurchased={!!isPurchased} // Ensure boolean
          backHref={routes.interviewPrep}
        />
      </Section>

      {isDataLoading && (
        <Section className='md:p-2 p-2'>
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner height={8} width={8} />
            <Text level='p' className='ml-3 text-gray-600'>
              Loading interview questions...
            </Text>
          </div>
        </Section>
      )}

      {!isDataLoading && (
        <Section className='md:p-2 p-2'>
          <FlexContainer className='w-full gap-4' itemCenter={false}>
            {/* Left Sidebar (Questions) */}
            <FlexContainer
              className='border md:w-3/12 w-full px-2 gap-1 rounded self-baseline max-h-[80vh] overflow-y-auto bg-white'
              itemCenter={false}
            >
              <div className='w-full sticky top-0 bg-inherit py-2'>
                <Text className='heading-5' level='h5'>
                  Questions
                </Text>

                {/* LinerProgressBar */}
                {!isLocked && (
                  <LinerProgressBar
                    completedChapters={completedQuestions}
                    totalChapters={totalQuestions}
                  />
                )}
              </div>

              {/* Sidebar: use button for question navigation, not <Link> */}
              <FlexContainer className='gap-px flex-grow' justifyCenter={false}>
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
                      <div
                        key={questionId}
                        className='flex items-center w-full'
                      >
                        <QuestionLink
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
                      </div>
                    );
                  },
                )}
              </FlexContainer>
            </FlexContainer>

            {/* Main Content Area */}
            <FlexContainer
              className='border md:w-8/12 w-full p-6 rounded bg-white'
              itemCenter={false}
              justifyCenter={false}
            >
              {isLocked ? (
                <div className='w-full'>
                  <Text level='h2' className='heading-4 mb-4'>
                    Interview Sheet Overview
                  </Text>
                  <InterviewSheetMDXRenderer
                    mdxSource={sheet.meta || ''}
                    theme='light'
                  />
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
            </FlexContainer>
          </FlexContainer>
        </Section>
      )}

      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type='INTERVIEW_SHEET' />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetPage;
