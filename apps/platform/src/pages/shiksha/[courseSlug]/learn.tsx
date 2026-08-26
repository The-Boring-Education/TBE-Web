import {
  ActionBanner,
  Button,
  CertificateBanner,
  ChapterLink,
  ContentFeedbackWidget,
  FeedbackPopup,
  LinerProgressBar,
  LoadingSpinner,
  SEO,
  SheetHeroContainer,
  Text,
} from '@tbe/components';
import { routes } from '@tbe/constants';
import {
  calculateUserPointsForAction,
  useGamificationContext,
  useGamifiedAction,
} from '@tbe/gamification';
import { useAnalytics, useUser } from '@tbe/hooks';
import type {
  AddCertificateRequestPayloadProps,
  CoursePageProps,
} from '@tbe/interface';
import { queryKeys, useMutation, useQueryClient } from '@tbe/query';
import { formatDate, getCoursePageProps, sendRequest } from '@tbe/utils';
import { List, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FaLock, FaTrophy } from 'react-icons/fa';

import { InterviewSheetMDXRenderer } from '@/components/InterviewSheetMDXRenderer';

const CourseLearnPage = ({
  course: initialCourse,
  meta,
  slug,
  seoMeta,
  currentChapterId,
}: CoursePageProps) => {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [isEnrolled, setIsEnrolled] = useState(
    initialCourse?.isEnrolled || false,
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState(initialCourse?.chapters || []);
  const firstChapterId = chapters?.[0]?._id?.toString() || '';

  // Use query param chapterId if present, else prop or first chapter
  const activeParamChapterId =
    (router.query.chapterId as string) || currentChapterId || firstChapterId;

  const [currentChapterIdState, setCurrentChapterIdState] =
    useState(activeParamChapterId);
  const [chapterContent, setChapterContent] = useState<string>(
    chapters.find((c) => c._id.toString() === activeParamChapterId)?.content ||
      meta ||
      '',
  );
  const [isChapterCompleted, setIsChapterCompleted] = useState(
    chapters.find((c) => c._id.toString() === activeParamChapterId)
      ?.isCompleted,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(
    initialCourse?.isCompleted ?? false,
  );
  const [certificateId, setCertificateId] = useState(
    initialCourse?.certificateId,
  );

  const [showChapterFeedback, setShowChapterFeedback] = useState(false);
  const [showCourseFeedback, setShowCourseFeedback] = useState(false);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const isLocked = !isEnrolled;

  const rawSlug =
    (router.query.courseSlug as string) || slug || course?.slug || '';
  const cleanSlug = rawSlug.replace(/^\/?(shiksha\/)?/, '');
  const courseOverviewHref = `/shiksha/${cleanSlug}`;
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.isCompleted).length;
  const isDataLoading = !course || chapters.length === 0;

  const currentChapter = chapters.find(
    (c) => c._id.toString() === currentChapterIdState,
  );

  // Sync router query changes
  useEffect(() => {
    if (router.query.chapterId) {
      const qId = router.query.chapterId as string;
      const found = chapters.find((c) => c._id.toString() === qId);
      if (found) {
        setCurrentChapterIdState(qId);
        setChapterContent(found.content);
        setIsChapterCompleted(found.isCompleted);
      }
    }
  }, [router.query.chapterId, chapters]);

  // Check if all chapters are completed
  const checkCourseCompletion = () => {
    const allChaptersCompleted =
      chapters.length > 0 && chapters.every((chapter) => chapter.isCompleted);
    if (allChaptersCompleted && !isCourseCompleted) {
      setIsCourseCompleted(true);
    }
  };

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const queryClient = useQueryClient();
  const { triggerCelebration, showToast } = useGamificationContext();

  // Generate certificate if needed
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
        }
      } catch (error) {
        console.error('Error generating certificate:', error);
      } finally {
        setIsGeneratingCertificate(false);
      }
    }
  };

  useEffect(() => {
    const targetChapter = chapters.find(
      (c) => c._id.toString() === currentChapterIdState,
    );
    setIsChapterCompleted(targetChapter?.isCompleted);

    if (targetChapter) {
      setChapterContent(targetChapter.content);
    }

    checkCourseCompletion();
    generateCertificateIfNeeded();

    const allCompleted =
      chapters.length > 0 && chapters.every((c) => c.isCompleted);

    if (allCompleted && !showChapterFeedback) {
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

  const handleChapterClick = (content: string, chapterId: string) => {
    if (!isLocked) {
      setChapterContent(content);
      setCurrentChapterIdState(chapterId);
      setIsMobileSidebarOpen(false);

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
    if (!isEnrolled) {
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
            },
          });
        }

        setChapters((prevChapters) =>
          prevChapters.map((ch) =>
            ch._id.toString() === currentChapterIdState
              ? { ...ch, isCompleted: newCompletionStatus }
              : ch,
          ),
        );
        setIsChapterCompleted(newCompletionStatus);
      }
    } catch (error) {
      console.error('Error toggling chapter completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Strip leading # heading from markdown if present to prevent double duplicate title
  const displayContent = useMemo(() => {
    if (!chapterContent) return '';
    return chapterContent.replace(/^#+\s+[^\n]+\n*/, '').trim();
  }, [chapterContent]);

  if (!course) return null;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <div className='bg-background min-h-screen font-body text-foreground'>
        {/* Practice Hero Section */}
        <SheetHeroContainer
          id={course._id ?? ''}
          name={course.name ?? ''}
          isEnrolled={isEnrolled}
          isPremium={false}
          trackType='course'
          backHref={courseOverviewHref}
          backText='Back to Overview'
          onEnrollSuccess={() => setIsEnrolled(true)}
        />

        {isDataLoading && (
          <div className='w-full max-w-[1536px] mx-auto px-4 py-16 text-center'>
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
            className='w-full max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-6 font-primary'
            ref={contentSectionRef}
          >
            {/* Mobile Floating Chapters Toggle Button (Left Side) */}
            {!isMobileSidebarOpen && (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label='View Chapters'
                className='fixed left-0 top-1/2 -translate-y-1/2 z-30 lg:hidden bg-primary text-white font-medium py-2 pl-2 pr-2.5 rounded-r-full shadow-lg flex items-center gap-1.5 text-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer'
              >
                <List className='w-3.5 h-3.5 text-white' />
                <span className='text-[11px] font-semibold tracking-wide'>
                  Chapters ({chapters.length})
                </span>
              </button>
            )}

            {/* Mobile Drawer Backdrop */}
            {isMobileSidebarOpen && (
              <div
                className='fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200'
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}

            {/* Mobile Drawer Panel (Solid White Background) */}
            <div
              className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-[340px] bg-white text-gray-900 border-r border-gray-200 p-4 shadow-2xl flex flex-col gap-3 lg:hidden transform transition-transform duration-300 ease-in-out ${
                isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className='flex items-center justify-between pb-3 border-b border-gray-100 bg-white'>
                <div className='flex items-center gap-2'>
                  <h2 className='font-semibold text-base text-gray-900'>
                    Chapters
                  </h2>
                  <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-primary border border-red-200/60'>
                    {chapters.length} chapters
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className='p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {!isLocked && (
                <div className='pb-2 bg-white'>
                  <LinerProgressBar
                    completedChapters={completedChapters}
                    totalChapters={totalChapters}
                  />
                </div>
              )}

              <div className='flex flex-col gap-1.5 flex-1 overflow-y-auto pt-1 pr-1 custom-scrollbar scroll-smooth bg-white'>
                {chapters?.map(({ _id, name, content, isCompleted }, index) => {
                  const chapterId = _id?.toString();

                  return (
                    <ChapterLink
                      key={chapterId}
                      chapterId={chapterId}
                      content={content}
                      currentChapterId={currentChapterIdState}
                      handleChapterClick={() => {
                        handleChapterClick(content, chapterId);
                        setIsMobileSidebarOpen(false);
                      }}
                      href={`/shiksha/${cleanSlug}/learn?chapterId=${chapterId}`}
                      isCompleted={isCompleted}
                      name={`${index + 1}. ${name}`}
                      isLocked={isLocked}
                    />
                  );
                })}
              </div>
            </div>

            <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 items-start'>
              {/* Desktop Left Sidebar (Chapters Navigation) */}
              <aside className='hidden lg:flex w-full lg:w-[320px] xl:w-[360px] shrink-0 self-start sticky top-6 max-h-[calc(100vh-3rem)] bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-col gap-3 overflow-hidden'>
                <div className='w-full sticky top-0 bg-card z-10 pb-3 border-b border-border/60 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <h2 className='font-semibold text-base sm:text-lg text-foreground'>
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
                <div className='flex flex-col gap-1.5 flex-1 overflow-y-auto pt-1 pr-1 custom-scrollbar scroll-smooth'>
                  {chapters?.map(
                    ({ _id, name, content, isCompleted }, index) => {
                      const chapterId = _id?.toString();

                      return (
                        <ChapterLink
                          key={chapterId}
                          chapterId={chapterId}
                          content={content}
                          currentChapterId={currentChapterIdState}
                          handleChapterClick={() =>
                            handleChapterClick(content, chapterId)
                          }
                          href={`/shiksha/${cleanSlug}/learn?chapterId=${chapterId}`}
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
              <main className='flex-1 w-full bg-transparent lg:bg-card border-none lg:border lg:border-border/70 rounded-none lg:rounded-2xl p-0 sm:p-4 lg:p-10 shadow-none lg:shadow-xs min-h-[500px]'>
                {isLocked ? (
                  <div className='w-full space-y-5'>
                    <div>
                      <h2 className='font-headings font-bold text-2xl text-foreground mb-3'>
                        Course Overview
                      </h2>
                      <div className='prose prose-slate max-w-none text-muted-foreground'>
                        <InterviewSheetMDXRenderer
                          mdxSource={course.meta || ''}
                          theme='light'
                        />
                      </div>
                    </div>

                    <div className='rounded-xl border border-border bg-card p-5 shadow-xs space-y-3'>
                      <div className='flex items-center gap-2 text-foreground font-bold text-base font-headings'>
                        <FaLock className='text-primary' />
                        <span>🚀 Unlock Full Course Access</span>
                      </div>
                      <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                        This course is completely free. Click below to enroll
                        and track your chapter completions.
                      </p>
                      <Button
                        text='Enroll in Course'
                        variant='PRIMARY'
                        className='w-fit px-6 py-2.5 rounded-lg font-semibold shadow-xs mt-2'
                        onClick={() => setIsEnrolled(true)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className='w-full space-y-4 font-primary'>
                    {currentChapter && (
                      <div className='pb-3.5 border-b border-border/80 mb-4'>
                        <span className='text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-md'>
                          CHAPTER{' '}
                          {chapters.findIndex(
                            (c) => c._id.toString() === currentChapterIdState,
                          ) + 1}
                        </span>
                        <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-2'>
                          {currentChapter.name || currentChapter.title}
                        </h1>
                      </div>
                    )}

                    <div className='w-full'>
                      <InterviewSheetMDXRenderer
                        mdxSource={displayContent}
                        theme='light'
                      />
                    </div>

                    <div className='mt-5 pt-4 border-t border-border/80 w-full flex flex-wrap items-center gap-3'>
                      <Button
                        className='w-auto self-start py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm text-white bg-primary hover:bg-primary/90 shadow-xs cursor-pointer'
                        isLoading={isLoading}
                        disabled={!isEnrolled}
                        text={
                          isLoading
                            ? 'Marking...'
                            : !isEnrolled
                              ? 'Enroll to Mark Complete'
                              : isChapterCompleted
                                ? 'Completed'
                                : 'Mark As Completed'
                        }
                        variant={
                          isChapterCompleted
                            ? 'SUCCESS'
                            : !isEnrolled
                              ? 'SECONDARY'
                              : isLoading
                                ? 'SECONDARY'
                                : 'PRIMARY'
                        }
                        onClick={toggleCompletion}
                      />
                    </div>
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
        {currentChapterIdState && isEnrolled && (
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
                  ?.name || '',
            }}
            theme='light'
          />
        )}
      </div>
    </Fragment>
  );
};

export const getServerSideProps = getCoursePageProps;

export default CourseLearnPage;
