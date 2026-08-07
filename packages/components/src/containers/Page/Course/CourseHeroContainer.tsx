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
import { useMemo } from "react";

const getCourseTechIcons = (
  courseSlug?: string,
  courseName?: string,
): { urls: string[]; isMathLogo: boolean } => {
  const text = `${courseSlug || ""} ${courseName || ""}`.toLowerCase();

  // Backend Dev Journey -> Node.js + Express.js stacked
  if (
    text.includes("backend") ||
    text.includes("node") ||
    text.includes("express")
  ) {
    return {
      urls: [
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
      ],
      isMathLogo: false,
    };
  }

  // Front-end Dev Journey -> React logo
  if (
    text.includes("front-end") ||
    text.includes("frontend") ||
    text.includes("react")
  ) {
    return {
      urls: [
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      ],
      isMathLogo: false,
    };
  }

  // Programming Journey with JS -> JavaScript logo
  if (
    text.includes("journey with js") ||
    text.includes("javascript") ||
    text.includes("js")
  ) {
    return {
      urls: [
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      ],
      isMathLogo: false,
    };
  }

  // Logic Building For Everyone -> Math & Logic symbol logo
  if (
    text.includes("logic") ||
    text.includes("building") ||
    text.includes("math")
  ) {
    return { urls: [], isMathLogo: true };
  }

  return { urls: [], isMathLogo: false };
};

const CourseHeroContainer = ({
  id,
  name,
  slug,
  isEnrolled,
  isPremium,
  completedChapters = 0,
  totalChapters = 0,
}: CourseHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

  const { urls: techIconUrls, isMathLogo } = useMemo(
    () => getCourseTechIcons(slug, name),
    [slug, name],
  );

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
        text="Enroll in Course →"
        variant="PRIMARY"
        onClick={enrollCourse}
        className="px-8 py-3.5 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-none"
      />
    );
  }

  if (loading) {
    headerActionButton = (
      <Button
        isLoading
        text="Enrolling..."
        variant="PRIMARY"
        className="px-8 py-3.5 text-base font-bold rounded-xl shadow-lg bg-gradient-to-r from-red-500 to-rose-600 text-white border-none"
      />
    );
  }

  return (
    <div className="relative min-h-[420px] bg-background overflow-hidden selection:bg-primary/20">
      {/* Background Layer: Dot Density Patterns, Curved Wave Accent Lines & Technology / Math Logo */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Soft Ambient Hero Spotlights */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-rose-500/15 via-red-500/10 to-transparent blur-3xl opacity-80 rounded-full" />
        <div className="absolute top-[20%] -left-32 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-[50%] -right-32 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full" />

        {/* Top-Left Side Dot Grid Density Pattern */}
        <div className="hidden sm:block absolute top-6 left-6 w-36 h-36 opacity-30 dark:opacity-20 pointer-events-none">
          <svg className="w-full h-full text-rose-500/50" fill="currentColor">
            <pattern
              id="course-dots-left"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#course-dots-left)" />
          </svg>
        </div>

        {/* Top-Right Side Dot Grid Density Pattern */}
        <div className="hidden sm:block absolute top-6 right-6 w-44 h-44 opacity-35 dark:opacity-25 pointer-events-none">
          <svg className="w-full h-full text-rose-500/50" fill="currentColor">
            <pattern
              id="course-dots-right"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#course-dots-right)" />
          </svg>
        </div>

        {/* Soft Wave Accent Lines */}
        <svg
          className="absolute -top-10 right-0 w-[650px] h-[550px] opacity-25 dark:opacity-15 pointer-events-none"
          viewBox="0 0 650 550"
          fill="none"
        >
          <path
            d="M0 120 Q 325 220 650 70 T 1300 120"
            stroke="url(#course-wave-grad)"
            strokeWidth="1.5"
          />
          <path
            d="M0 170 Q 325 270 650 120 T 1300 170"
            stroke="url(#course-wave-grad)"
            strokeWidth="1"
          />
          <path
            d="M0 220 Q 325 320 650 170 T 1300 220"
            stroke="url(#course-wave-grad)"
            strokeWidth="0.8"
          />
          <defs>
            <linearGradient
              id="course-wave-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Watermarked Math Logo for Logic Building */}
        {isMathLogo && (
          <div className="absolute top-[260px] -left-6 sm:top-[240px] sm:-left-8 lg:top-[200px] lg:-left-12 pointer-events-none select-none z-0">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/15 blur-3xl rounded-full scale-125" />
              <svg
                className="w-28 h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-72 lg:h-72 text-rose-500 opacity-25 dark:opacity-20 rotate-[-12deg] transition-all duration-300"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 25 H80 M35 25 L65 50 L35 75 M20 75 H80" />
              </svg>
            </div>
          </div>
        )}

        {/* Floating Watermarked Technology Logos (Bottom Left of Hero, Mobile Responsive) */}
        {techIconUrls.length > 0 && (
          <div className="absolute top-[260px] -left-6 sm:top-[240px] sm:-left-8 lg:top-[200px] lg:-left-12 pointer-events-none select-none z-0">
            <div className="relative flex flex-col items-center gap-2 sm:gap-3">
              <div className="absolute inset-0 bg-rose-500/15 blur-3xl rounded-full scale-125" />
              {techIconUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt=""
                  className={`${
                    techIconUrls.length > 1
                      ? "w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44"
                      : "w-28 h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-72 lg:h-72"
                  } object-contain opacity-25 dark:opacity-20 rotate-[-12deg] transition-all duration-300`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Page Content Layer */}
      <div className="relative z-10">
        <Section className="relative bg-transparent border-b border-border/80 text-foreground py-10 sm:py-14">
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

                {/* Title & Description Header */}
                <div className="space-y-2">
                  <h1 className="font-headings font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight">
                    {name}
                  </h1>
                  <Text
                    level="p"
                    className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed"
                  >
                    Master problem-solving and fundamental software engineering
                    concepts through bite-sized interactive lessons.
                  </Text>
                </div>

                {/* Course Attribute Pills */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/80 text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs hover:border-rose-500/40 transition-all">
                    <Play className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>100% Free Course</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/80 text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs hover:border-rose-500/40 transition-all">
                    <GraduationCap className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Self-Paced Learning</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/80 text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs hover:border-rose-500/40 transition-all">
                    <Award className="w-3.5 h-3.5 text-rose-500 shrink-0" />
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
                      className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      onClick={() => {
                        const contentSection =
                          document.getElementById("course-content");
                        if (contentSection) {
                          const offset = 80;
                          const elementPosition =
                            contentSection.offsetTop - offset;
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
                <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl shadow-xl p-6 sm:p-8 text-foreground space-y-5 relative overflow-hidden">
                  {isEnrolled && totalChapters > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Text
                          level="p"
                          className="font-semibold text-base font-headings text-foreground"
                        >
                          Your Progress
                        </Text>
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                          {Math.round(
                            (completedChapters / totalChapters) * 100,
                          )}
                          % Complete
                        </span>
                      </div>
                      <LinerProgressBar
                        completedChapters={completedChapters}
                        totalChapters={totalChapters}
                      />
                      <Button
                        text={
                          completedChapters > 0
                            ? "Continue Learning →"
                            : "Start Learning →"
                        }
                        variant="PRIMARY"
                        className="w-full py-3 rounded-xl font-bold text-sm shadow-lg bg-gradient-to-r from-red-500 to-rose-600 text-white border-none"
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
                      <div className="flex items-center justify-center mx-auto text-rose-500">
                        <BookOpen className="w-10 h-10 text-rose-500" />
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
                        <p className="text-rose-600 dark:text-rose-400 text-xs font-bold pt-1">
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
      </div>
    </div>
  );
};

export default CourseHeroContainer;
