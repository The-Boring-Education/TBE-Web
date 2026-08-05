import {
  Button,
  LinkButton,
  LoginRedirectButton,
  Section,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useGamifiedAction } from "@tbe/gamification";
import { useAnalytics, useApi, useUser } from "@tbe/hooks";
import type { SheetHeroContainerProps } from "@tbe/interface";

const SheetHeroContainer = ({
  id,
  name,
  isEnrolled,
  isPremium,
  isPurchased,
  redirectTo,
  backHref,
  theme,
}: SheetHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

  const { makeRequest, loading } = useApi("interview-prep/enrollSheet");

  const enrollSheet = () => {
    makeRequest({
      method: "POST",
      url: routes.api.enrollSheet,
      body: {
        userId: user?.id,
        sheetId: id,
      },
    })
      .then(async () => {
        trackEvent({
          action: "INTERVIEW_SHEET_ENROLL",
          category: "InterviewSheet",
          label: "Interview Sheet Enrolled",
          value: {
            userId: user?.id,
            sheetId: id,
          },
        });

        await gamifiedAction.triggerGamifiedAction({
          gamificationAction: "ENROLL_SHEET",
          analytics: {
            action: "INTERVIEW_SHEET_ENROLL",
            category: "InterviewSheet",
            label: "Interview Sheet Enrolled",
          },
          customMessage: "Interview sheet enrolled! Time to practice!",
          metadata: {
            sheetId: id,
            sheetName: name,
          },
        });

        setTimeout(() => {
          if (redirectTo) {
            window.location.href = redirectTo;
          } else {
            window.location.reload();
          }
        }, 1500);
      })
      .catch((error) => error);
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = <LoginRedirectButton text="Login to Get Started" />;
  } else if (isAuth && !isEnrolled && !isPremium) {
    headerActionButton = (
      <Button
        text="Enroll in Sheet"
        variant="PRIMARY"
        onClick={enrollSheet}
        className="px-6 py-2 rounded-lg font-semibold shadow-xs"
      />
    );
  } else if (isAuth && !isEnrolled && isPremium && isPurchased) {
    headerActionButton = (
      <Button
        text="Enroll in Sheet"
        variant="PRIMARY"
        onClick={enrollSheet}
        className="px-6 py-2 rounded-lg font-semibold shadow-xs"
      />
    );
  }

  if (loading) {
    headerActionButton = (
      <Button
        isLoading
        text="Enrolling..."
        variant="PRIMARY"
        className="px-6 py-2 rounded-lg font-semibold shadow-xs"
      />
    );
  }

  return (
    <Section className="bg-background border-b border-border/60 text-foreground py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LinkButton
                buttonProps={{
                  variant: "GHOST",
                  text: "← Back to Explore",
                  className:
                    "text-muted-foreground hover:text-foreground font-medium p-0 h-auto bg-transparent hover:bg-transparent shadow-none border-none text-xs",
                }}
                href={backHref ?? routes.interviewPrepExplore}
              />
            </div>
            <div className="space-y-1">
              <Text
                className="text-xs font-semibold text-primary uppercase tracking-wide"
                level="p"
              >
                Practice Track · {name}
              </Text>
              <h1 className="font-headings font-bold text-2xl sm:text-3xl text-foreground">
                Hello {user?.name ?? "Learner"}! 👋
              </h1>
            </div>
          </div>

          <div>{headerActionButton}</div>
        </div>
      </div>
    </Section>
  );
};

export default SheetHeroContainer;
