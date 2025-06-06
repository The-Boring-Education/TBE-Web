import router from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import { FaLock, FaTrophy } from 'react-icons/fa';

import { useAnalytics, useApi, useMediaQuery, useUser } from '@/hooks';

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

import { routes, SCREEN_BREAKPOINTS } from '@/constant';
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
  const { user } = useUser();
  const { trackEvent } = useAnalytics();

  if (!course) return null;

  const handleChapterClick = (chapterMeta: string) => {
    setCourseMeta(chapterMeta);
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

      trackEvent({
        action: newCompletionStatus ? 'COURSE_COMPLETE' : 'COURSE_PROGRESS',
        category: 'Course',
        label: newCompletionStatus ? 'Course Completed' : 'Course Progress',
        value: {
          userId: user?.id,
          courseId: course._id,
        },
      });

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
          setNextChapterUrl(`${slug}?courseId=${course._id}&chapterId=${nextChapterId}`);
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

              {/* LinerProgressBar */}
              <LinerProgressBar
                completedChapters={completedChapters}
                totalChapters={totalChapters}
              />
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
                    href={`${slug}?courseId=${course._id}&chapterId=${chapterId}`}
                    isCompleted={isCompleted}
                    name={name}
                  />
                );
              })}
            </FlexContainer>
            <div className='w-full sticky bottom-0 bg-inherit py-2'>
              <CertificateBanner
                backgroundColor={
                  isCourseCompleted ? 'bg-purple-600' : 'bg-purple-400'
                }
                heading={
                  isCourseCompleted ? 'View Certificate' : 'Certificate Locked'
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

              {/* New Banner for Interview Prep */}
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
          </FlexContainer>
          <FlexContainer
            className='border md:w-8/12 p-2 rounded'
            disabled={!course.isEnrolled}
            itemCenter={false}
            justifyCenter={false}
          >
            <MDXRenderer
              actions={[
                currentChapterId && (
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
                  />
                ),
              ]}
              mdxSource={courseMeta}
            />
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
