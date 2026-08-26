import {
  CourseHeroContainer,
  LinerProgressBar,
  LoadingSpinner,
  MDXRenderer,
  SEO,
  Text,
} from '@tbe/components';
import type { CoursePageProps } from '@tbe/interface';
import { getCoursePageProps } from '@tbe/utils';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  GraduationCap,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useState } from 'react';

const CourseLandingPage = ({
  course: initialCourse,
  meta,
  slug,
  seoMeta,
}: CoursePageProps) => {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [isEnrolled, setIsEnrolled] = useState(
    initialCourse?.isEnrolled || false,
  );
  const chapters = course?.chapters || [];
  const rawSlug =
    (router.query.courseSlug as string) || slug || course?.slug || '';
  const cleanSlug = rawSlug.replace(/^\/?(shiksha\/)?/, '');
  const learnHref = `/shiksha/${cleanSlug}/learn`;

  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(
    (chapter) => chapter.isCompleted,
  ).length;
  const isDataLoading = !course || chapters.length === 0;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <div className='bg-background min-h-screen font-body text-foreground'>
        {/* Course Hero Section */}
        <CourseHeroContainer
          id={course?._id ?? ''}
          isEnrolled={isEnrolled}
          isPremium={false}
          name={course?.name ?? ''}
          slug={cleanSlug}
          completedChapters={completedChapters}
          totalChapters={totalChapters}
          onEnrollSuccess={() => setIsEnrolled(true)}
          startLearningHref={learnHref}
        />

        {isDataLoading && (
          <div className='w-full max-w-[1536px] mx-auto px-4 py-16 text-center'>
            <div className='inline-flex items-center justify-center gap-3 bg-card border border-border px-6 py-4 rounded-xl shadow-xs'>
              <LoadingSpinner height={6} width={6} />
              <Text
                level='p'
                className='text-muted-foreground font-medium text-sm'
              >
                Loading course information...
              </Text>
            </div>
          </div>
        )}

        {!isDataLoading && (
          <div
            id='course-content'
            className='w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 font-primary'
          >
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
              {/* Left Column (2 Cols): Overview */}
              <div className='lg:col-span-2 space-y-6'>
                <div className='bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4'>
                  <div className='flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider'>
                    <BookOpen className='w-4 h-4' />
                    <span>About This Course</span>
                  </div>
                  <h2 className='font-headings font-bold text-2xl sm:text-3xl text-foreground'>
                    Master {course.name}
                  </h2>
                  <div className='prose prose-slate max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed'>
                    {course.meta ? (
                      <MDXRenderer mdxSource={course.meta} />
                    ) : (
                      <p>
                        Welcome to {course.name}! This course is crafted to take
                        you step-by-step through core principles, practical
                        implementations, and real-world software concepts.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (1 Col): Curriculum Syllabus */}
              <div className='lg:col-span-1 space-y-6 sticky top-6'>
                <div className='bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4'>
                  <div className='flex items-center justify-between pb-3 border-b border-border/60'>
                    <div className='flex items-center gap-2'>
                      <GraduationCap className='w-4 h-4 text-primary' />
                      <h3 className='font-semibold text-base text-foreground'>
                        Curriculum
                      </h3>
                    </div>
                    <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
                      {totalChapters} Chapters
                    </span>
                  </div>

                  {isEnrolled && totalChapters > 0 && (
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-xs font-medium text-muted-foreground'>
                        <span>Your Progress</span>
                        <span>
                          {completedChapters}/{totalChapters} completed
                        </span>
                      </div>
                      <LinerProgressBar
                        completedChapters={completedChapters}
                        totalChapters={totalChapters}
                      />
                    </div>
                  )}

                  {/* Chapter List formatted identical to QuestionLink */}
                  <div className='flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar scroll-smooth'>
                    {chapters.map((ch, idx) => {
                      const chId = ch._id?.toString();
                      const targetUrl = `${learnHref}?chapterId=${chId}`;

                      return (
                        <Link
                          key={chId || idx}
                          href={isEnrolled ? targetUrl : '#'}
                          onClick={(e) => {
                            if (!isEnrolled) {
                              e.preventDefault();
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className={`flex items-start gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-primary transition-all duration-150 ${
                            isEnrolled
                              ? 'text-foreground hover:bg-muted/60 rounded-xl cursor-pointer'
                              : 'text-muted-foreground/60 cursor-not-allowed opacity-75'
                          }`}
                        >
                          {ch.isCompleted ? (
                            <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[1.5]' />
                          ) : !isEnrolled ? (
                            <Lock className='w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5 stroke-[1.5]' />
                          ) : (
                            <Circle className='w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground/35 stroke-[1.25]' />
                          )}
                          <span className='leading-snug break-words flex-1 font-medium'>
                            {ch.name || ch.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export const getServerSideProps = getCoursePageProps;

export default CourseLandingPage;
