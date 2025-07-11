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
  PaymentCard,
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
  usePaymentStatus,
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
  const [isChapterCompleted, setIsChapterCompleted] = useState(
    chapters.find((chapter) => chapter._id.toString() === currentChapterId)
      ?.isCompleted
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(
    course.isCompleted ?? false
  );
  const [certificateId, setCertificateId] = useState(course.certificateId);
  const [nextChapterUrl, setNextChapterUrl] = useState<string>('');
  const isSmallScreen = useMediaQuery(SCREEN_BREAKPOINTS.SM);

  const [showChapterFeedback, setShowChapterFeedback] = useState(false);
  const [showCourseFeedback, setShowCourseFeedback] = useState(false);

  const { user } = useUser();
  const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: course?._id,
    isPremium: course?.isPremium,
  });
  const isLocked =
    course?.isPremium && !course?.isEnrolled && isPurchased === false;

  const [showPayment, setShowPayment] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  // Calculate the total chapters and completed chapters
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(
    (chapter) => chapter.isCompleted
  ).length;

  useEffect(() => {
    const currentChapter = chapters.find(
      (chapter) => chapter._id.toString() === currentChapterId
    );
    setIsChapterCompleted(currentChapter?.isCompleted);
  }, [currentChapterId, chapters]);

  const { makeRequest } = useApi(`shiksha/${course}`);
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const { triggerCelebration, showToast } = useGamificationContext();

  if (!course) return null;

  const handleChapterClick = (chapterMeta: string) => {
    if (!isLocked) {
      setCourseMeta(chapterMeta);

      // Track chapter start
      trackEvent({
        action: 'COURSE_CHAPTER_START',
        category: 'Learning',
        label: 'Chapter Started',
        value: {
          userId: user?.id,
          courseId: course._id,
          chapterId: currentChapterId,
        },
      });
    }
  };

  const handleFeedbackComplete = () => {
    if (nextChapterUrl) {
      window.location.href = nextChapterUrl;
    }
    setShowChapterFeedback(false);
  };

  const toggleCompletion = async () => {
    setIsLoading(true);
    const newCompletionStatus = !isChapterCompleted;

    try {
      await makeRequest({
        method: 'PATCH',
        url: routes.api.markCourseChapterAsCompleted,
        body: {
          userId: user?.id,
          courseId: course._id,
          chapterId: currentChapterId,
          isCompleted: newCompletionStatus,
        },
      });

      // Use gamified action for chapter completion
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
            chapterId: currentChapterId,
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

      setChapters((prevChapters) =>
        prevChapters.map((chapter) =>
          chapter._id.toString() === currentChapterId
            ? { ...chapter, isCompleted: newCompletionStatus }
            : chapter
        )
      );

      if (newCompletionStatus) {
        const currentIndex = chapters.findIndex(
          (chapter) => chapter._id.toString() === currentChapterId
        );

        const nextIncompleteChapter = chapters
          .slice(currentIndex + 1)
          .find((chapter) => !chapter.isCompleted);

        if (nextIncompleteChapter) {
          const nextChapterId = nextIncompleteChapter._id.toString();
          setNextChapterUrl(
            `${slug}?courseId=${course._id}&chapterId=${nextChapterId}`
          );
        } else {
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
        setShowChapterFeedback(true);
      }

      setIsChapterCompleted(newCompletionStatus);
    } catch (error) {
      console.error('Error toggling chapter completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPayment = () => {
    setShowPayment(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
          isPremium={course.isPremium}
          name={course.name ?? ''}
        />
      </Section>

      <Section className='md:p-2 p-2'>
        <FlexContainer className='w-full gap-4' itemCenter={false}>
          {/* Left Sidebar (Chapters) */}
          <FlexContainer
            className='border md:w-3/12 w-full px-2 gap-1 rounded self-baseline bg-white'
            itemCenter={false}
          >
            <div className='w-full sticky top-0 bg-inherit py-2'>
              <Text className='heading-5' level='h5'>
                Chapters
              </Text>
              {!isLocked && (
                <LinerProgressBar
                  completedChapters={completedChapters}
                  totalChapters={totalChapters}
                />
              )}
            </div>

            <FlexContainer
              className='gap-px overflow-y-auto max-h-[60vh]'
              justifyCenter={false}
            >
              {chapters?.map(({ _id, name, content, isCompleted }) => {
                const chapterId = _id?.toString();

                return (
                  <ChapterLink
                    key={chapterId}
                    chapterId={chapterId}
                    content={content}
                    currentChapterId={currentChapterId}
                    handleChapterClick={handleChapterClick}
                    href={
                      isLocked
                        ? '#'
                        : `${slug}?courseId=${course._id}&chapterId=${chapterId}`
                    }
                    isCompleted={isCompleted}
                    name={name}
                    isLocked={isLocked}
                  />
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
                      isCourseCompleted
                        ? 'View Certificate'
                        : 'Certificate Locked'
                    }
                    icon={isCourseCompleted ? FaTrophy : FaLock}
                    isLocked={!isCourseCompleted}
                    subtext={
                      isCourseCompleted
                        ? 'Click below to download your certificate.'
                        : 'Complete All to Get Your Certificate.'
                    }
                    onClick={() => {
                      if (isCourseCompleted) {
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
                <div className='mt-6 w-full rounded bg-yellow-100 p-4 border border-yellow-300 shadow-sm'>
                  <Text level='h4' className='mb-2 flex items-center gap-2'>
                    🚀 This is a Premium Course
                  </Text>
                  <Text level='p' className='mb-4'>
                    To access the course content, please complete the payment.
                    Once payment is confirmed, all chapters will be unlocked.
                  </Text>
                  {!showPayment && (
                    <Button
                      text='Pay Now to Unlock'
                      variant='PRIMARY'
                      className='w-fit'
                      onClick={handleShowPayment}
                    />
                  )}
                </div>
                {showPayment && (
                  <div ref={paymentSectionRef}>
                    <PaymentCard
                      course={course}
                      onClose={() => setShowPayment(false)}
                      productType='SHIKSHA'
                    />
                  </div>
                )}
              </div>
            ) : (
              <MDXRenderer
                mdxSource={courseMeta}
                actions={
                  currentChapterId
                    ? [
                        <Button
                          key='enroll'
                          className='w-fit'
                          isLoading={isLoading}
                          text={
                            isLoading
                              ? 'Marking...'
                              : isChapterCompleted
                              ? 'Completed'
                              : 'Mark As Completed'
                          }
                          variant={
                            isChapterCompleted
                              ? 'SUCCESS'
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
      </Section>

      {showChapterFeedback && (
        <FeedbackPopup
          refId={currentChapterId}
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
