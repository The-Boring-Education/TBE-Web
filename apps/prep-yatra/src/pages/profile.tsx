import { ProtectedRoute } from "@tbe/auth";
import { UnifiedProfilePage } from "@tbe/components";
import { DEFAULT_OG_IMAGE } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import type { GetSEOMetaResponseType } from "@tbe/types";

const ProfilePage = ({ seoMeta }: PageProps) => {
  return (
    <ProtectedRoute redirectTo="/login">
      <UnifiedProfilePage
        seoMeta={seoMeta}
        navbarVariant="prepyatra"
        profileRoute="/profile"
      />
    </ProtectedRoute>
  );
};

export const getServerSideProps = async () => ({
  props: {
    seoMeta: {
      title: "Profile | PrepYatra",
      siteName: "PrepYatra",
      description: "View and update your PrepYatra onboarding profile.",
      url: "/profile",
      type: "website",
      robots: "index,follow",
      image: DEFAULT_OG_IMAGE.url,
      keywords:
        "PrepYatra, profile, onboarding, interview preparation, career goals",
      author: "The Boring Education",
      publisher: "The Boring Education",
      linkedIn: "https://www.linkedin.com/company/theboringeducation",
      instagram: "https://www.instagram.com/theboringeducation",
      github: "https://github.com/The-Boring-Education",
    } as GetSEOMetaResponseType,
  },
});

export default ProfilePage;
