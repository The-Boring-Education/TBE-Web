import { Fragment, useEffect, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';

import {
  Button,
  FeedbackPopup,
  FlexContainer,
  LinerProgressBar,
  MDXRenderer,
  PaymentCard,
  QuestionLink,
  Section,
  SEO,
  SheetHeroContainer,
  Text,
} from '@/components';
import { routes } from '@/constant';
import { useAnalytics, useApi, useGamifiedAction, usePaymentStatus, useUser } from '@/hooks';
import type { SheetPageProps } from '@/interfaces';
import { getSheetPageProps } from '@/utils';

const SheetPage = ({
  sheet,
  meta,
  slug,
  seoMeta,
  currentQuestionId,
}: SheetPageProps) => {
  const [sheetMeta, setSheetMeta] = useState<string>(meta || '');
  const [questions, setQuestions] = useState(sheet.questions || []);
  const [isQuestionCompleted, setIsQuestionCompleted] = useState(
    questions.find((question) => question._id.toString() === currentQuestionId)
      ?.isCompleted
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

  useEffect(() => {
    const currentQuestion = questions.find(
      (question) => question._id.toString() === currentQuestionId
    );
    setIsQuestionCompleted(currentQuestion?.isCompleted);

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
        customMessage: 'Interview sheet completed! You\'re ready!',
        metadata: {
          sheetId: sheet._id,
          sheetName: sheet.name,
          totalQuestions: questions.length,
        },
      });
    }
    
    setShowFeedback(allCompleted);
  }, [currentQuestionId, questions]);

  const { makeRequest } = useApi(`interview-prep/${sheet}`);
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: sheet?._id,
    isPremium: sheet?.isPremium,
  });

  const isLocked =
    sheet?.isPremium && !sheet?.isEnrolled && isPurchased === false;

  if (!sheet) return null;

  const handleQuestionClick = (questionMeta: string) => {
    if (!isLocked) {
      setSheetMeta(questionMeta);
    }
  };

  const handleShowPayment = () => {
    setShowPayment(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleCompletion = async () => {
    setIsLoading(true);
    try {
      const newCompletionStatus = !isQuestionCompleted;

      await makeRequest({
        method: 'PATCH',
        url: routes.api.markSheetQuestionAsCompleted,
        body: {
          userId: user?.id,
          sheetId: sheet._id,
          questionId: currentQuestionId,
          isCompleted: newCompletionStatus,
        },
      });

      // Use gamified action for question completion
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

      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question._id.toString() === currentQuestionId
            ? { ...question, isCompleted: newCompletionStatus }
            : question
        )
      );

      if (newCompletionStatus) {
        const currentIndex = questions.findIndex(
          (question) => question._id.toString() === currentQuestionId
        );

        let nextIncompleteQuestion = questions
          .slice(currentIndex + 1)
          .find((question) => !question.isCompleted);

        if (!nextIncompleteQuestion) {
          nextIncompleteQuestion = questions
            .slice(0, currentIndex)
            .find((question) => !question.isCompleted);
        }

        if (nextIncompleteQuestion) {
          const questionId = nextIncompleteQuestion._id.toString();
          window.location.href = `${slug}?sheetId=${sheet._id}&questionId=${questionId}`;
        }
      }

      setIsQuestionCompleted(newCompletionStatus);
    } catch (error) {
      console.error('Error toggling question completion:', error);
    } finally {
      setIsLoading(false);
    }
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
        />
      </Section>
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

            <FlexContainer className='gap-px flex-grow' justifyCenter={false}>
              {questions?.map(
                ({ _id, title, question, answer, isCompleted, frequency }) => {
                  const questionId = _id?.toString();

                  return (
                    <QuestionLink
                      key={questionId}
                      currentQuestionId={currentQuestionId}
                      frequency={frequency}
                      handleQuestionClick={handleQuestionClick}
                      href={`${slug}?sheetId=${sheet._id}&questionId=${questionId}`}
                      isCompleted={isCompleted}
                      question={`${question}\n\n${answer}`}
                      questionId={questionId}
                      title={title}
                      isLocked={isLocked}
                    />
                  );
                }
              )}
            </FlexContainer>
          </FlexContainer>

          {/* Main Content Area */}
          <FlexContainer
            className='border md:w-8/12 w-full p-2 rounded'
            itemCenter={false}
            justifyCenter={false}
          >
            {isLocked ? (
              <div className='w-full'>
                <Text level='h2' className='heading-4 mb-4'>
                  Interview Sheet Overview
                </Text>
                <MDXRenderer mdxSource={sheet.meta || ''} />
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
              <MDXRenderer
                actions={[
                  currentQuestionId && (
                    <Button
                      key='complete'
                      className='w-fit mt-2'
                      isLoading={isLoading}
                      text={
                        isLoading
                          ? 'Marking...'
                          : isQuestionCompleted
                          ? 'Completed'
                          : 'Mark As Completed'
                      }
                      variant={
                        isQuestionCompleted
                          ? 'SUCCESS'
                          : isLoading
                          ? 'SECONDARY'
                          : 'PRIMARY'
                      }
                      onClick={toggleCompletion}
                    />
                  ),
                ]}
                mdxSource={sheetMeta}
              />
            )}
          </FlexContainer>
        </FlexContainer>
      </Section>
      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type='INTERVIEW_SHEET' />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetPage;
