import { ProtectedRoute } from "@tbe/auth";
import { UnifiedProfilePage } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";

const ProfilePage = ({ seoMeta }: PageProps) => {
  return (
    <ProtectedRoute redirectTo="/login">
      <UnifiedProfilePage
        seoMeta={seoMeta}
        navbarVariant="dsayatra"
        profileRoute="/profile"
      />
    </ProtectedRoute>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: routes.dsayatra.home,
    appId: "dsayatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default ProfilePage;
