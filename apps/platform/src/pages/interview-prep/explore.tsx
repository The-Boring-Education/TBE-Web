import { FlexContainer, LinkButton, SEO, SheetCard } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import type { PageProps, PrimaryCardWithCTAProps } from '@tbe/interface';
import { CACHE_TIMES, queryKeys, useQuery } from '@tbe/query';
import {
  getPreFetchProps,
  mapInterviewSheetResponseToCard,
  sendRequest,
} from '@tbe/utils';
import { FileText, HelpCircle, Layers, Users } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';

const SheetCardSkeleton = () => (
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
    queryKey: queryKeys.interviewPrep.lists(),
    queryFn: () => sendRequest({ url: routes.api.interviewPrep }),
    ...CACHE_TIMES.STATIC,
  });

  const { user } = useUser();
  const [purchaseStatuses, setPurchaseStatuses] = useState<
    Record<string, boolean>
  >({});

  // Optimized parallel check for purchase status of premium sheets
  useEffect(() => {
    if (!response?.data || !user?.id) return;

    let isMounted = true;
    const premiumSheets = response.data.filter((sheet: any) => sheet.isPremium);

    if (premiumSheets.length === 0) return;

    Promise.all(
      premiumSheets.map(async (sheet: any) => {
        try {
          const res = await fetch(
            `${routes.api.base}${routes.api.checkStatus}?userId=${user.id}&productId=${sheet._id}`,
          );
          const result = await res.json();
          return {
            id: sheet._id,
            purchased: Boolean(result?.status && result?.data?.purchased),
          };
        } catch {
          return { id: sheet._id, purchased: false };
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

  // Map sheets with extra DB attributes
  const sheets: (PrimaryCardWithCTAProps & {
    roadmap?: string;
    totalQuestions?: number;
  })[] = useMemo(() => {
    if (!response?.data) return [];

    return response.data
      .filter((sheet: any) => {
        const roadmap = sheet?.roadmap || '';
        return roadmap.toLowerCase() !== 'dsa';
      })
      .map((sheet: any) => {
        const baseCard = mapInterviewSheetResponseToCard([sheet])[0];
        const isPurchased = purchaseStatuses[sheet._id] || false;

        const count =
          (Array.isArray(sheet.questions) ? sheet.questions.length : 0) ||
          sheet.totalQuestions ||
          sheet.questionsCount ||
          0;

        return {
          ...baseCard,
          roadmap: sheet.roadmap,
          totalQuestions: count,
          isPurchased: sheet.isPremium ? isPurchased : false,
          isPremium: sheet.isPremium && !isPurchased,
        };
      });
  }, [response?.data, purchaseStatuses]);

  // Total questions count calculation
  const totalQuestionsCount = useMemo(() => {
    return sheets.reduce((acc, sheet) => acc + (sheet.totalQuestions || 0), 0);
  }, [sheets]);

  const noSheetFoundUI = !loading && sheets.length === 0 && (
    <FlexContainer
      className='w-full py-16 items-center justify-center flex-col text-center'
      justifyCenter
    >
      <h2 className='font-headings font-bold text-2xl text-foreground mb-2'>
        No Sheets Available
      </h2>
      <p className='text-muted-foreground mb-6 font-body text-sm'>
        No interview prep sheets found at the moment.
      </p>
      <LinkButton
        buttonProps={{
          variant: 'PRIMARY',
          text: 'Go Back To Home',
        }}
        href={routes.interviewPrep}
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
            <Layers className='w-3.5 h-3.5 text-primary' />
            <span>Interview Preparation</span>
          </div>
          <h1 className='font-headings font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 leading-tight'>
            Explore <span className='text-primary'>Interview Prep Sheets</span>
          </h1>
          <p className='text-base text-muted-foreground max-w-xl mx-auto leading-relaxed'>
            Choose from our carefully curated collection of interview questions,
            organized by technology domains
          </p>
        </div>

        {/* Stats Row */}
        <div className='px-4 sm:px-10 lg:px-20 pb-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8'>
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <FileText className='w-4 h-4 text-primary shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>
                {loading ? '...' : sheets.length}
              </strong>{' '}
              Sheets Available
            </span>
          </div>
          <div className='w-1.5 h-1.5 rounded-full bg-border hidden sm:block' />
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <HelpCircle className='w-4 h-4 text-primary shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>
                {loading
                  ? '...'
                  : totalQuestionsCount > 0
                    ? `${totalQuestionsCount}+`
                    : '845+'}
              </strong>{' '}
              Total Questions
            </span>
          </div>
          <div className='w-1.5 h-1.5 rounded-full bg-border hidden sm:block' />
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <Users className='w-4 h-4 text-primary shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>12,400+</strong>{' '}
              Students Practicing
            </span>
          </div>
        </div>

        {/* Cards Grid Section */}
        <div className='px-4 sm:px-10 lg:px-20 pb-20'>
          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto'>
              {Array.from({ length: 6 }).map((_, idx) => (
                <SheetCardSkeleton key={idx} />
              ))}
            </div>
          ) : sheets.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto'>
              {sheets.map((sheet) => (
                <SheetCard
                  key={sheet.id}
                  {...sheet}
                  roadmap={sheet.roadmap}
                  totalQuestions={sheet.totalQuestions}
                />
              ))}
            </div>
          ) : (
            noSheetFoundUI
          )}
        </div>
      </div>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.interviewPrepExplore })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Home;
