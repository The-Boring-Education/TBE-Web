import {
  Button,
  DifficultyGroupedList,
  FeedbackPopup,
  FlexContainer,
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
import { useAnalytics, usePaymentAccess, useUser } from "@tbe/hooks";
import type { SheetPageProps } from "@tbe/interface";
import { queryKeys, useMutation, useQueryClient } from "@tbe/query";
import { cn, getSheetPageProps, sendRequest } from "@tbe/utils";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FaLock } from "react-icons/fa";

import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

import InterviewQuestionContent from "../../../components/InterviewQuestionContent";

const SheetPage = ({ sheet, meta, slug, seoMeta }: SheetPageProps) => {
  const router = useRouter();
  const [sheetMeta, setSheetMeta] = useState<string>(meta || "");
  const [questions, setQuestions] = useState(sheet.questions || []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const firstQuestionId = questions?.[0]?._id?.toString() || "";
  const [currentQuestionId, setCurrentQuestionId] = useState(firstQuestionId);
  const [isQuestionCompleted, setIsQuestionCompleted] = useState<boolean>(
    questions.find((question) => question._id.toString() === currentQuestionId)
      ?.isCompleted || false,
  );
  const [isQuestionStarred, setIsQuestionStarred] = useState<boolean>(
    questions.find((question) => question._id.toString() === currentQuestionId)
      ?.isStarred || false,
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
  const { triggerCelebration, showToast } = useGamificationContext();
  const queryClient = useQueryClient();

  // Universal payment access hook - handles all payment status and locked logic
  const { isLocked, isPurchased } = usePaymentAccess({
    productId: sheet?._id,
    productType: "INTERVIEW_SHEET",
    isPremium: sheet?.isPremium,
    isEnrolled: sheet?.isEnrolled,
  });

  // State for completion and starring
  const [isStarLoading, setIsStarLoading] = useState(false);

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

    // Handle new array format
    if (Array.isArray(currentQuestion.resources)) {
      const res: any = {};
      currentQuestion.resources.forEach((r: any) => {
        // Type might be lowercase or capitalized, handle both
        const type = r.type?.toLowerCase();
        if (type === "youtube") res.youtubeURL = r.url;
        else if (type === "leetcode") res.leetcodeURL = r.url;
        else if (type === "blog" || type === "article") res.blogURL = r.url;
      });
      return res;
    }
    // Handle legacy object format
    return currentQuestion.resources;
  }, [currentQuestion]);

  useEffect(() => {
    setIsQuestionCompleted(currentQuestion?.isCompleted || false);
    setIsQuestionStarred(currentQuestion?.isStarred || false);

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
          label: "Interview Sheet Completed",
        },
        celebrationType: "achievement",
        customMessage: "Interview sheet completed! You're ready!",
        metadata: {
          sheetId: sheet._id,
          sheetName: sheet.name,
          totalQuestions: questions.length,
        },
      });
    }

    setShowFeedback(allCompleted);
  }, [currentQuestionId, questions, gamifiedAction, currentQuestion]);

  if (!sheet) return null;

  const handleQuestionClick = (questionMeta: string, questionId: string) => {
    if (!isLocked) {
      // Find the question to get its full content
      const selectedQuestion = questions.find(
        (q) => q._id.toString() === questionId,
      );
      if (selectedQuestion) {
        const updatedMeta = `${selectedQuestion.question}\n\n${selectedQuestion.answer}`;
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
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const toggleStar = async () => {
    if (!user?.id || !currentQuestionId) return;

    const oldState = isQuestionStarred;
    const newStarStatus = !oldState;

    // Optimistic update
    setIsQuestionStarred(newStarStatus);
    setIsStarLoading(true);

    try {
      const response = await makeRequest({
        method: "POST",
        url: routes.api.markSheetQuestionAsStarred,
        body: {
          userId: user?.id,
          sheetId: sheet._id,
          questionId: currentQuestionId,
          isStarred: newStarStatus,
        },
      });

      if (response?.status) {
        // Update the master questions array so sidebar/navigation stays in sync
        const updatedQuestions = questions.map((question) =>
          question._id.toString() === currentQuestionId
            ? { ...question, isStarred: newStarStatus }
            : question,
        );
        setQuestions(updatedQuestions);

        trackEvent({
          action: "INTERVIEW_SHEET_PROGRESS",
          category: "InterviewSheet",
          label: "Interview Sheet Progress",
          value: {
            userId: user?.id,
            sheetId: sheet._id,
            questionId: currentQuestionId,
            isStarred: newStarStatus,
          },
        });
      } else {
        setIsQuestionStarred(oldState);
      }
    } catch (error) {
      console.error("Failed to toggle star:", error);
      setIsQuestionStarred(oldState);
    } finally {
      setIsStarLoading(false);
    }
  };

  const toggleCompletion = async () => {
    // Don't allow completion if user doesn't have access
    if (isLocked) {
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
        // Fire gamified action on completion
        if (newCompletionStatus) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.gamification.points(user?.id ?? ""),
          });
          const pointsEarned =
            calculateUserPointsForAction("COMPLETE_QUESTION");
          const intensity =
            pointsEarned >= 50 ? "high" : pointsEarned >= 20 ? "medium" : "low";
          triggerCelebration({ type: "points", intensity });
          showToast({
            type: "points",
            message: "Question solved! Great work!",
            points: pointsEarned,
          });
          trackEvent({
            action: "QUESTION_COMPLETE",
            category: "Learning",
            label: "Question Completed",
            value: {
              userId: user?.id,
              sheetId: sheet._id,
              questionId: currentQuestionId,
              sheetName: sheet.name,
            },
          });
        } else {
          trackEvent({
            action: "INTERVIEW_SHEET_PROGRESS",
            category: "InterviewSheet",
            label: "Interview Sheet Progress",
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
            // Updating meta logic duplicated here for immediate transition
            const updatedMeta = `${next.question}\n\n${next.answer}`;
            setSheetMeta(updatedMeta);
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
      renderItem={(item) => {
        const {
          _id,
          title,
          question,
          answer,
          isCompleted,
          frequency,
          isStarred,
        } = item;
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
      <OnCampusLearningLayout
        backHref={routes.oncampus.interviewPrep}
        isLoading={isDataLoading}
        layoutMode="workspace"
      >
        {/* Workspace Header Section */}
        <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
          <div
            className={cn(
              "border-r border-gray-800/60 px-4 py-3.5 flex items-center gap-3 shrink-0 transition-all duration-300 overflow-hidden",
              isSidebarOpen ? "w-full lg:w-[260px]" : "w-[100px] lg:w-[110px]",
            )}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center justify-center w-[32px] h-[32px] rounded-md border border-gray-800 bg-gray-900/50 text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-200 shrink-0"
                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => router.push(routes.oncampus.interviewPrep)}
                className="flex items-center justify-center w-[32px] h-[32px] rounded-md border border-red-500/40 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                title="Back to Sheets"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {isSidebarOpen && (
              <div className="flex flex-col min-w-[100px] hidden lg:flex">
                <Text
                  level="h2"
                  className="text-[12px] font-bold text-white tracking-wide leading-none mb-1"
                >
                  Explore Questions
                </Text>
                <Text
                  level="p"
                  className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.1em] leading-none"
                >
                  {questions.length} Items
                </Text>
              </div>
            )}
          </div>

          <div className="flex flex-1 items-center justify-between px-4">
            <div className="flex flex-col">
              <Text
                level="h1"
                className="text-sm md:text-base font-bold text-white mb-0.5 tracking-tight line-clamp-1"
              >
                {sheet.name}
              </Text>
              <Text
                level="p"
                className="text-[9px] md:text-[10px] font-medium text-gray-500 uppercase tracking-wider hidden sm:block"
              >
                {isLocked
                  ? "Overview & Enrollment"
                  : `Question ${questions.findIndex((q) => q._id.toString() === currentQuestionId) + 1} of ${questions.length}`}
              </Text>
            </div>
          </div>
        </div>

        <FlexContainer
          className="lg:flex-row flex-1 min-h-0 w-full h-full"
          direction="col"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Sidebar Area - 260px wide to match header */}
          <div
            className={cn(
              "flex-shrink-0 border-r border-gray-800 flex flex-col bg-[#0A0A0A] overflow-y-auto min-h-0 scrollbar-thin-grey transition-all duration-300",
              isSidebarOpen
                ? "w-full lg:w-[260px]"
                : "w-0 opacity-0 overflow-hidden border-r-0",
            )}
          >
            <div className="px-1 py-2 min-w-[260px]">{questionsSidebar}</div>
          </div>

          {/* Main Question Detail Area */}
          <div className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-[#050505] p-6 lg:p-8 scrollbar-thin-grey">
            <FlexContainer
              className="w-full max-w-4xl mx-auto h-fit"
              itemCenter={false}
              justifyCenter={false}
            >
              {isLocked ? (
                <div className="w-full">
                  <Text level="h2" className="heading-4 mb-4 text-contentDark">
                    Interview Sheet Overview
                  </Text>
                  <MDXRenderer theme="dark" mdxSource={sheet.meta || ""} />
                  <div className="mt-6 w-full rounded bg-yellow-100 p-4 border border-yellow-300 shadow-sm text-black">
                    <Text level="h4" className="mb-2 flex items-center gap-2">
                      <FaLock className="text-yellow-600" />
                      🚀 This is a Premium Interview Sheet
                    </Text>
                    <Text level="p" className="mb-4">
                      To access all the interview questions and detailed
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
                    <div ref={paymentSectionRef} className="mt-6">
                      <PaymentCard
                        course={sheet}
                        onClose={() => setShowPayment(false)}
                        productType="INTERVIEW_SHEET"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full">
                  <InterviewQuestionContent
                    questionTitle={currentQuestion?.title || ""}
                    question={currentQuestion?.question || ""}
                    answer={currentQuestion?.answer || ""}
                    frequency={currentQuestion?.frequency}
                    priority={currentQuestion?.priority}
                    companyTypes={currentQuestion?.companyTypes}
                    actions={[
                      currentQuestionId && (
                        <Button
                          key="complete"
                          className="w-fit mt-2"
                          isLoading={isLoading}
                          disabled={isLocked}
                          text={
                            isLoading
                              ? "Marking..."
                              : isLocked
                                ? "Enroll to Mark Complete"
                                : isQuestionCompleted
                                  ? "Completed"
                                  : "Mark As Completed"
                          }
                          variant={
                            isQuestionCompleted
                              ? "SUCCESS"
                              : isLocked
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
                          isStarred={isQuestionStarred}
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
                  />
                </div>
              )}
            </FlexContainer>
          </div>
        </FlexContainer>
      </OnCampusLearningLayout>

      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type="INTERVIEW_SHEET" />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetPage;
