import {
  Button,
  LinkButton,
  LinerProgressBar,
  LoginRedirectButton,
  Section,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useGamifiedAction } from "@tbe/gamification";
import { useAnalytics, useApi, useUser } from "@tbe/hooks";
import type { CourseHeroContainerProps } from "@tbe/interface";
import { FaCertificate, FaPlay, FaUsers } from "react-icons/fa";

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
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2"
      />
    );
  }

  if (loading) {
    headerActionButton = (
      <Button
        isLoading
        text="Enrolling..."
        variant="PRIMARY"
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2"
      />
    );
  }

  return (
    <Section className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left: Greeting & Course Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Navigation */}
            <div className="flex items-center gap-2 text-blue-200">
              <LinkButton
                buttonProps={{
                  variant: "GHOST",
                  text: "← Back to Courses",
                  className: "text-black hover:text-black",
                }}
                href={routes.shikshaExplore}
              />
              <span>•</span>
              <Text level="p" className="text-sm uppercase tracking-wide">
                Learning Track
              </Text>
            </div>

            {/* Welcome Message */}
            <div className="space-y-2">
              <Text className="text-2xl lg:text-3xl font-bold" level="h2">
                Hello {user?.name ?? "there"}! 👋
              </Text>
              <Text level="p" className="text-blue-100 text-lg">
                Ready to learn something amazing today?
              </Text>
            </div>

            {/* Course Title */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Text
                level="p"
                className="text-blue-200 text-sm uppercase tracking-wide mb-1"
              >
                YOU'RE LEARNING
              </Text>
              <Text
                className="text-xl lg:text-2xl font-bold text-white"
                level="h3"
              >
                {name}
              </Text>
            </div>

            {/* Course Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FaPlay className="text-green-400" />
                <span>Free Course</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-blue-400" />
                <span>Self-paced</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCertificate className="text-yellow-400" />
                <span>Certificate Included</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {headerActionButton}
              {isEnrolled && (
                <Button
                  text="Course Overview"
                  variant="OUTLINE"
                  className="border-white text-white hover:bg-white hover:text-emerald-600"
                  onClick={() => {
                    // Scroll to the course content section with offset
                    const contentSection =
                      document.getElementById("course-content");
                    if (contentSection) {
                      const offset = 80; // Account for any fixed headers
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

          {/* Right: Progress Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
              {isEnrolled && totalChapters > 0 ? (
                <div className="space-y-4">
                  <Text level="p" className="font-semibold text-lg text-center">
                    Your Progress
                  </Text>
                  <LinerProgressBar
                    completedChapters={completedChapters}
                    totalChapters={totalChapters}
                  />
                  <Button
                    text={completedChapters > 0 ? "Continue Learning" : "Start Learning"}
                    variant="PRIMARY"
                    className="w-full bg-emerald-600"
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
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <FaPlay className="text-2xl text-emerald-600" />
                  </div>
                  <Text level="p" className="font-semibold text-lg">
                    Start Learning
                  </Text>
                  <Text level="p" className="text-sm text-gray-600">
                    Begin your journey with bite-sized lessons
                  </Text>
                  {!isEnrolled && (
                    <Text
                      level="p"
                      className="text-emerald-600 text-sm font-medium"
                    >
                      Enroll to get started
                    </Text>
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
