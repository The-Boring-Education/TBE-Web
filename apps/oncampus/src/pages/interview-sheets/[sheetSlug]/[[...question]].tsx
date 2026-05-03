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
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaLock } from "react-icons/fa";
import { FiCheck, FiCopy } from "react-icons/fi";
import { toast } from "sonner";

import InterviewQuestionContent from "@/components/InterviewQuestionContent";
import { MobileNav } from "@/components/MobileNav";
import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SheetPage = ({
  sheet,
  meta,
  slug,
  seoMeta,
  currentQuestionId: initialQuestionId,
}: SheetPageProps) => {
  const router = useRouter();
  const [sheetMeta, setSheetMeta] = useState<string>(meta || "");
  const [questions, setQuestions] = useState(sheet?.questions || []);
  const firstQuestionId = questions?.[0]?._id?.toString() || "";

  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalQuestions = questions.length;
  const completedQuestions = questions.filter((q) => q.isCompleted).length;

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const { triggerCelebration, showToast } = useGamificationContext();
  const queryClient = useQueryClient();

  const { isLocked } = usePaymentAccess({
    productId: sheet?._id,
    productType: "INTERVIEW_SHEET",
    isPremium: sheet?.isPremium,
    isEnrolled: sheet?.isEnrolled,
  });

  const [isStarLoading, setIsStarLoading] = useState(false);

  const urlQuestionSlug = useMemo(() => {
    const questionParams = router.query.question;
    return Array.isArray(questionParams) ? questionParams[0] : questionParams;
  }, [router.query.question]);

  const currentQuestion = useMemo(() => {
    if (!urlQuestionSlug) {
      return (
        questions.find((q) => q._id.toString() === initialQuestionId) ||
        questions[0]
      );
    }
    return (
      questions.find((q) => slugify(q.title) === urlQuestionSlug) ||
      questions[0]
    );
  }, [questions, urlQuestionSlug, initialQuestionId]);

  const currentQuestionId = useMemo(
    () => currentQuestion?._id?.toString() || "",
    [currentQuestion],
  );
  const isQuestionCompleted = useMemo(
    () => currentQuestion?.isCompleted || false,
    [currentQuestion],
  );
  const isQuestionStarred = useMemo(
    () => currentQuestion?.isStarred || false,
    [currentQuestion],
  );

  const currentIndex = useMemo(
    () => questions.findIndex((q) => q._id.toString() === currentQuestionId),
    [questions, currentQuestionId],
  );

  const questionResources = useMemo(() => {
    if (!currentQuestion?.resources) return undefined;
    if ((currentQuestion as any).isRealWorldProblem) {
      if (Array.isArray(currentQuestion.resources)) {
        const res: any = {};
        currentQuestion.resources.forEach((r: any) => {
          const type = r.type?.toLowerCase();
          if (type === "blog" || type === "article") res.blogURL = r.url;
        });
        return Object.keys(res).length > 0 ? res : undefined;
      }
      const { youtubeURL, leetcodeURL, ...rest } =
        currentQuestion.resources as any;
      return Object.keys(rest).length > 0 ? rest : undefined;
    }
    if (Array.isArray(currentQuestion.resources)) {
      const res: any = {};
      currentQuestion.resources.forEach((r: any) => {
        const type = r.type?.toLowerCase();
        if (type === "youtube") res.youtubeURL = r.url;
        else if (type === "leetcode") res.leetcodeURL = r.url;
        else if (type === "blog" || type === "article") res.blogURL = r.url;
      });
      return res;
    }
    return currentQuestion.resources;
  }, [currentQuestion]);

  // Handle completion state & feedback
  useEffect(() => {
    if (!currentQuestion) return;

    const allCompleted =
      questions.length > 0 && questions.every((q) => q.isCompleted);

    if (allCompleted && !showFeedback) {
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
  }, [questions, gamifiedAction, sheet._id, sheet.name, showFeedback]);

  if (!sheet) return null;

  const handleQuestionClick = useCallback(
    (questionMeta: string, questionId: string) => {
      if (!isLocked) {
        const selectedQuestion = questions.find(
          (q) => q._id.toString() === questionId,
        );

        if (selectedQuestion) {
          // Update URL to match selected question slug
          const questionSlug = slugify(selectedQuestion.title);
          const newPath = `/interview-sheets/${sheet.slug}/${questionSlug}`;

          if (router.asPath !== newPath) {
            router.push(newPath, undefined, { shallow: true });
          }
        }
      }
    },
    [isLocked, questions, router, sheet.slug],
  );

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!", {
      duration: 2000,
      className:
        "bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-lg",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowPayment = () => {
    setShowPayment(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const toggleStar = async () => {
    if (!user?.id || !currentQuestionId) return;
    const oldQuestions = [...questions];
    const newStarStatus = !isQuestionStarred;

    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) =>
        q._id.toString() === currentQuestionId
          ? { ...q, isStarred: newStarStatus }
          : q,
      ),
    );

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
      if (!response?.status) {
        setQuestions(oldQuestions);
      } else {
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
      }
    } catch {
      setQuestions(oldQuestions);
    } finally {
      setIsStarLoading(false);
    }
  };

  const toggleCompletion = async () => {
    if (isLocked) return;
    setIsLoading(true);
    const oldQuestions = [...questions];
    try {
      const newCompletionStatus = !isQuestionCompleted;

      // Optimistic update
      setQuestions((prev) =>
        prev.map((q) =>
          q._id.toString() === currentQuestionId
            ? { ...q, isCompleted: newCompletionStatus }
            : q,
        ),
      );

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
      if (response?.status) {
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

        if (newCompletionStatus) {
          const updatedQuestions = questions.map((question) =>
            question._id.toString() === currentQuestionId
              ? { ...question, isCompleted: newCompletionStatus }
              : question,
          );
          const next =
            updatedQuestions
              .slice(currentIndex + 1)
              .find((q) => !q.isCompleted) ||
            updatedQuestions.find((q) => !q.isCompleted);
          if (next) {
            // Update URL for the next question
            const questionSlug = slugify(next.title);
            router.push(
              `/interview-sheets/${sheet.slug}/${questionSlug}`,
              undefined,
              { shallow: true },
            );
          }
        }
      } else {
        setQuestions(oldQuestions);
        console.error(
          "Failed to update question completion:",
          response?.message,
        );
      }
    } catch (error) {
      setQuestions(oldQuestions);
      console.error("Error toggling question completion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDataLoading = !sheet || !questions || questions.length === 0;

  const questionsSidebar = useMemo(
    () => (
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
          const questionSlug = slugify(title);
          const questionHref = `/interview-sheets/${sheet.slug}/${questionSlug}`;

          return (
            <div key={questionId} className="flex items-center w-full">
              <QuestionLink
                currentQuestionId={currentQuestionId}
                frequency={frequency}
                handleQuestionClick={() =>
                  handleQuestionClick(`${question}\n\n${answer}`, questionId)
                }
                href={questionHref}
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
    ),
    [questions, currentQuestionId, isLocked, handleQuestionClick, sheet.slug],
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <OnCampusLearningLayout
        backHref="/interview-sheets"
        isLoading={isDataLoading}
        layoutMode="workspace"
      >
        <FlexContainer
          className="flex-1 min-h-0 w-full h-full"
          direction="col"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Workspace Header Banner */}
          <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
            <div className="border-r border-gray-800/60 px-4 lg:px-3 py-3.5 flex items-center justify-between shrink-0 transition-all duration-300 w-full lg:w-[260px]">
              <div className="flex flex-col">
                <Text
                  level="h3"
                  className="text-white strong-text font-black tracking-tight leading-none mb-1.5"
                >
                  Questions
                </Text>
                <div className="flex flex-col gap-1.5 w-full">
                  <Text
                    level="p"
                    className="text-[9px] font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {completedQuestions} / {totalQuestions} Solved
                  </Text>
                  <div className="h-[3px] w-[140px] bg-gray-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-700 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      style={{
                        width: `${(completedQuestions / totalQuestions) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                {urlQuestionSlug && (
                  <Button
                    onClick={() =>
                      router.push(
                        `/interview-sheets/${sheet.slug}`,
                        undefined,
                        { shallow: true },
                      )
                    }
                    variant="OUTLINE"
                    size="SMALL"
                    text="←"
                    className="border-gray-800 text-gray-400 bg-transparent hover:border-red-500 hover:bg-red-500/10 shrink-0 py-[3px] px-[8px] h-auto text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  />
                )}
              </div>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-between px-4">
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
                  {sheet.name || "Interview Sheet"}
                </Text>
                <Text
                  level="p"
                  className="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                >
                  Interview questions and answers
                </Text>
              </FlexContainer>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleCopyLink}
                  variant="OUTLINE"
                  size="SMALL"
                  text={copied ? "Copied!" : "Copy Link"}
                  className={cn(
                    "border-gray-700 bg-transparent transition-all duration-300 py-[4px] px-[8px] h-auto text-[11px] font-medium whitespace-nowrap gap-1.5",
                    copied
                      ? "border-green-500/50 text-green-400"
                      : "hover:border-red-500 hover:bg-red-500/10",
                  )}
                  icon={
                    copied ? (
                      <FiCheck className="text-[10px]" />
                    ) : (
                      <FiCopy className="text-[10px]" />
                    )
                  }
                />
                <Link href="/interview-sheets">
                  <Button
                    variant="OUTLINE"
                    size="SMALL"
                    text="View All Sheets"
                    className="border-gray-700 bg-transparent hover:border-red-500 hover:bg-red-500/10 shrink-0 py-[4px] px-[8px] h-auto text-[11px] font-medium whitespace-nowrap"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Split Layout: Sidebar + Content */}
          <FlexContainer
            direction="col"
            className="lg:flex-row flex-1 min-h-0 w-full"
            itemCenter={false}
            justifyCenter={false}
            wrap={false}
          >
            {/* Sidebar */}
            <div
              className={cn(
                "flex flex-col flex-shrink-0 border-r border-gray-800/50 bg-[#0A0A0A] w-full lg:w-[260px] scrollbar-thin-grey overflow-y-auto",
                urlQuestionSlug ? "hidden lg:flex" : "flex",
              )}
            >
              <div className="p-2 w-full h-full">{questionsSidebar}</div>
            </div>

            {/* Main Content Area */}
            <FlexContainer
              className={cn(
                "flex-1 min-w-0 w-full bg-[#0A0A0A] overflow-y-auto h-full relative scrollbar-thin-grey",
                !urlQuestionSlug ? "hidden lg:flex" : "flex flex-col",
              )}
              itemCenter={false}
              justifyCenter={false}
            >
              {isLocked ? (
                <div className="w-full p-4 md:p-6 lg:p-8">
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
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={currentQuestionId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="w-full p-4 md:p-8 lg:p-12"
                  >
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
                        currentQuestionId && questionResources && (
                          <ResourceTooltip
                            key="resources"
                            resources={questionResources}
                            theme="dark"
                            className="mt-2"
                          />
                        ),
                      ]}
                      isStarred={isQuestionStarred}
                      onToggleStar={toggleStar}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>
      </OnCampusLearningLayout>

      {/* Mobile bottom nav */}
      <MobileNav />

      {showFeedback && (
        <FeedbackPopup refId={sheet._id} type="INTERVIEW_SHEET" />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getSheetPageProps;

export default SheetPage;
