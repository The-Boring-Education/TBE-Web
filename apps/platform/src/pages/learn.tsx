import { LearnDashboardContainer, LoadingSpinner, SEO } from '@tbe/components';
import { routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect } from 'react';

const LearnPage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { user, isAuth, loading: loadingUser } = useUser();

  useEffect(() => {
    if (!loadingUser && !isAuth) {
      router.push(`/login?returnTo=${encodeURIComponent(routes.learn)}`);
    }
  }, [isAuth, loadingUser, router]);

  if (loadingUser) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return (
    <Fragment>
      <SEO
        seoMeta={
          seoMeta || {
            title: 'Learn & Personalization Dashboard | The Boring Education',
            description:
              'Your personalized learning dashboard, course recommendations, and progress tracking.',
          }
        }
      />
      <LearnDashboardContainer user={user} />
    </Fragment>
  );
};

export const getServerSideProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.learn })),
});

export default LearnPage;
