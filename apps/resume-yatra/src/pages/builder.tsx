import { ProtectedRoute } from "@tbe/auth";
import { Navbar } from "@tbe/components";

import BuilderMain from "@/components/builder/BuilderMain";
import InitialChoice from "@/components/builder/InitialChoice";
import ResultScreen from "@/components/builder/ResultScreen";
import TemplatePrompt from "@/components/builder/TemplatePrompt";
import { useResumeBuilder } from "@/hooks/use-resume-builder";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <svg
      className="w-8 h-8 animate-spin text-[#ef4444]"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
);

function BuilderContent() {
  const builder = useResumeBuilder();

  // Show initial choice screen
  if (builder.hasResume === null) {
    return <InitialChoice builder={builder} />;
  }

  // Show template prompt if user chose to create new resume
  if (!builder.hasResume && !builder.showTemplate) {
    return <TemplatePrompt builder={builder} />;
  }

  // Show result screen
  if (builder.showResult) {
    return <ResultScreen builder={builder} />;
  }

  // Show main builder interface
  return <BuilderMain builder={builder} />;
}

export default function Builder() {
  return (
    <ProtectedRoute redirectTo="/login" loadingComponent={<LoadingScreen />}>
      <Navbar variant="resume-yatra" profileRoute="/profile" />
      <BuilderContent />
    </ProtectedRoute>
  );
}

// Force SSR for this page
export async function getServerSideProps() {
  return {
    props: {},
  };
}
