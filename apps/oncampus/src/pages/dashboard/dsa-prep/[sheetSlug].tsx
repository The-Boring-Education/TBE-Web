import {
  Button,
  DifficultyGroupedList,
  FeedbackPopup,
  FlexContainer,
  LearningEnvironmentLayout,
  mapInterviewPriorityToDifficultyGroup,
  MDXRenderer,
  PaymentCard,
  QuestionLink,
  ResourceTooltip,
  SEO,
  STANDARD_DIFFICULTY_GROUPS_DEFAULT_EXPANDED,
  STANDARD_DIFFICULTY_LABELS,
  STANDARD_DIFFICULTY_ORDER,
  StarButton,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import {
  calculateUserPointsForAction,
  useGamificationContext,
  useGamifiedAction,
} from "@tbe/gamification";
import {
  useAnalytics,
  usePaymentAccess,
  useQuestionStarred,
  useUser,
} from "@tbe/hooks";
import type { SheetPageProps } from "@tbe/interface";
import { queryKeys, useMutation, useQueryClient } from "@tbe/query";
import { getSheetPageProps, sendRequest } from "@tbe/utils";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FaLock } from "react-icons/fa";

const DSASheetPage = ({ sheet, meta, slug, seoMeta }: SheetPageProps) => {
  const router = useRouter();
  const [sheetMeta, setSheetMeta] = useState<string>(meta || "");
  const [questions, setQuestions] = useState(sheet.questions || []);
  const firstQuestionId = questions?.[0]?._id?.toString() || "";
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
    productType: "INTERVIEW_SHEET",
    isPremium: sheet?.isPremium,
    isEnrolled: sheet?.isEnrolled,
  });

  const {
    isStarred,
    isLoading: isStarLoading,
    toggleStar,
    setIsStarred,
  } = useQuestionStarred({
    userId: user?.id || "",
    sheetId: sheet._id?.toString() || "",
    questionId: currentQuestionId || "",
    initialIsStarred:
      questions.find((q) => q._id.toString() === currentQuestionId)
        ?.isStarred || false,
  });

  // Get current question and its resources
  const currentQuestion = useMemo(
    () =>
      questions.find(
        (question) => question._id.toString() === currentQuestionId,
      ),
    [questions, currentQuestionId],
  );
  const questionResources = useMemo(() => {
    if (!currentQuestion?.resources) return undefined;
    // Hide leetcode and youtube links for real world problems
    if ((currentQuestion as any).isRealWorldProblem) {
      const { youtubeURL, leetcodeURL, ...rest } =
        currentQuestion.resources as any;
      return Object.keys(rest).length > 0 ? rest : undefined;
    }
    return currentQuestion.resources;
  }, [currentQuestion]);

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
        gamificationAction: "COMPLETE_INTERVIEW_SHEET",
        analytics: {
          action: "INTERVIEW_SHEET_COMPLETE",
          category: "Achievement",
          label: "DSA Sheet Completed",
        },
        celebrationType: "achievement",
        customMessage: "DSA sheet completed! You're ready!",
        metadata: {
          sheetId: sheet._id,
          sheetName: sheet.name,
          totalQuestions: questions.length,
        },
      });
    }

    setShowFeedback(allCompleted);
  }, [
    currentQuestionId,
    questions,
    gamifiedAction,
    setIsStarred,
    currentQuestion,
  ]);

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
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
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
        method: "PATCH",
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
            queryKey: queryKeys.gamification.points(user?.id ?? ""),
          });
          await queryClient.invalidateQueries({
            queryKey: ["gamification"],
          });
          const pointsEarned =
            calculateUserPointsForAction("COMPLETE_QUESTION");
          const intensity =
            pointsEarned >= 50 ? "high" : pointsEarned >= 20 ? "medium" : "low";
          triggerCelebration({ type: "points", intensity });
          showToast({
            type: "points",
            message: "DSA question solved! Great work!",
            points: pointsEarned,
          });
          trackEvent({
            action: "QUESTION_COMPLETE",
            category: "Learning",
            label: "DSA Question Solved",
            value: {
              userId: user?.id,
              sheetId: sheet._id,
              questionId: currentQuestionId,
              sheetName: sheet.name,
            },
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.gamification.points(user?.id ?? ""),
          });
          await queryClient.invalidateQueries({
            queryKey: ["gamification"],
          });
          trackEvent({
            action: "DSA_SHEET_PROGRESS",
            category: "DSASheet",
            label: "DSA Sheet Progress",
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
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      } else {
        // Handle API error - don't update local state
        console.error(
          "Failed to update question completion:",
          response?.message,
        );
      }
    } catch (error) {
      console.error("Error toggling question completion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show small loader if data is not ready
  const isDataLoading = !sheet || !questions || questions.length === 0;

  const questionsSidebar = (
    <DifficultyGroupedList
      className="gap-px flex-grow"
      items={questions ?? []}
      getDifficulty={(q) =>
        mapInterviewPriorityToDifficultyGroup(
          (q as { priority?: string }).priority,
        )
      }
      getItemKey={(q) => q._id?.toString() ?? ""}
      initialExpandedGroups={STANDARD_DIFFICULTY_GROUPS_DEFAULT_EXPANDED}
      difficultyOrder={STANDARD_DIFFICULTY_ORDER}
      difficultyLabels={STANDARD_DIFFICULTY_LABELS}
      emptyMessage="No questions in this sheet."
      groupClassName="mb-2 last:mb-0"
      renderItem={(row) => {
        const {
          _id,
          title,
          question,
          answer,
          isCompleted,
          frequency,
          isStarred,
        } = row;
        const questionId = _id?.toString() ?? "";

        return (
          <div className="flex items-center w-full">
            <QuestionLink
              currentQuestionId={currentQuestionId}
              frequency={frequency}
              handleQuestionClick={() =>
                handleQuestionClick(`${question}\n\n${answer}`, questionId)
              }
              href={router.asPath.split("?")[0]}
              isCompleted={isCompleted}
              question={`${question}\n\n${answer}`}
              questionId={questionId}
              title={title}
              isLocked={isLocked}
              theme="dark"
              isStarred={isStarred}
            />
          </div>
        );
      }}
    />
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LearningEnvironmentLayout
        backHref={routes.oncampus.dsa}
        isLoading={isDataLoading}
        layoutMode="workspace"
      >
        <FlexContainer
          className="lg:flex-row flex-1 min-h-0 w-full h-full"
          direction="col"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Sidebar with questions list */}
          <div className="hidden lg:block lg:w-4/12 border-r border-gray-800 bg-[#0A0A0A] overflow-y-auto h-full p-2">
            {questionsSidebar}
          </div>

          {/* Main Content Area */}
          <FlexContainer
            className="md:w-8/12 w-full p-4 md:p-6 bg-[#0A0A0A] overflow-y-auto h-full"
            itemCenter={false}
            justifyCenter={false}
          >
            {isLocked ? (
              <div className="w-full">
                <Text level="h2" className="heading-4 mb-4 text-contentDark">
                  DSA Sheet Overview
                </Text>
                <MDXRenderer theme="dark" mdxSource={sheet.meta || ""} />
                <div className="mt-6 w-full rounded bg-orange-100 p-4 border border-orange-300 shadow-sm">
                  <Text level="h4" className="mb-2 flex items-center gap-2">
                    <FaLock className="text-orange-600" />
                    🚀 This is a Premium DSA Sheet
                  </Text>
                  <Text level="p" className="mb-4">
                    To access all the DSA interview questions and detailed
                    solutions, please complete the payment. Once payment is
                    confirmed, all questions will be unlocked instantly.
                  </Text>
                  {!showPayment && (
                    <Button
                      text="Pay Now to Unlock"
                      variant="PRIMARY"
                      className="w-fit"
                      onClick={handleShowPayment}
                    />
                  )}
                </div>
                {showPayment && (
                  <div ref={paymentSectionRef}>
                    <PaymentCard
                      course={sheet}
                      onClose={() => setShowPayment(false)}
                      productType="INTERVIEW_SHEET"
                    />
                  </div>
                )}
              </div>
            ) : (
              <FlexContainer
                className="border w-full p-6 rounded-xl bg-[#0A0A0A] border-gray-800"
                itemCenter={false}
                justifyCenter={false}
              >
                <MDXRenderer
                  theme="dark"
                  actions={[
                    currentQuestionId && (
                      <Button
                        key="complete"
                        className="w-fit mt-2"
                        isLoading={isLoading}
                        disabled={!sheet.isEnrolled}
                        text={
                          isLoading
                            ? "Marking..."
                            : !sheet.isEnrolled
                              ? "Enroll to Mark Complete"
                              : isQuestionCompleted
                                ? "Completed"
                                : "Mark As Completed"
                        }
                        variant={
                          isQuestionCompleted
                            ? "SUCCESS"
                            : !sheet.isEnrolled
                              ? "SECONDARY"
                              : isLoading
                                ? "SECONDARY"
                                : "PRIMARY"
                        }
                        onClick={toggleCompletion}
                      />
                    ),
                    currentQuestionId && (
                      <StarButton
                        key="star"
                        isStarred={isStarred}
                        onToggle={toggleStar}
                        isLoading={isStarLoading}
                        className="mt-2 ml-2"
                      />
                    ),
                    currentQuestionId && questionResources && (
                      <ResourceTooltip
                        key="resources"
                        resources={questionResources}
                        theme="dark"
                        className="mt-2 ml-2"
                      />
                    ),
                  ]}
                  mdxSource={sheetMeta}
                />
              </FlexContainer>
            )}
          </FlexContainer>
        </FlexContainer>
      </LearningEnvironmentLayout>

      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type="INTERVIEW_SHEET" />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default DSASheetPage;
