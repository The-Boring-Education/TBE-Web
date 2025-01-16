import React, { useEffect, useState } from 'react';
import { FaTrophy, FaLock } from 'react-icons/fa';
import {
  Alert,
  Button,
  ChapterLink,
  CourseHeroContainer,
  FlexContainer,
  MDXRenderer,
  ProgressBar,
  Section,
  SEO,
  Text,
  CertificateBanner,
} from '@/components';
import {
  AddCertificateRequestPayloadProps,
  CoursePageProps,
} from '@/interfaces';
import { formatDate, getCoursePageProps } from '@/utils';
import { useApi, useMediaQuery, useUser } from '@/hooks';
import { routes, SCREEN_BREAKPOINTS } from '@/constant';
import router from 'next/router';

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
  const isSmallScreen = useMediaQuery(SCREEN_BREAKPOINTS.SM);

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

  if (!course) return null;

  const handleChapterClick = (chapterMeta: string) => {
    setCourseMeta(chapterMeta);
  };

  const toggleCompletion = async () => {
    setIsLoading(true);
    try {
      const newCompletionStatus = !isChapterCompleted;

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
          window.location.href = `${slug}?courseId=${course._id}&chapterId=${nextChapterId}`;
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

          if (status) {
            setIsCourseCompleted(true);
            setCertificateId(data._id);
          }
        }
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
      message='This Course will require you to write Code. Better open it on Laptop'
      type='INFO'
      className='my-2'
    />
  );

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:p-2 p-2'>
        {alertContainer}
        <CourseHeroContainer
          id={course._id ?? ''}
          name={course.name ?? ''}
          isEnrolled={course.isEnrolled}
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
              <Text level='h5' className='heading-5'>
                Chapters
              </Text>

              {/* ProgressBar */}
              <ProgressBar
                totalChapters={totalChapters}
                completedChapters={completedChapters}
              />
            </div>

            <FlexContainer
              justifyCenter={false}
              className='gap-px overflow-y-auto max-h-[60vh]'
            >
              {chapters?.map(({ _id, name, content, isCompleted }) => {
                const chapterId = _id?.toString();

                return (
                  <ChapterLink
                    key={chapterId}
                    href={`${slug}?courseId=${course._id}&chapterId=${chapterId}`}
                    chapterId={chapterId}
                    name={name}
                    content={content}
                    isCompleted={isCompleted}
                    currentChapterId={currentChapterId}
                    handleChapterClick={handleChapterClick}
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
                subtext={
                  isCourseCompleted
                    ? 'Click below to download your certificate.'
                    : 'Complete All to Get Your Certificate.'
                }
                icon={isCourseCompleted ? FaTrophy : FaLock}
                isLocked={!isCourseCompleted}
                onClick={() => {
                  if (isCourseCompleted) {
                    router.push(`/certificate/${certificateId}`);
                  }
                }}
              />
            </div>
          </FlexContainer>

          {/* Main Content Area */}
          <FlexContainer
            className='border md:w-8/12 w-full p-2 rounded'
            justifyCenter={false}
            itemCenter={false}
            disabled={!course.isEnrolled}
          >
            <MDXRenderer
              mdxSource={courseMeta}
              actions={[
                currentChapterId && (
                  <Button
                    key='enroll'
                    variant={
                      isChapterCompleted
                        ? 'SUCCESS'
                        : isLoading
                        ? 'SECONDARY'
                        : 'PRIMARY'
                    }
                    text={
                      isLoading
                        ? 'Marking...'
                        : isChapterCompleted
                        ? 'Completed'
                        : 'Mark As Completed'
                    }
                    className='w-fit'
                    onClick={toggleCompletion}
                    isLoading={isLoading}
                  />
                ),
              ]}
            />
          </FlexContainer>
        </FlexContainer>
      </Section>
    </React.Fragment>
  );
};

export const getServerSideProps = getCoursePageProps;

export default CoursePage;
