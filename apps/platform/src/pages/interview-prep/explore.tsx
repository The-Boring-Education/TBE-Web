import {
  CardContainerB,
  FlexContainer,
  LinkButton,
  LoadingSpinner,
  Section,
  SEO,
  Text,
} from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import type { PageProps, PrimaryCardWithCTAProps } from '@tbe/interface';
import { CACHE_TIMES, queryKeys, useQuery } from '@tbe/query';
import {
  getPreFetchProps,
  mapInterviewSheetResponseToCard,
  sendRequest,
} from '@tbe/utils';
import Image from 'next/image';
import { Fragment, useEffect, useMemo, useState } from 'react';
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

  // Check purchase status for each premium sheet
  useEffect(() => {
    if (response?.data && user?.id) {
      const checkPurchaseStatuses = async () => {
        const statuses: Record<string, boolean> = {};

        for (const sheet of response.data) {
          if (sheet.isPremium) {
            try {
              const response = await fetch(
                `${routes.api.base}${routes.api.checkStatus}?userId=${user.id}&productId=${sheet._id}`,
                { method: 'GET' },
              );
              const result = await response.json();
              statuses[sheet._id] = result.status && result.data?.purchased;
            } catch (error) {
              statuses[sheet._id] = false;
            }
          } else {
            statuses[sheet._id] = false; // Free sheets are not "purchased", they're just free
          }
        }

        setPurchaseStatuses(statuses);
      };

      checkPurchaseStatuses();
    }
  }, [response?.data, user?.id]);

  const sheets: PrimaryCardWithCTAProps[] = useMemo(() => {
    if (!response?.data) return [];

    // Filter out DSA sheets - they have their own section
    return response.data
      .filter((sheet: any) => {
        const roadmap = sheet?.roadmap || '';
        return roadmap.toLowerCase() !== 'dsa';
      })
      .map((sheet: any) => {
        const baseCard = mapInterviewSheetResponseToCard([sheet])[0];
        const isPurchased = purchaseStatuses[sheet._id] || false;

        return {
          ...baseCard,
          isPurchased: sheet.isPremium ? isPurchased : false, // Only premium sheets can be purchased
          isPremium: sheet.isPremium && !isPurchased, // Only show premium if not purchased
        };
      });
  }, [response?.data, purchaseStatuses]);

  // Group by roadmap/domain for structured sections
  const groupedByRoadmap = useMemo(() => {
    const groups: Record<string, PrimaryCardWithCTAProps[]> = {};

    (response?.data || []).forEach((sheet: any) => {
      // Filter out DSA sheets - they have their own section
      const roadmap = sheet?.roadmap || '';
      if (roadmap.toLowerCase() === 'dsa') return;

      const normalizedRoadmap = roadmap || 'Tech';
      if (!groups[normalizedRoadmap]) {
        groups[normalizedRoadmap] = [];
      }

      const card = (sheets || []).find((c) => c.id === sheet._id);
      if (card) {
        groups[normalizedRoadmap].push(card);
      }
    });

    return groups;
  }, [response?.data, sheets]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const noSheetFoundUI = (!sheets || sheets.length === 0) && (
    <FlexContainer
      className='w-screen h-screen item-center justify-center flex-col'
      justifyCenter
    >
      <Text className='heading-4 mb-3' level='h1'>
        Oops! No Sheets found.
      </Text>
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

      {/* Header Section */}
      <Section className='bg-lightBG py-5'>
        <div className='max-w-6xl mx-auto px-4 text-center'>
          <div className='text-3xl font-bold mb-4'>
            <Text className='text-gray-900 inline' level='span'>
              Explore{' '}
            </Text>
            <Text className='text-primary inline' level='span'>
              Interview Prep Sheets
            </Text>
          </div>
          <Text className='text-lg text-gray-600' level='p'>
            Choose from our carefully curated collection of interview questions,
            organized by technology domains
          </Text>
        </div>
      </Section>

      {/* Domain-wise Content */}
      <Section className='py-8'>
        {Object.entries(groupedByRoadmap).length > 0 ? (
          <div className='space-y-12'>
            <div className='max-w-7xl mx-auto px-4 flex justify-center mb-8'>
              <Image
                src='/svg/undraw_interview_yz52.svg'
                alt='Interview Preparation'
                width={400}
                height={400}
                priority
              />
            </div>

            {Object.entries(groupedByRoadmap).map(([roadmap, cards]) => (
              <div key={roadmap} className='max-w-7xl mx-auto px-4'>
                {/* Domain Header */}
                <div className='mb-8 text-center'>
                  <div
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4 ${
                      roadmap === 'Frontend'
                        ? 'bg-blue-100 text-blue-800'
                        : roadmap === 'Backend'
                          ? 'bg-green-100 text-green-800'
                          : roadmap === 'Fullstack'
                            ? 'bg-purple-100 text-purple-800'
                            : roadmap === 'DSA'
                              ? 'bg-orange-100 text-orange-800'
                              : roadmap === 'Tech'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span className='text-2xl'>
                      {roadmap === 'Frontend'
                        ? '🎨'
                        : roadmap === 'Backend'
                          ? '⚙️'
                          : roadmap === 'Fullstack'
                            ? '🚀'
                            : roadmap === 'DSA'
                              ? '📊'
                              : roadmap === 'Tech'
                                ? '💻'
                                : '💻'}
                    </span>
                    <Text level='h3' className='text-lg font-semibold'>
                      {roadmap} Domain
                    </Text>
                  </div>
                  <Text
                    className='text-3xl font-bold text-gray-900 mb-2'
                    level='h2'
                  >
                    {roadmap} Interview Sheets
                  </Text>
                  <Text className='text-gray-600 max-w-2xl mx-auto' level='p'>
                    Master {roadmap.toLowerCase()} interviews with real
                    questions asked by top companies
                  </Text>
                </div>

                {/* Cards Grid */}
                <CardContainerB
                  borderColour={2}
                  cards={cards || []}
                  focusText={`${cards?.length || 0} Sheet${
                    (cards?.length || 0) > 1 ? 's' : ''
                  } Available`}
                  heading=''
                  sectionClassName='px-0'
                  subtext=''
                />
              </div>
            ))}
          </div>
        ) : (
          noSheetFoundUI
        )}
      </Section>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.interviewPrepExplore })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Home;
