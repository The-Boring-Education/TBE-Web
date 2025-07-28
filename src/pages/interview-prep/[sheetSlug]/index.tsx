import { Fragment, useEffect, useRef, useState } from 'react';
import { FaLock, FaStar } from 'react-icons/fa';

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
  StarButton,
} from '@/components';
import { routes } from '@/constant';
import {
  useAnalytics,
  useApi,
  useGamifiedAction,
  usePaymentStatus,
  useUser,
  useQuestionStarred,
} from '@/hooks';
import type { SheetPageProps } from '@/interfaces';
import { getSheetPageProps } from '@/utils';

const SheetPage = ({
  sheet,
  meta,
  slug,
  seoMeta,
}: SheetPageProps) => {
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

  useEffect(() => {
    const currentQuestion = questions.find(
      (question) => question._id.toString() === currentQuestionId
    );
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
  }, [currentQuestionId, questions]);

  const { makeRequest } = useApi(`interview-prep/${slug}`);
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
  
        let next = questions
          .slice(currentIndex + 1)
          .find((q) => !q.isCompleted) ||
          questions.find((q) => !q.isCompleted); // Loop to beginning if none left
  
        if (next) {
          const questionId = next._id.toString();
          setCurrentQuestionId(questionId);
          setSheetMeta(`${next.question}\n\n${next.answer}`);
        }
      }
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
          isPurchased={!!isPurchased} // Ensure boolean
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
                    <div key={questionId} className='flex items-center w-full'>
                      <QuestionLink
                        currentQuestionId={currentQuestionId}
                        frequency={frequency}
                        handleQuestionClick={() =>
                          handleQuestionClick(`${question}\n\n${answer}`, questionId)
                        }
                        href={`${slug}`}
                        isCompleted={isCompleted}
                        question={`${question}\n\n${answer}`}
                        questionId={questionId}
                        title={title}
                        isLocked={isLocked}
                      />
                      {isStarred && (
                        <FaStar
                          className='ml-1 text-yellow-400'
                          style={{ fontSize: '0.9em' }}
                          title='Starred'
                        />
                      )}
                    </div>
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
                  currentQuestionId && (
                    <StarButton
                      key='star'
                      isStarred={isStarred}
                      onToggle={toggleStar}
                      isLoading={isStarLoading}
                      className='mt-2 ml-2'
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
