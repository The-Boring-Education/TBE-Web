import {
  CardContainerB,
  CourseFilterSort,
  FlexContainer,
  LinkButton,
  LoadingSpinner,
  Section,
  SEO,
  Text,
} from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import { useApi, useAPIResponseMapper } from '@tbe/hooks';
import type { PageProps, PrimaryCardWithCTAProps } from '@tbe/interface';
import { getPreFetchProps, mapCourseResponseToCard } from '@tbe/utils';
import { Fragment, useMemo, useState } from 'react';

const DIFFICULTY_ORDER: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const Home = ({ seoMeta }: PageProps) => {
  const { response, loading } = useApi('shiksha', {
    url: routes.api.shiksha,
  });

  const courses: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapCourseResponseToCard
  );

  const [filters, setFilters] = useState({ difficulty: 'All', topic: 'All' });
  const [sortOption, setSortOption] = useState('newest');

  const filteredAndSortedCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    let result = [...courses];

    // Apply difficulty filter
    if (filters.difficulty !== 'All') {
      result = result.filter(
        (course) => course.difficultyLevel === filters.difficulty
      );
    }

    // Apply topic filter
    if (filters.topic !== 'All') {
      result = result.filter((course) => course.roadmap === filters.topic);
    }

    // Apply sort
    switch (sortOption) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        );
        break;
      case 'chapters-desc':
        result.sort(
          (a, b) => (b.chaptersCount ?? 0) - (a.chaptersCount ?? 0)
        );
        break;
      case 'chapters-asc':
        result.sort(
          (a, b) => (a.chaptersCount ?? 0) - (b.chaptersCount ?? 0)
        );
        break;
      case 'difficulty-asc':
        result.sort(
          (a, b) =>
            (DIFFICULTY_ORDER[a.difficultyLevel ?? ''] ?? 99) -
            (DIFFICULTY_ORDER[b.difficultyLevel ?? ''] ?? 99)
        );
        break;
    }

    return result;
  }, [courses, filters, sortOption]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const noCourseFoundUI = (!courses || courses.length === 0) && (
    <FlexContainer
      className='w-screen h-screen item-center justify-center flex-col'
      justifyCenter
    >
      <Text className='heading-4 mb-3' level='h1'>
        Oops! No Courses found.
      </Text>
      <LinkButton
        buttonProps={{
          variant: 'PRIMARY',
          text: 'Go Back To Home',
        }}
        href={routes.shiksha}
      />
    </FlexContainer>
  );

  const noFilterResultsUI =
    courses &&
    courses.length > 0 &&
    filteredAndSortedCourses.length === 0 && (
      <FlexContainer
        className='w-full py-16 justify-center flex-col items-center'
        justifyCenter
      >
        <Text className='heading-5 mb-2 text-gray-400' level='h2'>
          No courses match your filters.
        </Text>
        <Text className='text-gray-500' level='p'>
          Try adjusting your filters to find what you&apos;re looking for.
        </Text>
      </FlexContainer>
    );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='px-2 py-4'>
        <FlexContainer className='gap-2 mb-2' direction='col'>
          <Text className='heading-2' level='h1'>
            Explore <span className='text-blue-500'>Courses</span>
          </Text>
          <Text className='text-gray-400 mb-4' level='p'>
            Pick A Course and Start Learning
          </Text>
        </FlexContainer>
        <CourseFilterSort
          onFilterChange={setFilters}
          onSortChange={setSortOption}
        />
        {filteredAndSortedCourses.length > 0 && (
          <CardContainerB
            borderColour={2}
            cards={filteredAndSortedCourses}
            focusText=''
            heading=''
            sectionClassName=''
          />
        )}
        {noFilterResultsUI}
      </Section>
      {noCourseFoundUI}
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.shikshaExplore })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Home;
