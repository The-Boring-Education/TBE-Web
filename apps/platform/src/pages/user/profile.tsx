import { UnifiedProfilePage } from '@tbe/components';
import { routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';

const ProfilePage = ({ seoMeta }: PageProps) => {
  return (
    <UnifiedProfilePage
      seoMeta={seoMeta}
      navbarVariant='platform'
      profileRoute='/user/profile'
    />
  );
};

export const getServerSideProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.user.profile })),
});

export default ProfilePage;
