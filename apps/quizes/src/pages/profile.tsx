import { ProtectedRoute } from "@tbe/auth";
import { UnifiedProfilePage } from "@tbe/components";
import type { PageProps } from "@tbe/interface";

const QuizesProfilePage = ({ seoMeta }: PageProps) => {
  return (
    <ProtectedRoute redirectTo="/login">
      <UnifiedProfilePage
        seoMeta={seoMeta}
        navbarVariant="quizes"
        profileRoute="/profile"
      />
    </ProtectedRoute>
  );
};

export default QuizesProfilePage;
