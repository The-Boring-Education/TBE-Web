import {
  CardContainerB,
  FlexContainer,
  LinkButton,
  LoadingSpinner,
  SEO,
  SelectInput,
  Text,
} from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import type {
  BaseShikshaCourseResponseProps,
  DifficultyType,
  PageProps,
  RoadmapsType,
} from '@tbe/interface';
import { CACHE_TIMES, queryKeys, useQuery } from '@tbe/query';
import { getPreFetchProps, mapCourseResponseToCard, sendRequest } from '@tbe/utils';
import { Fragment, useMemo, useState } from 'react';

const DIFFICULTY_OPTIONS: Array<DifficultyType | 'All'> = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

const ROADMAP_OPTIONS: Array<RoadmapsType | 'All'> = [
  'All',
  'Frontend',
  'Backend',
  'Fullstack',
  'Tech',
];

const SORT_OPTIONS = [
  'Default',
  'Newest First',
  'Difficulty: Easy → Hard',
  'Difficulty: Hard → Easy',
];

const DIFFICULTY_ORDER: Record<DifficultyType, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? 'border-primary bg-primary text-white'
        : 'border-grey bg-white text-black hover:border-primary hover:text-primary'
    }`}
  >
    {label}
  </button>
);

const Home = ({ seoMeta }: PageProps) => {
  const [difficulty, setDifficulty] = useState<DifficultyType | 'All'>('All');
  const [roadmap, setRoadmap] = useState<RoadmapsType | 'All'>('All');
  const [sortBy, setSortBy] = useState('Default');

  const { data: response, isLoading: loading } = useQuery<any>({
    queryKey: queryKeys.shiksha.lists(),
    queryFn: () => sendRequest({ url: routes.api.shiksha }),
    ...CACHE_TIMES.STATIC,
  });

  const rawCourses: BaseShikshaCourseResponseProps[] = response?.data ?? [];

  const filteredCourses = useMemo(() => {
    let result = [...rawCourses];

    if (difficulty !== 'All') {
      result = result.filter((c) => c.difficultyLevel === difficulty);
    }
    if (roadmap !== 'All') {
      result = result.filter((c) => c.roadmap === roadmap);
    }

    if (sortBy === 'Newest First') {
      result.sort(
        (a, b) =>
          new Date(b.liveOn ?? 0).getTime() - new Date(a.liveOn ?? 0).getTime(),
      );
    } else if (sortBy === 'Difficulty: Easy → Hard') {
      result.sort(
        (a, b) =>
          DIFFICULTY_ORDER[a.difficultyLevel ?? 'Beginner'] -
          DIFFICULTY_ORDER[b.difficultyLevel ?? 'Beginner'],
      );
    } else if (sortBy === 'Difficulty: Hard → Easy') {
      result.sort(
        (a, b) =>
          DIFFICULTY_ORDER[b.difficultyLevel ?? 'Beginner'] -
          DIFFICULTY_ORDER[a.difficultyLevel ?? 'Beginner'],
      );
    }

    return result;
  }, [rawCourses, difficulty, roadmap, sortBy]);

  const courses = mapCourseResponseToCard(filteredCourses);

  const clearFilters = () => {
    setDifficulty('All');
    setRoadmap('All');
    setSortBy('Default');
  };

  const hasActiveFilters =
    difficulty !== 'All' || roadmap !== 'All' || sortBy !== 'Default';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (rawCourses.length === 0) {
    return (
      <Fragment>
        <SEO seoMeta={seoMeta} />
        <FlexContainer
          className='w-screen h-screen item-center justify-center flex-col'
          justifyCenter
        >
          <Text className='heading-4 mb-3' level='h1'>
            Oops! No Courses found.
          </Text>
          <LinkButton
            buttonProps={{ variant: 'PRIMARY', text: 'Go Back To Home' }}
            href={routes.shiksha}
          />
        </FlexContainer>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />

      <div className='mx-auto max-w-7xl px-4 pb-2 pt-6 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <Text level='span' className='text-xs font-semibold text-grey'>
                Difficulty:
              </Text>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt}
                  label={opt}
                  active={difficulty === opt}
                  onClick={() => setDifficulty(opt as DifficultyType | 'All')}
                />
              ))}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Text level='span' className='text-xs font-semibold text-grey'>
                Topic:
              </Text>
              {ROADMAP_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt}
                  label={opt}
                  active={roadmap === opt}
                  onClick={() => setRoadmap(opt as RoadmapsType | 'All')}
                />
              ))}
            </div>
          </div>

          <div className='flex items-center gap-2 self-start'>
            <Text
              level='span'
              className='whitespace-nowrap text-xs font-semibold text-grey'
            >
              Sort by:
            </Text>
            <SelectInput
              list={SORT_OPTIONS}
              selectedItem={sortBy}
              onChange={setSortBy}
              className='w-52'
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className='mt-3 flex items-center gap-2'>
            <Text level='span' className='text-xs text-grey'>
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? 's' : ''} found
            </Text>
            <button onClick={clearFilters} className='text-xs text-primary underline'>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {courses && courses.length > 0 ? (
        <CardContainerB
          borderColour={2}
          cards={courses}
          focusText='Courses'
          heading='Explore'
          sectionClassName='px-2 py-4'
          subtext='Pick A Course and Start Learning'
        />
      ) : (
        <FlexContainer className='w-full py-16 flex-col' justifyCenter>
          <Text className='heading-4 mb-3' level='h1'>
            No courses match your filters.
          </Text>
          <button onClick={clearFilters} className='text-sm text-primary underline'>
            Clear filters
          </button>
        </FlexContainer>
      )}
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.shikshaExplore })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Home;
