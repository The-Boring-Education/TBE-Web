import { FlexContainer, LinkButton, SEO, ShikshaCard } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import type { PageProps, PrimaryCardWithCTAProps } from '@tbe/interface';
import { CACHE_TIMES, queryKeys, useQuery } from '@tbe/query';
import {
  getPreFetchProps,
  mapCourseResponseToCard,
  sendRequest,
} from '@tbe/utils';
import { Award, BookOpen, GraduationCap } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';

const ShikshaCardSkeleton = () => (
  <div className='rounded-xl border border-border bg-card overflow-hidden flex flex-col h-full shadow-xs animate-pulse'>
    <div className='w-full aspect-[16/9] bg-gray-200/70 shrink-0' />
    <div className='p-4 flex flex-col flex-1 gap-2.5'>
      <div className='h-4 bg-gray-200/90 rounded-md w-3/4' />
      <div className='space-y-2 my-1 flex-1'>
        <div className='h-3 bg-gray-100/90 rounded-md w-full' />
        <div className='h-3 bg-gray-100/90 rounded-md w-4/5' />
      </div>
      <div className='pt-3 border-t border-border/40 flex items-center justify-between mt-auto'>
        <div className='h-3 bg-gray-200/60 rounded-md w-20' />
        <div className='h-3 bg-gray-200/80 rounded-md w-16' />
      </div>
    </div>
  </div>
);

const Home = ({ seoMeta }: PageProps) => {
  const { data: response, isLoading: loading } = useQuery<any>({
    queryKey: queryKeys.shiksha.lists(),
    queryFn: () => sendRequest({ url: routes.api.shiksha }),
    ...CACHE_TIMES.STATIC,
  });

  const { user } = useUser();
  const [purchaseStatuses, setPurchaseStatuses] = useState<
    Record<string, boolean>
  >({});

  // Optimized parallel check for purchase status of premium courses
  useEffect(() => {
    if (!response?.data || !user?.id) return;

    let isMounted = true;
    const premiumCourses = response.data.filter((c: any) => c.isPremium);

    if (premiumCourses.length === 0) return;

    Promise.all(
      premiumCourses.map(async (c: any) => {
        try {
          const res = await fetch(
            `${routes.api.base}${routes.api.checkStatus}?userId=${user.id}&productId=${c._id}`,
          );
          const result = await res.json();
          return {
            id: c._id,
            purchased: Boolean(result?.status && result?.data?.purchased),
          };
        } catch {
          return { id: c._id, purchased: false };
        }
      }),
    ).then((results) => {
      if (!isMounted) return;
      const statusMap: Record<string, boolean> = {};
      results.forEach((r) => {
        statusMap[r.id] = r.purchased;
      });
      setPurchaseStatuses(statusMap);
    });

    return () => {
      isMounted = false;
    };
  }, [response?.data, user?.id]);

  // Map courses and attach DB metadata
  const courses: (PrimaryCardWithCTAProps & {
    roadmap?: string;
    difficultyLevel?: string;
  })[] = useMemo(() => {
    if (!response?.data) return [];
    const mapped = mapCourseResponseToCard(response.data) || [];
    return mapped.map((card, i) => {
      const raw = response.data[i];
      const isPurchased = purchaseStatuses[raw?._id] || false;
      return {
        ...card,
        roadmap: raw?.roadmap,
        difficultyLevel: raw?.difficultyLevel,
        isPurchased: raw?.isPremium ? isPurchased : false,
        isPremium: raw?.isPremium && !isPurchased,
      };
    });
  }, [response?.data, purchaseStatuses]);

  const noCourseFoundUI = !loading && courses.length === 0 && (
    <FlexContainer
      className='w-full py-16 items-center justify-center flex-col text-center'
      justifyCenter
    >
      <h2 className='font-headings font-bold text-2xl text-foreground mb-2'>
        No Courses Found
      </h2>
      <p className='text-muted-foreground mb-6 font-body text-sm'>
        No Shiksha courses available at the moment.
      </p>
      <LinkButton
        buttonProps={{
          variant: 'PRIMARY',
          text: 'Go Back To Home',
        }}
        href={routes.shiksha}
      />
    </FlexContainer>
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />

      <div className='bg-background min-h-screen font-body'>
        {/* Header Hero Section */}
        <div className='px-4 sm:px-10 lg:px-20 pt-12 sm:pt-16 pb-8 text-center'>
          <div className='inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-primary/20 shadow-xs'>
            <BookOpen className='w-3.5 h-3.5 text-primary' />
            <span>Course Learning</span>
          </div>
          <h1 className='font-headings font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 leading-tight'>
            Explore <span className='text-primary'>Shiksha Courses</span>
          </h1>
          <p className='text-base text-muted-foreground max-w-xl mx-auto leading-relaxed'>
            Pick a course and start learning. Master key software engineering
            concepts with structured step-by-step guides.
          </p>
        </div>

        {/* Stats Row */}
        <div className='px-4 sm:px-10 lg:px-20 pb-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8'>
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <BookOpen className='w-4 h-4 text-primary shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>
                {loading ? '...' : courses.length}
              </strong>{' '}
              Courses Available
            </span>
          </div>
          <div className='w-1.5 h-1.5 rounded-full bg-border hidden sm:block' />
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <GraduationCap className='w-4 h-4 text-primary shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>4,200+</strong>{' '}
              Students Enrolled
            </span>
          </div>
          <div className='w-1.5 h-1.5 rounded-full bg-border hidden sm:block' />
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <Award className='w-4 h-4 text-primary shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>
                Certifications Included
              </strong>
            </span>
          </div>
        </div>

        {/* Cards Grid Section */}
        <div className='px-4 sm:px-10 lg:px-20 pb-20'>
          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto'>
              {Array.from({ length: 6 }).map((_, idx) => (
                <ShikshaCardSkeleton key={idx} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto'>
              {courses.map((course) => (
                <ShikshaCard
                  key={course.id}
                  {...course}
                  roadmap={course.roadmap}
                  difficultyLevel={course.difficultyLevel}
                />
              ))}
            </div>
          ) : (
            noCourseFoundUI
          )}
        </div>
      </div>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.shikshaExplore })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Home;
