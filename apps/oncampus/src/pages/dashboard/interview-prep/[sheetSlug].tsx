import {
  Button,
  FeedbackPopup,
  FlexContainer,
  LearningEnvironmentLayout,
  LearningQuestionList,
  MDXRenderer,
  PaymentCard,
  ResourceTooltip,
  SEO,
  StarButton,
  Text,
} from "@tbe/components";
import { useGamifiedAction } from "@tbe/components";
import { routes } from "@tbe/constants";
import { useAnalytics, usePaymentAccess, useUser } from "@tbe/hooks";
import type { SheetPageProps } from "@tbe/interface";
import { useMutation } from "@tbe/query";
import { cn, getSheetPageProps, sendRequest } from "@tbe/utils";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FaLock } from "react-icons/fa";

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
          await gamifiedAction.triggerGamifiedAction({
            gamificationAction: "COMPLETE_QUESTION",
            analytics: {
              action: "QUESTION_COMPLETE",
              category: "Learning",
              label: "Question Completed",
            },
            customMessage: "Question solved! Great work!",
            metadata: {
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
    <LearningQuestionList
      questions={questions ?? []}
      currentQuestionId={currentQuestionId}
      isLocked={isLocked}
      href={router.asPath.split("?")[0]}
      onQuestionSelect={handleQuestionClick}
      theme="dark"
    />
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LearningEnvironmentLayout
        backHref={routes.oncampus.interviewPrep}
        isLoading={isDataLoading}
        layoutMode="workspace"
      >
        {/* Workspace Header Section */}
        <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
          <div
            className={cn(
              "border-r border-gray-800/60 px-3 py-3.5 flex items-center justify-between shrink-0 transition-all duration-300 overflow-hidden",
              isSidebarOpen
                ? "w-full lg:w-[260px]"
                : "w-0 lg:w-0 border-r-0 px-0",
            )}
          >
            <div className="flex flex-col min-w-[140px]">
              <Text
                level="h2"
                className="text-[13px] font-bold text-white tracking-wide"
              >
                Explore Questions
              </Text>
              <Text
                level="p"
                className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em]"
              >
                Choose a question
              </Text>
            </div>
            <button
              onClick={() => router.push(routes.oncampus.interviewPrep)}
              className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] border border-red-500/40 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
              title="Back to Sheets"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-between px-4">
            <FlexContainer wrap={false} className="gap-4">
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

              <FlexContainer
                direction="col"
                itemCenter={false}
                justifyCenter={false}
                wrap={false}
              >
                <Text
                  level="h1"
                  className="strong-text font-bold text-white mb-0.5 tracking-tight"
                >
                  {sheet.name}
                </Text>
                <Text
                  level="p"
                  className="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                >
                  Practicing {(sheet.name || "").toUpperCase()} interview
                  questions
                </Text>
              </FlexContainer>
            </FlexContainer>
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
            <div className="px-1 py-2 min-w-[260px]">
              <LearningQuestionList
                questions={questions ?? []}
                currentQuestionId={currentQuestionId}
                isLocked={isLocked}
                href={router.asPath.split("?")[0]}
                onQuestionSelect={handleQuestionClick}
                theme="dark"
              />
            </div>
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
      </LearningEnvironmentLayout>

      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type="INTERVIEW_SHEET" />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetPage;
