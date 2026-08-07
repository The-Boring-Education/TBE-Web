import {
  ActionBanner,
  Alert,
  Button,
  CertificateBanner,
  ChapterLink,
  ContentFeedbackWidget,
  CourseHeroContainer,
  FeedbackPopup,
  LinerProgressBar,
  LoadingSpinner,
  MDXRenderer,
  SEO,
  Text,
} from '@tbe/components';
import { routes, SCREEN_BREAKPOINTS } from '@tbe/constants';
import {
  calculateUserPointsForAction,
  useGamificationContext,
  useGamifiedAction,
} from '@tbe/gamification';
import { useAnalytics, useMediaQuery, useUser } from '@tbe/hooks';
import type {
  AddCertificateRequestPayloadProps,
  CoursePageProps,
} from '@tbe/interface';
import { queryKeys, useMutation, useQueryClient } from '@tbe/query';
import { formatDate, getCoursePageProps, sendRequest } from '@tbe/utils';
import { BookOpen } from 'lucide-react';
import router from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { FaLock, FaTrophy } from 'react-icons/fa';

const CoursePage = ({
  course,
  meta,
  slug,
  seoMeta,
  currentChapterId,
}: CoursePageProps) => {
  const [courseMeta, setCourseMeta] = useState<string>(meta || '');
  const [chapters, setChapters] = useState(course.chapters || []);
  const firstChapterId = chapters?.[0]?._id?.toString() || '';
  const [currentChapterIdState, setCurrentChapterIdState] = useState(
    currentChapterId || firstChapterId,
  );
  const [isChapterCompleted, setIsChapterCompleted] = useState(
    chapters.find((chapter) => chapter._id.toString() === currentChapterIdState)
      ?.isCompleted,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(
    course.isCompleted ?? false,
  );
  const [certificateId, setCertificateId] = useState(course.certificateId);
  const isSmallScreen = useMediaQuery(SCREEN_BREAKPOINTS.SM);

  const [showChapterFeedback, setShowChapterFeedback] = useState(false);
  const [showCourseFeedback, setShowCourseFeedback] = useState(false);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  // All courses are free now - only check enrollment
  const isLocked = !course?.isEnrolled;

  // Calculate the total chapters and completed chapters
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(
    (chapter) => chapter.isCompleted,
  ).length;

  // Check if all chapters are completed and update course completion status
  const checkCourseCompletion = () => {
    const allChaptersCompleted =
      chapters.length > 0 && chapters.every((chapter) => chapter.isCompleted);
    if (allChaptersCompleted && !isCourseCompleted) {
      setIsCourseCompleted(true);
    }
  };

  // Generate certificate if all chapters are completed but no certificate exists
  const generateCertificateIfNeeded = async () => {
    const allChaptersCompleted =
      chapters.length > 0 && chapters.every((chapter) => chapter.isCompleted);
    if (
      allChaptersCompleted &&
      !certificateId &&
      user?.id &&
      !isGeneratingCertificate
    ) {
      setIsGeneratingCertificate(true);
      try {
        const { status, data } = await makeRequest({
          method: 'POST',
          url: routes.api.certificate,
          body: {
            type: 'SHIKSHA',
            userId: user.id,
            userName: user.name,
            programId: course._id,
            programName: course.name,
            date: formatDate({
              dateFormat: {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              },
            }).date,
          } as AddCertificateRequestPayloadProps,
        });

        if (status && data?._id) {
          setCertificateId(data._id);
          console.log('Certificate generated:', data._id);
        }
      } catch (error) {
        console.error('Error generating certificate:', error);
      } finally {
        setIsGeneratingCertificate(false);
      }
    }
  };

  useEffect(() => {
    const currentChapter = chapters.find(
      (chapter) => chapter._id.toString() === currentChapterIdState,
    );
    setIsChapterCompleted(currentChapter?.isCompleted);

    if (currentChapter) {
      setCourseMeta(currentChapter.content);
    }

    // Check course completion status
    checkCourseCompletion();

    // Generate certificate if needed
    generateCertificateIfNeeded();

    // Show feedback popup if all chapters are completed
    const allCompleted =
      chapters.length > 0 && chapters.every((c) => c.isCompleted);

    if (allCompleted && !showChapterFeedback) {
      // Trigger course completion celebration
      gamifiedAction.triggerGamifiedAction({
        gamificationAction: 'COMPLETE_COURSE_CERTIFICATE',
        analytics: {
          action: 'CERTIFICATE_GENERATED',
          category: 'Achievement',
          label: 'Certificate Generated',
        },
        celebrationType: 'achievement',
        customMessage: 'Congratulations! Course completed!',
        metadata: {
          courseId: course._id,
          courseName: course.name,
          totalChapters: chapters.length,
        },
      });
    }

    setShowChapterFeedback(allCompleted);
  }, [currentChapterIdState, chapters]);

  // Generate certificate when user is available and all chapters are completed
  useEffect(() => {
    if (user?.id && chapters.length > 0) {
      generateCertificateIfNeeded();
    }
  }, [user?.id, chapters, certificateId]);

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const queryClient = useQueryClient();
  const { triggerCelebration, showToast } = useGamificationContext();

  if (!course) return null;

  const handleChapterClick = (chapterMeta: string, chapterId: string) => {
    if (!isLocked) {
      setCourseMeta(chapterMeta);
      setCurrentChapterIdState(chapterId);

      // Track chapter start
      trackEvent({
        action: 'COURSE_CHAPTER_START',
        category: 'Learning',
        label: 'Chapter Started',
        value: {
          userId: user?.id,
          courseId: course._id,
          chapterId,
        },
      });
    }
  };

  const handleFeedbackComplete = () => {
    setShowChapterFeedback(false);
  };

  const toggleCompletion = async () => {
    // Don't allow completion if user is not enrolled
    if (!course.isEnrolled) {
      return;
    }

    setIsLoading(true);
    try {
      const newCompletionStatus = !isChapterCompleted;

      const response = await makeRequest({
        method: 'PATCH',
        url: routes.api.markCourseChapterAsCompleted,
        body: {
          userId: user?.id,
          courseId: course._id,
          chapterId: currentChapterIdState,
          isCompleted: newCompletionStatus,
        },
      });

      // Only proceed if the API call was successful
      if (response?.status) {
        if (newCompletionStatus) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.gamification.points(user?.id ?? ''),
          });
          const pointsEarned = calculateUserPointsForAction(
            'COMPLETE_COURSE_CHAPTER',
          );
          const intensity =
            pointsEarned >= 50 ? 'high' : pointsEarned >= 20 ? 'medium' : 'low';
          triggerCelebration({ type: 'points', intensity });
          showToast({
            type: 'points',
            message: 'Chapter completed! Keep learning!',
            points: pointsEarned,
          });
          trackEvent({
            action: 'COURSE_CHAPTER_COMPLETE',
            category: 'Learning',
            label: 'Chapter Completed',
            value: {
              userId: user?.id,
              courseId: course._id,
              chapterId: currentChapterIdState,
              courseName: course.name,
            },
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.gamification.points(user?.id ?? ''),
          });
          trackEvent({
            action: 'COURSE_PROGRESS',
            category: 'Course',
            label: 'Course Progress',
            value: {
              userId: user?.id,
              courseId: course._id,
            },
          });
        }

        // Update local state (mark chapter completed)
        const updatedChapters = chapters.map((chapter) =>
          chapter._id.toString() === currentChapterIdState
            ? { ...chapter, isCompleted: newCompletionStatus }
            : chapter,
        );

        setChapters(updatedChapters);
        setIsChapterCompleted(newCompletionStatus);

        // Check if course is now completed
        const allChaptersCompleted = updatedChapters.every(
          (chapter) => chapter.isCompleted,
        );
        if (allChaptersCompleted && !isCourseCompleted) {
          setIsCourseCompleted(true);
        }

        // Move to next chapter if completed
        if (newCompletionStatus) {
          // Show feedback popup for chapter completion
          setShowChapterFeedback(true);

          // Find next incomplete chapter
          const currentIndex = chapters.findIndex(
            (c) => c._id.toString() === currentChapterIdState,
          );

          const next =
            chapters.slice(currentIndex + 1).find((c) => !c.isCompleted) ||
            chapters.find((c) => !c.isCompleted); // Loop to beginning if none left

          if (next) {
            const chapterId = next._id.toString();
            setCurrentChapterIdState(chapterId);
            setCourseMeta(next.content);

            // Auto-scroll to content section for better UX
            setTimeout(() => {
              contentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            // All chapters completed - generate certificate
            const { status, data } = await makeRequest({
              method: 'POST',
              url: routes.api.certificate,
              body: {
                type: 'SHIKSHA',
                userId: user?.id,
                userName: user?.name,
                programId: course._id,
                programName: course.name,
                date: formatDate({
                  dateFormat: {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  },
                }).date,
              } as AddCertificateRequestPayloadProps,
            });

            if (status && data?._id) {
              setIsCourseCompleted(true);
              setCertificateId(data._id);
              setShowCourseFeedback(true);

              // Trigger course completion celebration
              await gamifiedAction.triggerGamifiedAction({
                gamificationAction: 'COMPLETE_COURSE_CERTIFICATE',
                analytics: {
                  action: 'CERTIFICATE_GENERATED',
                  category: 'Achievement',
                  label: 'Certificate Generated',
                },
                celebrationType: 'achievement',
                customMessage: 'Congratulations! Course completed!',
                metadata: {
                  courseId: course._id,
                  courseName: course.name,
                  certificateId: data._id,
                },
              });
            }
          }
        }
      } else {
        // Handle API error - don't update local state
        console.error(
          'Failed to update chapter completion:',
          response?.message,
        );
      }
    } catch (error) {
      console.error('Error toggling chapter completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const alertContainer = isSmallScreen && (
    <div className='max-w-7xl mx-auto px-4 pt-4'>
      <Alert
        className='rounded-xl border border-amber-200 bg-amber-50 text-amber-800'
        message='This course includes hands-on code examples. We recommend using a laptop or desktop for the best experience.'
        type='INFO'
      />
    </div>
  );

  // Show small loader if data is not ready
  const isDataLoading = !course || !chapters || chapters.length === 0;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <div className='bg-background min-h-screen font-body text-foreground'>
        {alertContainer}

        {/* Hero Section */}
        <CourseHeroContainer
          id={course._id ?? ''}
          isEnrolled={course.isEnrolled}
          isPremium={false}
          name={course.name ?? ''}
          slug={slug || course.slug || ''}
          completedChapters={completedChapters}
          totalChapters={totalChapters}
        />

        {isDataLoading && (
          <div className='max-w-7xl mx-auto px-4 py-16 text-center'>
            <div className='inline-flex items-center justify-center gap-3 bg-card border border-border px-6 py-4 rounded-xl shadow-xs'>
              <LoadingSpinner height={6} width={6} />
              <Text
                level='p'
                className='text-muted-foreground font-medium text-sm'
              >
                Loading course content...
              </Text>
            </div>
          </div>
        )}

        {!isDataLoading && (
          <div
            id='course-content'
            className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10'
            ref={contentSectionRef}
          >
            <div className='flex flex-col lg:flex-row gap-8 items-start'>
              {/* Left Sidebar (Chapters Navigation) */}
              <aside className='w-full lg:w-96 xl:w-[420px] shrink-0 self-start sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-2'>
                <div className='w-full sticky top-0 bg-card z-10 pb-2 border-b border-border/60 space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <h2 className='font-headings font-bold text-lg text-foreground'>
                      Chapters
                    </h2>
                    <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
                      {chapters.length} chapters
                    </span>
                  </div>
                  {!isLocked && (
                    <LinerProgressBar
                      completedChapters={completedChapters}
                      totalChapters={totalChapters}
                    />
                  )}
                </div>

                {/* Chapter List */}
                <div className='flex flex-col gap-1 flex-1 overflow-y-auto pt-1'>
                  {chapters?.map(
                    ({ _id, name, content, isCompleted }, index) => {
                      const chapterId = _id?.toString();

                      return (
                        <ChapterLink
                          key={chapterId}
                          chapterId={chapterId}
                          content={content}
                          currentChapterId={currentChapterIdState}
                          handleChapterClick={handleChapterClick}
                          href='#'
                          isCompleted={isCompleted}
                          name={`${index + 1}. ${name}`}
                          isLocked={isLocked}
                        />
                      );
                    },
                  )}
                </div>

                {/* Bottom Banners */}
                {!isLocked && (
                  <div className='pt-3 border-t border-border/60 space-y-2'>
                    <CertificateBanner
                      backgroundColor={
                        isCourseCompleted ? 'bg-purple-600' : 'bg-purple-400'
                      }
                      heading={
                        isGeneratingCertificate
                          ? 'Generating Certificate...'
                          : isCourseCompleted
                            ? 'View Certificate'
                            : 'Certificate Locked'
                      }
                      icon={isCourseCompleted ? FaTrophy : FaLock}
                      isLocked={!isCourseCompleted || isGeneratingCertificate}
                      subtext={
                        isGeneratingCertificate
                          ? 'Generating your verified certificate...'
                          : isCourseCompleted
                            ? 'Download your course certificate'
                            : 'Complete all chapters to unlock'
                      }
                      onClick={() => {
                        if (
                          isCourseCompleted &&
                          certificateId &&
                          !isGeneratingCertificate
                        ) {
                          router.push(`/certificate/${certificateId}`);
                        }
                      }}
                    />

                    {isCourseCompleted && (
                      <ActionBanner
                        backgroundColor='bg-blue-400'
                        heading='Start Interview Prep'
                        icon={FaTrophy}
                        isLocked={false}
                        subtext='Prepare for coding interviews next'
                        onClick={() => {
                          router.push(routes.interviewPrep);
                        }}
                      />
                    )}
                  </div>
                )}
              </aside>

              {/* Main Content Viewer */}
              <main className='flex-1 w-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs min-h-[500px]'>
                {isLocked ? (
                  <div className='w-full space-y-6'>
                    <div>
                      <h2 className='font-headings font-bold text-2xl text-foreground mb-4'>
                        Course Overview
                      </h2>
                      <div className='prose prose-slate max-w-none'>
                        <MDXRenderer mdxSource={course.meta || ''} />
                      </div>
                    </div>

                    <div className='rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex items-start gap-3'>
                      <div className='text-primary shrink-0 mt-1'>
                        <BookOpen className='w-5 h-5 text-primary' />
                      </div>
                      <div className='space-y-1 flex-1'>
                        <h3 className='font-headings font-bold text-base text-foreground'>
                          Enroll to Access Course
                        </h3>
                        <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                          This course is 100% free! Simply enroll to access all
                          chapters, track your learning progress, and claim your
                          certificate.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='w-full space-y-6'>
                    <MDXRenderer
                      mdxSource={courseMeta}
                      actions={
                        currentChapterIdState
                          ? [
                              <Button
                                key='complete'
                                className='w-fit mt-4 px-6 py-2.5 rounded-lg font-semibold shadow-xs'
                                isLoading={isLoading}
                                disabled={!course.isEnrolled}
                                text={
                                  isLoading
                                    ? 'Marking...'
                                    : !course.isEnrolled
                                      ? 'Enroll to Mark Complete'
                                      : isChapterCompleted
                                        ? 'Completed'
                                        : 'Mark As Completed'
                                }
                                variant={
                                  isChapterCompleted
                                    ? 'SUCCESS'
                                    : !course.isEnrolled
                                      ? 'SECONDARY'
                                      : isLoading
                                        ? 'SECONDARY'
                                        : 'PRIMARY'
                                }
                                onClick={toggleCompletion}
                              />,
                            ]
                          : []
                      }
                    />
                  </div>
                )}
              </main>
            </div>
          </div>
        )}

        {showChapterFeedback && (
          <FeedbackPopup
            refId={currentChapterIdState}
            type='SHIKSHA_CHAPTER'
            onSubmit={handleFeedbackComplete}
          />
        )}

        {showCourseFeedback && (
          <FeedbackPopup refId={course._id} type='SHIKSHA_COURSE' />
        )}

        {/* Per-chapter feedback widget */}
        {currentChapterIdState && course.isEnrolled && (
          <ContentFeedbackWidget
            contentType='SHIKSHA_CHAPTER'
            contentId={currentChapterIdState}
            title='Rate this chapter'
            meta={{
              courseId: course._id.toString(),
              courseName: course.name || course.title || '',
              chapterId: currentChapterIdState,
              chapterName:
                chapters.find((c) => c._id.toString() === currentChapterIdState)
                  ?.title || '',
            }}
            theme='light'
          />
        )}
      </div>
    </Fragment>
  );
};

export const getServerSideProps = getCoursePageProps;

export default CoursePage;
