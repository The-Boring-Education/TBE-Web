import {
  ActionBanner,
  Button,
  CertificateBanner,
  ContentFeedbackWidget,
  FeedbackPopup,
  LearningChapterList,
  LinerProgressBar,
  LoadingSpinner,
  SEO,
  Sheet,
  SheetContent,
  SheetHeroContainer,
  SheetTitle,
  SheetTrigger,
  Text,
  useTrackEnrollment,
} from '@tbe/components';
import { routes } from '@tbe/constants';
import { useGamificationFeedback, useGamifiedAction } from '@tbe/gamification';
import { useAnalytics, useUser } from '@tbe/hooks';
import type {
  AddCertificateRequestPayloadProps,
  CoursePageProps,
} from '@tbe/interface';
import { useMutation } from '@tbe/query';
import {
  captureException,
  formatDate,
  getCoursePageProps,
  sendRequest,
} from '@tbe/utils';
import { List } from 'lucide-react';
import { useRouter } from 'next/router';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

  // Resolve the chapter from the URL, falling back to the canonical first
  // chapter so an unknown id never selects (or reports feedback against) a
  // chapter that does not exist.
  const resolveChapterId = (candidate?: string) =>
    candidate && chapters.some((c) => c._id.toString() === candidate)
      ? candidate
      : firstChapterId;

  const activeParamChapterId = resolveChapterId(
    (router.query.chapterId as string) || currentChapterId,
  );

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

  const [pendingChapterIds, setPendingChapterIds] = useState<string[]>([]);
  const [failedChapterIds, setFailedChapterIds] = useState<string[]>([]);
  const [enrollmentError, setEnrollmentError] = useState(false);
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
  const mainContentRef = useRef<HTMLElement>(null);
  const focusContentOnDrawerCloseRef = useRef(false);
  const courseCompletionFeedbackShown = useRef(
    initialCourse?.isCompleted ?? false,
  );
  const courseCompletionCelebrationShown = useRef(
    initialCourse?.isCompleted ?? false,
  );
  const certificateRequest = useRef<Promise<boolean> | null>(null);

  const { user } = useUser();
  const isLocked = !isEnrolled;

  const rawSlug =
    (router.query.courseSlug as string) || slug || course?.slug || '';
  const cleanSlug = rawSlug.replace(/^\/?(shiksha\/)?/, '');
  const courseOverviewHref = `/shiksha/${cleanSlug}`;
  const getChapterHref = (chapterId: string) =>
    `/shiksha/${cleanSlug}/learn?chapterId=${chapterId}`;
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.isCompleted).length;
  const isDataLoading = !course || chapters.length === 0;

  const currentChapter = chapters.find(
    (c) => c._id.toString() === currentChapterIdState,
  );

  // Pending and failed state belong to the chapter being saved, so an in-flight
  // save on one chapter never disables the control on another.
  const isCurrentChapterPending = pendingChapterIds.includes(
    currentChapterIdState,
  );
  const hasCurrentChapterFailed = failedChapterIds.includes(
    currentChapterIdState,
  );

  // Sync router query changes
  useEffect(() => {
    const qId = (router.query.chapterId as string) || '';
    const resolvedId = chapters.some((c) => c._id.toString() === qId)
      ? qId
      : firstChapterId;
    const found = chapters.find((c) => c._id.toString() === resolvedId);

    if (found) {
      setCurrentChapterIdState(resolvedId);
      setChapterContent(found.content);
      setIsChapterCompleted(found.isCompleted);
    }
  }, [router.query.chapterId, chapters, firstChapterId]);

  // Check if all chapters are completed
  const checkCourseCompletion = useCallback(() => {
    const allChaptersCompleted =
      chapters.length > 0 && chapters.every((chapter) => chapter.isCompleted);
    if (allChaptersCompleted && !isCourseCompleted) {
      setIsCourseCompleted(true);
    }
  }, [chapters, isCourseCompleted]);

  const { mutateAsync: makeRequest } = useMutation({
    mutationFn: (params: Parameters<typeof sendRequest>[0]) =>
      sendRequest(params),
  });
  const { trackEvent } = useAnalytics();
  const { triggerGamifiedAction } = useGamifiedAction();
  const { celebrate } = useGamificationFeedback();

  // Generate certificate if needed
  const generateCertificateIfNeeded =
    useCallback(async (): Promise<boolean> => {
      const allChaptersCompleted =
        chapters.length > 0 && chapters.every((chapter) => chapter.isCompleted);
      if (!allChaptersCompleted || certificateId || !user?.id) {
        return false;
      }

      if (certificateRequest.current) return certificateRequest.current;

      setIsGeneratingCertificate(true);
      let certificateWasReturned = false;
      const request = makeRequest({
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
      })
        .then((response) => {
          const { status, data, message } = response || {};
          if (status !== true || !data?._id) {
            captureException(
              new Error(message || 'Failed to generate certificate'),
              {
                tags: { section: 'shiksha', flow: 'certificate_generation' },
                extra: { courseId: course._id, userId: user?.id, status },
              },
            );
            return false;
          }

          setCertificateId(data._id);
          certificateWasReturned = true;
          return message !== 'Certificate already exists';
        })
        .catch((error) => {
          captureException(
            error instanceof Error ? error : new Error(String(error)),
            {
              tags: { section: 'shiksha', flow: 'certificate_generation' },
              extra: { courseId: course._id, userId: user?.id },
            },
          );
          return false;
        })
        .finally(() => {
          setIsGeneratingCertificate(false);
          if (!certificateWasReturned) certificateRequest.current = null;
        });

      certificateRequest.current = request;
      return request;
    }, [
      chapters,
      certificateId,
      course._id,
      course.name,
      makeRequest,
      user?.id,
      user?.name,
    ]);

  useEffect(() => {
    const targetChapter = chapters.find(
      (c) => c._id.toString() === currentChapterIdState,
    );
    setIsChapterCompleted(targetChapter?.isCompleted);

    if (targetChapter) {
      setChapterContent(targetChapter.content);
    }

    checkCourseCompletion();

    const allCompleted =
      chapters.length > 0 && chapters.every((c) => c.isCompleted);

    if (allCompleted) {
      if (!courseCompletionFeedbackShown.current) {
        courseCompletionFeedbackShown.current = true;
        setShowChapterFeedback(true);
      }

      void generateCertificateIfNeeded().then((certificateWasCreated) => {
        if (
          !certificateWasCreated ||
          courseCompletionCelebrationShown.current
        ) {
          return;
        }

        courseCompletionCelebrationShown.current = true;
        void triggerGamifiedAction({
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
      });
    } else {
      setShowChapterFeedback(false);
    }
  }, [
    checkCourseCompletion,
    chapters,
    course._id,
    course.name,
    currentChapterIdState,
    generateCertificateIfNeeded,
    triggerGamifiedAction,
  ]);

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

  const toggleCompletion = useCallback(
    async (chapterId: string) => {
      if (!isEnrolled || !chapterId) return;

      // Capture the chapter identity and the target state at click time so a
      // response can never be applied to whichever chapter is selected later.
      const targetChapter = chapters.find(
        (c) => c._id.toString() === chapterId,
      );
      if (!targetChapter) return;
      const newCompletionStatus = !targetChapter.isCompleted;

      setPendingChapterIds((prev) =>
        prev.includes(chapterId) ? prev : [...prev, chapterId],
      );
      setFailedChapterIds((prev) => prev.filter((id) => id !== chapterId));

      try {
        const response = await makeRequest({
          method: 'PATCH',
          url: routes.api.markCourseChapterAsCompleted,
          body: {
            userId: user?.id,
            courseId: course._id,
            chapterId,
            isCompleted: newCompletionStatus,
          },
        });

        // `sendRequest` resolves with the error payload instead of throwing,
        // so the response envelope is the only reliable success signal.
        if (response?.status !== true) {
          throw new Error(
            `Chapter completion save rejected for chapter ${chapterId}`,
          );
        }

        if (newCompletionStatus) {
          celebrate(response?.gamification, {
            message: 'Chapter completed! Keep learning!',
          });
          trackEvent({
            action: 'COURSE_CHAPTER_COMPLETE',
            category: 'Learning',
            label: 'Chapter Completed',
            value: {
              userId: user?.id,
              courseId: course._id,
              chapterId,
            },
          });
        }

        setChapters((prevChapters) =>
          prevChapters.map((ch) =>
            ch._id.toString() === chapterId
              ? { ...ch, isCompleted: newCompletionStatus }
              : ch,
          ),
        );
      } catch (error) {
        // Never surface raw server text to the learner — log it instead.
        captureException(
          error instanceof Error ? error : new Error(String(error)),
          {
            tags: { section: 'shiksha', flow: 'chapter_completion' },
            extra: {
              courseId: course._id,
              chapterId,
              userId: user?.id,
              isCompleted: newCompletionStatus,
            },
          },
        );
        setFailedChapterIds((prev) =>
          prev.includes(chapterId) ? prev : [...prev, chapterId],
        );
      } finally {
        setPendingChapterIds((prev) => prev.filter((id) => id !== chapterId));
      }
    },
    [
      celebrate,
      chapters,
      course._id,
      isEnrolled,
      makeRequest,
      trackEvent,
      user?.id,
    ],
  );

  const { enroll, isEnrolling } = useTrackEnrollment({
    id: course?._id ?? '',
    name: course?.name ?? '',
    trackType: 'course',
  });

  const handleInContentEnroll = useCallback(async () => {
    setEnrollmentError(false);

    const didEnroll = await enroll();
    if (!didEnroll) {
      setEnrollmentError(true);
      return;
    }

    setIsEnrolled(true);
  }, [enroll]);

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
            {/* Mobile Chapters Drawer (dialog-based, keyboard accessible) */}
            <Sheet
              open={isMobileSidebarOpen}
              onOpenChange={setIsMobileSidebarOpen}
            >
              <SheetTrigger asChild>
                <button
                  aria-label={`View Chapters (${chapters.length})`}
                  className='fixed left-0 top-1/2 -translate-y-1/2 z-30 lg:hidden bg-primary text-white font-medium py-2 pl-2 pr-2.5 rounded-r-full shadow-lg flex items-center gap-1.5 text-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer'
                >
                  <List className='w-3.5 h-3.5 text-white' />
                  <span className='text-[11px] font-semibold tracking-wide'>
                    Chapters ({chapters.length})
                  </span>
                </button>
              </SheetTrigger>

              <SheetContent
                side='left'
                aria-label='Chapters'
                className='w-[85%] max-w-[340px] sm:max-w-[340px] bg-white text-gray-900 border-r border-gray-200 p-4 shadow-2xl flex flex-col gap-3 lg:hidden'
                onCloseAutoFocus={(event) => {
                  if (!focusContentOnDrawerCloseRef.current) return;
                  focusContentOnDrawerCloseRef.current = false;
                  event.preventDefault();
                  mainContentRef.current?.focus();
                }}
              >
                <div className='flex items-center justify-between pb-3 border-b border-gray-100 bg-white'>
                  <div className='flex items-center gap-2'>
                    <SheetTitle className='font-semibold text-base text-gray-900'>
                      Chapters
                    </SheetTitle>
                    <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-primary border border-red-200/60'>
                      {chapters.length} chapters
                    </span>
                  </div>
                </div>

                {!isLocked && (
                  <div className='pb-2 bg-white'>
                    <LinerProgressBar
                      completedChapters={completedChapters}
                      totalChapters={totalChapters}
                    />
                  </div>
                )}

                <LearningChapterList
                  chapters={chapters}
                  currentChapterId={currentChapterIdState}
                  isLocked={isLocked}
                  href={({ _id }) => getChapterHref(_id?.toString() ?? '')}
                  onChapterSelect={(content, chapterId) => {
                    handleChapterClick(content, chapterId);
                    focusContentOnDrawerCloseRef.current = true;
                    setIsMobileSidebarOpen(false);
                  }}
                  className='gap-1.5 flex-1 overflow-y-auto pt-1 pr-1 custom-scrollbar scroll-smooth bg-white'
                />
              </SheetContent>
            </Sheet>

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
                <LearningChapterList
                  chapters={chapters}
                  currentChapterId={currentChapterIdState}
                  isLocked={isLocked}
                  href={({ _id }) => getChapterHref(_id?.toString() ?? '')}
                  onChapterSelect={handleChapterClick}
                  className='gap-1.5 flex-1 overflow-y-auto pt-1 pr-1 custom-scrollbar scroll-smooth'
                />

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
              <main
                id='chapter-content'
                ref={mainContentRef}
                tabIndex={-1}
                className='flex-1 w-full bg-transparent lg:bg-card border-none lg:border lg:border-border/70 rounded-none lg:rounded-2xl p-0 sm:p-4 lg:p-10 shadow-none lg:shadow-xs min-h-[500px] focus:outline-none'
              >
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
                        text={isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
                        variant='PRIMARY'
                        className='w-fit px-6 py-2.5 rounded-lg font-semibold shadow-xs mt-2'
                        isLoading={isEnrolling}
                        onClick={handleInContentEnroll}
                      />
                      {enrollmentError && (
                        <div
                          role='alert'
                          aria-live='assertive'
                          className='rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs sm:text-sm text-destructive'
                        >
                          We couldn&apos;t enroll you in this course. Please
                          check your connection and try again.
                        </div>
                      )}
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
                        isLoading={isCurrentChapterPending}
                        active={isEnrolled}
                        text={
                          isCurrentChapterPending
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
                              : isCurrentChapterPending
                                ? 'SECONDARY'
                                : 'PRIMARY'
                        }
                        onClick={() => toggleCompletion(currentChapterIdState)}
                      />
                    </div>

                    {hasCurrentChapterFailed && (
                      <div
                        role='alert'
                        aria-live='assertive'
                        className='w-full rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex flex-wrap items-center gap-3'
                      >
                        <p className='text-xs sm:text-sm text-destructive flex-1 min-w-[220px]'>
                          We couldn&apos;t save your progress for this chapter.
                          Your last saved progress is unchanged.
                        </p>
                        <Button
                          className='w-auto py-2 px-4 rounded-lg font-semibold text-xs sm:text-sm'
                          variant='OUTLINE'
                          text='Retry'
                          isLoading={isCurrentChapterPending}
                          onClick={() =>
                            toggleCompletion(currentChapterIdState)
                          }
                        />
                      </div>
                    )}
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
