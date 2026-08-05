import {
  Button,
  LinerProgressBar,
  LinkButton,
  LoginRedirectButton,
  Section,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useGamifiedAction } from "@tbe/gamification";
import { useAnalytics, useApi, useUser } from "@tbe/hooks";
import type { CourseHeroContainerProps } from "@tbe/interface";
import { Award, BookOpen, GraduationCap, Play } from "lucide-react";

const CourseHeroContainer = ({
  id,
  name,
  isEnrolled,
  isPremium,
  completedChapters = 0,
  totalChapters = 0,
}: CourseHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

  const { makeRequest, loading } = useApi("shiksha/enrollCourse");

  const enrollCourse = async () => {
    try {
      await makeRequest({
        method: "POST",
        url: routes.api.enrollCourse,
        body: {
          userId: user?.id,
          courseId: id,
        },
      });

      // Use gamified action for course enrollment
      await gamifiedAction.triggerGamifiedAction({
        gamificationAction: "ENROLL_COURSE",
        analytics: {
          action: "COURSE_ENROLL",
          category: "User",
          label: "Course Enrolled",
        },
        customMessage: "Welcome to the course! Let's start learning!",
        metadata: {
          courseId: id,
          courseName: name,
        },
      });

      window.location.reload();
    } catch (error) {
      console.error("Failed to enroll", error);
    }
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = <LoginRedirectButton text="Login to Get Started" />;
  } else if (isAuth && !isEnrolled && !isPremium) {
    headerActionButton = (
      <Button
        text="Enroll to Course"
        variant="PRIMARY"
        onClick={enrollCourse}
        className="px-6 py-2.5 rounded-lg font-semibold shadow-xs"
      />
    );
  }

  if (loading) {
    headerActionButton = (
      <Button
        isLoading
        text="Enrolling..."
        variant="PRIMARY"
        className="px-6 py-2.5 rounded-lg font-semibold shadow-xs"
      />
    );
  }

  return (
    <Section className="bg-background border-b border-border/60 text-foreground py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Greeting & Course Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Navigation */}
            <div>
              <LinkButton
                buttonProps={{
                  variant: "GHOST",
                  text: "← Back to Shiksha Courses",
                  className:
                    "text-muted-foreground hover:text-foreground font-medium p-0 h-auto bg-transparent hover:bg-transparent shadow-none border-none text-xs",
                }}
                href={routes.shikshaExplore}
              />
            </div>

            {/* Welcome & Title Header */}
            <div className="space-y-2">
              <Text
                className="text-sm font-semibold tracking-wide text-primary uppercase"
                level="p"
              >
                Welcome {user?.name ? `${user.name}!` : "Learner!"} 👋
              </Text>
              <h1 className="font-headings font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight">
                {name}
              </h1>
              <Text
                level="p"
                className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed"
              >
                Master problem-solving and fundamental algorithms through
                bite-sized interactive lessons and practical coding challenges.
              </Text>
            </div>

            {/* Course Attribute Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="inline-flex items-center gap-2 bg-card border border-border text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs">
                <Play className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>100% Free Course</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-card border border-border text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Self-Paced Learning</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-card border border-border text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs">
                <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Verified Certificate</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {headerActionButton}
              {isEnrolled && (
                <Button
                  text="Course Overview"
                  variant="OUTLINE"
                  className="border-border text-foreground hover:bg-muted px-5 py-2.5 rounded-lg font-medium"
                  onClick={() => {
                    const contentSection =
                      document.getElementById("course-content");
                    if (contentSection) {
                      const offset = 80;
                      const elementPosition = contentSection.offsetTop - offset;
                      window.scrollTo({
                        top: elementPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Right: Modern Progress Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl shadow-xs p-6 text-foreground space-y-4">
              {isEnrolled && totalChapters > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Text
                      level="p"
                      className="font-semibold text-base font-headings text-foreground"
                    >
                      Your Progress
                    </Text>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      {Math.round((completedChapters / totalChapters) * 100)}%
                      Complete
                    </span>
                  </div>
                  <LinerProgressBar
                    completedChapters={completedChapters}
                    totalChapters={totalChapters}
                  />
                  <Button
                    text={
                      completedChapters > 0
                        ? "Continue Learning"
                        : "Start Learning"
                    }
                    variant="PRIMARY"
                    className="w-full py-2.5 rounded-lg font-semibold shadow-xs"
                    onClick={() => {
                      const contentSection =
                        document.getElementById("course-content");
                      if (contentSection) {
                        const offset = 80;
                        window.scrollTo({
                          top: contentSection.offsetTop - offset,
                          behavior: "smooth",
                        });
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center space-y-3 py-2">
                  <div className="flex items-center justify-center mx-auto text-primary">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <Text
                      level="p"
                      className="font-headings font-bold text-lg text-foreground"
                    >
                      Ready to Start?
                    </Text>
                    <Text
                      level="p"
                      className="text-xs text-muted-foreground max-w-xs mx-auto"
                    >
                      Enroll now to track your progress and earn a course
                      certificate upon completion.
                    </Text>
                  </div>
                  {!isEnrolled && (
                    <p className="text-primary text-xs font-semibold pt-1">
                      Free Access • No Card Required
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CourseHeroContainer;
