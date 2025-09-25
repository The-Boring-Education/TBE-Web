import router from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { FaLock, FaTrophy } from 'react-icons/fa';

import {
  ActionBanner,
  Alert,
  Button,
  CertificateBanner,
  ChapterLink,
  CourseHeroContainer,
  FeedbackPopup,
  FlexContainer,
  LinerProgressBar,
  MDXRenderer,
  Section,
  SEO,
  Text,
} from '@/components';
import { useGamificationContext } from '@/components/layout/GamificationProvider';
import { routes, SCREEN_BREAKPOINTS } from '@/constant';
import {
  useAnalytics,
  useApi,
  useGamifiedAction,
  useMediaQuery,
  useUser,
} from '@/hooks';
import type {
  AddCertificateRequestPayloadProps,
  CoursePageProps,
} from '@/interfaces';
import { formatDate, getCoursePageProps } from '@/utils';

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
  const [currentChapterIdState, setCurrentChapterIdState] = useState(currentChapterId || firstChapterId);
  const [isChapterCompleted, setIsChapterCompleted] = useState(
    chapters.find((chapter) => chapter._id.toString() === currentChapterIdState)
      ?.isCompleted
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(
    course.isCompleted ?? false
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
    (chapter) => chapter.isCompleted
  ).length;

  // Check if all chapters are completed and update course completion status
  const checkCourseCompletion = () => {
    const allChaptersCompleted = chapters.length > 0 && chapters.every(chapter => chapter.isCompleted);
    if (allChaptersCompleted && !isCourseCompleted) {
      setIsCourseCompleted(true);
    }
  };

  // Generate certificate if all chapters are completed but no certificate exists
  const generateCertificateIfNeeded = async () => {
    const allChaptersCompleted = chapters.length > 0 && chapters.every(chapter => chapter.isCompleted);
    if (allChaptersCompleted && !certificateId && user?.id && !isGeneratingCertificate) {
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
      (chapter) => chapter._id.toString() === currentChapterIdState
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

  const { makeRequest } = useApi(`shiksha/${slug}`);
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
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
        // Fire gamified action on completion
        if (newCompletionStatus) {
          await gamifiedAction.triggerGamifiedAction({
            gamificationAction: 'COMPLETE_COURSE_CHAPTER',
            analytics: {
              action: 'COURSE_CHAPTER_COMPLETE',
              category: 'Learning',
              label: 'Chapter Completed',
            },
            customMessage: 'Chapter completed! Keep learning!',
            metadata: {
              courseId: course._id,
              chapterId: currentChapterIdState,
              courseName: course.name,
            },
          });
        } else {
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
            : chapter
        );

        setChapters(updatedChapters);
        setIsChapterCompleted(newCompletionStatus);

        // Check if course is now completed
        const allChaptersCompleted = updatedChapters.every(chapter => chapter.isCompleted);
        if (allChaptersCompleted && !isCourseCompleted) {
          setIsCourseCompleted(true);
        }

        // Move to next chapter if completed
        if (newCompletionStatus) {
          // Show feedback popup for chapter completion
          setShowChapterFeedback(true);
          
          // Find next incomplete chapter
          const currentIndex = chapters.findIndex(
            (c) => c._id.toString() === currentChapterIdState
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
        console.error('Failed to update chapter completion:', response?.message);
      }
    } catch (error) {
      console.error('Error toggling chapter completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const alertContainer = isSmallScreen && (
    <Alert
      className='my-2'
      message='This Course will require you to write Code. Better open it on Laptop'
      type='INFO'
    />
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:p-2 p-2'>
        {alertContainer}
        <CourseHeroContainer
          id={course._id ?? ''}
          isEnrolled={course.isEnrolled}
          isPremium={false}
          name={course.name ?? ''}
        />
      </Section>

      <Section id='course-content' className='md:p-2 p-2'>
        <div ref={contentSectionRef}>
          <FlexContainer className='w-full gap-4' itemCenter={false}>
            {/* Left Sidebar (Chapters) */}
            <FlexContainer
              className='border md:w-3/12 w-full px-2 gap-1 rounded self-baseline max-h-[80vh] overflow-y-auto bg-white'
              itemCenter={false}
            >
              <div className='w-full sticky top-0 bg-inherit py-2'>
                <Text className='heading-5' level='h5'>
                  Chapters
                  <Text className='text-xs text-gray-500' level='p'>
                    {chapters.length} chapters
                  </Text>
                </Text>
                {!isLocked && (
                  <LinerProgressBar
                    completedChapters={completedChapters}
                    totalChapters={totalChapters}
                  />
                )}
              </div>

              {/* Sidebar: use button for chapter navigation, not <Link> */}
              <FlexContainer className='gap-px flex-grow' justifyCenter={false}>
                {chapters?.map(({ _id, name, content, isCompleted }, index) => {
                  const chapterId = _id?.toString();

                  return (
                    <div key={chapterId} className='flex items-center w-full'>
                      <ChapterLink
                        key={chapterId}
                        chapterId={chapterId}
                        content={content}
                        currentChapterId={currentChapterIdState}
                        handleChapterClick={handleChapterClick}
                        href="#"
                        isCompleted={isCompleted}
                        name={`${index + 1} - ${name}`}
                        isLocked={isLocked}
                      />
                    </div>
                  );
                })}
              </FlexContainer>

              <div className='w-full sticky bottom-0 bg-inherit py-2'>
                {!isLocked && (
                  <div>
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
                          ? 'Please wait while we generate your certificate.'
                          : isCourseCompleted
                          ? 'Click below to download your certificate.'
                          : 'Complete All to Get Your Certificate.'
                      }
                      onClick={() => {
                        if (isCourseCompleted && certificateId && !isGeneratingCertificate) {
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
                        subtext='Take one more step and start preparing for Coding Interviews'
                        onClick={() => {
                          router.push(routes.interviewPrep);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </FlexContainer>

            {/* Main Content */}
            <FlexContainer
              className='border md:w-8/12 w-full p-2 rounded'
              itemCenter={false}
              justifyCenter={false}
            >
              {isLocked ? (
                <div className='w-full'>
                  <Text level='h2' className='heading-4 mb-4'>
                    Course Overview
                  </Text>
                  <MDXRenderer mdxSource={course.meta || ''} />
                  <div className='mt-6 w-full rounded bg-blue-100 p-4 border border-blue-300 shadow-sm'>
                    <Text level='h4' className='mb-2 flex items-center gap-2'>
                      📚 Enroll to Access Course
                    </Text>
                    <Text level='p' className='mb-4'>
                      This course is completely free! Simply enroll to access all chapters and start learning.
                    </Text>
                    <Text level='p' className='text-sm text-gray-600'>
                      Click the "Enroll to Course" button above to get started.
                    </Text>
                  </div>
                </div>
              ) : (
                <MDXRenderer
                  mdxSource={courseMeta}
                  actions={
                    currentChapterIdState
                      ? [
                          <Button
                            key='complete'
                            className='w-fit mt-2'
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
              )}
            </FlexContainer>
          </FlexContainer>
        </div>
      </Section>

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
    </Fragment>
  );
};

export const getServerSideProps = getCoursePageProps;

export default CoursePage;
