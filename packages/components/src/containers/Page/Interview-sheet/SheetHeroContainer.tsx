import {
  Button,
  Link,
  LoginRedirectButton,
  Section,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useGamifiedAction } from "@tbe/gamification";
import { useAnalytics, useApi, useUser } from "@tbe/hooks";
import type { SheetHeroContainerProps } from "@tbe/interface";
import { ArrowLeft, CheckCircle2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";

const SheetHeroContainer = ({
  id,
  name,
  isEnrolled: initialIsEnrolled = false,
  isPremium,
  isPurchased,
  redirectTo,
  backHref,
  backText = "Back to Courses",
  trackType = "sheet",
  theme,
  onEnrollSuccess,
  onCustomEnroll,
}: SheetHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);

  useEffect(() => {
    setIsEnrolled(initialIsEnrolled);
  }, [initialIsEnrolled]);

  const { makeRequest, loading } = useApi(
    trackType === "course"
      ? "shiksha/enrollCourse"
      : "interview-prep/enrollSheet",
  );

  const enrollSheet = () => {
    if (onCustomEnroll) {
      onCustomEnroll();
      return;
    }

    const apiUrl =
      trackType === "course" ? routes.api.enrollCourse : routes.api.enrollSheet;
    const bodyPayload =
      trackType === "course"
        ? { userId: user?.id, courseId: id }
        : { userId: user?.id, sheetId: id };

    makeRequest({
      method: "POST",
      url: apiUrl,
      body: bodyPayload,
    })
      .then(async () => {
        setIsEnrolled(true);

        const actionName =
          trackType === "course" ? "COURSE_ENROLL" : "INTERVIEW_SHEET_ENROLL";
        const categoryName =
          trackType === "course" ? "Course" : "InterviewSheet";
        const labelName =
          trackType === "course"
            ? "Course Enrolled"
            : "Interview Sheet Enrolled";

        trackEvent({
          action: actionName,
          category: categoryName,
          label: labelName,
          value: {
            userId: user?.id,
            id,
          },
        });

        await gamifiedAction.triggerGamifiedAction({
          gamificationAction:
            trackType === "course" ? "ENROLL_COURSE" : "ENROLL_SHEET",
          analytics: {
            action: actionName,
            category: categoryName,
            label: labelName,
          },
          customMessage:
            trackType === "course"
              ? "Course enrolled! Happy learning!"
              : "Interview sheet enrolled! Time to practice!",
          metadata: {
            id,
            name,
          },
        });

        onEnrollSuccess?.();

        if (!onEnrollSuccess && redirectTo && typeof window !== "undefined") {
          window.location.href = redirectTo;
        }
      })
      .catch((error) => error);
  };

  const enrollButtonLabel =
    trackType === "course" ? "Enroll in Course" : "Enroll in Sheet";
  const trackLabel =
    trackType === "course"
      ? `COURSE TRACK - ${name}`
      : `PRACTICE TRACK - ${name}`;

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = (
      <LoginRedirectButton
        text="Login to Get Started"
        className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium py-2 px-4 rounded-lg shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
      />
    );
  } else if (isAuth && !isEnrolled && !isPremium) {
    headerActionButton = (
      <button
        onClick={enrollSheet}
        className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium py-2 px-4 rounded-lg shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
      >
        <Rocket className="w-3.5 h-3.5 text-white shrink-0 fill-white" />
        <span>{enrollButtonLabel}</span>
      </button>
    );
  } else if (isAuth && !isEnrolled && isPremium && isPurchased) {
    headerActionButton = (
      <button
        onClick={enrollSheet}
        className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium py-2 px-4 rounded-lg shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
      >
        <Rocket className="w-3.5 h-3.5 text-white shrink-0 fill-white" />
        <span>{enrollButtonLabel}</span>
      </button>
    );
  }

  if (loading) {
    headerActionButton = (
      <Button
        isLoading
        text="Enrolling..."
        variant="PRIMARY"
        className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium py-2 px-4 rounded-lg shadow-xs text-xs sm:text-sm"
      />
    );
  }

  return (
    <Section className="bg-background/80 border-b border-border/60 text-foreground py-6 sm:py-8">
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 font-primary">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div>
              <Link
                href={backHref ?? routes.learn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted/70 text-muted-foreground hover:text-foreground text-xs font-medium transition-all shadow-2xs group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
                <span>{backText}</span>
              </Link>
            </div>
            <div className="space-y-1">
              <Text
                className="text-xs font-semibold text-primary uppercase tracking-wider"
                level="p"
              >
                {trackLabel}
              </Text>
              <h1 className="font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
                Hello {user?.name ?? "Learner"}! 👋
              </h1>
              <p className="text-sm text-muted-foreground font-normal">
                Let&apos;s continue your learning journey.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 self-stretch md:self-center justify-end">
            {!isEnrolled && (
              <svg
                className="w-10 h-9 text-[#FF5555] shrink-0 hidden md:block"
                viewBox="0 0 42 36"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 4 28 C 12 25, 17 20, 17 14 C 17 7, 7 7, 7 14 C 7 21, 14 24, 22 19 C 27 15, 32 9, 36 4" />
                <path d="M 29 5 L 36 4 L 35 11" />
              </svg>
            )}

            {!isEnrolled ? (
              <div className="bg-card border border-border/80 rounded-xl p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center min-w-[200px] sm:min-w-[220px] w-full md:w-auto">
                <div className="w-full">{headerActionButton}</div>
                <p className="text-xs text-muted-foreground mt-2 leading-snug max-w-[180px] mx-auto text-center font-normal">
                  Track your progress and master this topic.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border/80 rounded-xl p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center min-w-[200px] sm:min-w-[220px] w-full md:w-auto">
                <div className="w-full bg-emerald-600/90 text-white font-medium py-2 px-4 rounded-lg shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 select-none">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 stroke-[2]" />
                  <span>Enrolled</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-snug max-w-[180px] mx-auto text-center font-normal">
                  Your progress is automatically saved.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SheetHeroContainer;
