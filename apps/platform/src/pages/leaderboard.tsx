import { LoadingSpinner, SEO } from '@tbe/components';
import { routes } from '@tbe/constants';
import { LeaderboardPageContent } from '@tbe/gamification';
import { useUser } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect } from 'react';

const LeaderboardPage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { isAuth, loading } = useUser();

  useEffect(() => {
    if (!loading && !isAuth) void router.push(routes.home);
  }, [loading, isAuth, router]);

  if (loading || !isAuth) return <LoadingSpinner />;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LeaderboardPageContent />
    </Fragment>
  );
};

export const getServerSideProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.leaderboard })),
});

export default LeaderboardPage;
