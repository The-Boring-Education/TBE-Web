import { ProtectedRoute } from "@tbe/auth";
import { UnifiedProfilePage } from "@tbe/components";
import type { PageProps } from "@tbe/interface";

const ProfilePage = ({ seoMeta }: PageProps) => {
  return (
    <ProtectedRoute redirectTo="/login">
      <UnifiedProfilePage
        seoMeta={seoMeta}
        navbarVariant="resume-yatra"
        profileRoute="/profile"
      />
    </ProtectedRoute>
  );
};

export default ProfilePage;
