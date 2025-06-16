import { Fragment, useEffect, useState } from 'react';

import {
  Button,
  FeedbackPopup,
  FlexContainer,
  LinerProgressBar,
  MDXRenderer,
  QuestionLink,
  Section,
  SEO,
  SheetHeroContainer,
  Text,
} from '@/components';
import { routes } from '@/constant';
import { useAnalytics, useApi, useUser } from '@/hooks';
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
    setShowFeedback(allCompleted);
  }, [currentQuestionId, questions]);

  const { makeRequest } = useApi(`interview-prep/${sheet}`);
  const { user } = useUser();
  const { trackEvent } = useAnalytics();

  if (!sheet) return null;

  const handleQuestionClick = (questionMeta: string) => {
    setSheetMeta(questionMeta);
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
              <LinerProgressBar
                completedChapters={completedQuestions}
                totalChapters={totalQuestions}
              />
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
                    />
                  );
                }
              )}
            </FlexContainer>
          </FlexContainer>

          {/* Main Content Area */}
          <FlexContainer
            className='border md:w-8/12 w-full p-2 rounded'
            disabled={!sheet.isEnrolled}
            itemCenter={false}
            justifyCenter={false}
          >
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
