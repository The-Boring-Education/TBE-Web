import { CAMPUS_PREP_RESOURCES } from "@tbe/constants";
import { usePaymentStatus, useUser } from "@tbe/hooks";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment } from "react";

import Button from "../../common/Buttons/Button";
import Marquee from "../../common/Marquee";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import {
  AptitudeAnswerVisual,
  DsaPreparationVisual,
  InterviewSheetsVisual,
  OnCampusFeatureSection,
  QuizzesVisual,
} from "./OnCampusLandingVisuals";

/**
 * On Campus marketing landing (`/` and `/campus-prep`) — hero, resources grid, nav/footer.
 */
export default function OnCampusLandingPage() {
  const router = useRouter();
  const { user } = useUser();

  const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: "oncampus",
    productType: "ONCAMPUS",
    isPremium: true,
  });

  const comingSoonItems = CAMPUS_PREP_RESOURCES.filter(
    (item) => !item.isAvailable,
  ).map((item) => ({
    title: item.title,
    description: item.desc,
  }));

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <Fragment>
      <Navbar
        variant="oncampus"
        theme="dark"
        hidePricingLink={isPurchased === true}
        profileRoute="/profile"
      />
      <main className="dark min-h-screen bg-[#0A0A0A] pt-20 text-white">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-3 text-left">
              <h1 className="text-4xl font-bold leading-tight md:text-4xl lg:text-4xl">
                <span className="text-white">Advance Your Career with </span>
                <span className="text-[#FF5757]">OnCampus</span>
              </h1>
              <p className="text-sm leading-relaxed text-white/70">
                Prepare smarter for placements with guided aptitude, quizzes,
                interview prep, and resume resources in one focused dashboard.
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Button
                  text="Get Started for Free"
                  onClick={handleGetStarted}
                  variant="PRIMARY"
                  className="bg-[#FF5757] text-sm font-semibold text-white hover:bg-[#FF5757]/90"
                  size="MEDIUM"
                  animationType="BOUNCE"
                />
              </div>
              <p className="text-xs text-white/40">
                Built for campus schedules
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-xl">
                <Image
                  src="/landing.svg"
                  alt="Students studying with laptops"
                  width={650}
                  height={560}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <OnCampusFeatureSection
          eyebrow="Interview Sheets"
          title="Structured Interview Sheets for Campus Rounds"
          description="Prepare from focused interview sheets for technical, HR, and company-specific rounds in the same structure as our Interview Prep navigation."
          subheadingLines={[
            "Backend stack sheets: Java, C++, Node.js, Python",
            "Frontend sheets: JavaScript and React.js",
            "Database sheet: SQL, DBMS, and MongoDB",
          ]}
        >
          <InterviewSheetsVisual />
        </OnCampusFeatureSection>

        <OnCampusFeatureSection
          reverse
          eyebrow="DSA Preparation"
          title="Topic-wise DSA Practice Flow"
          description="Follow a clean roadmap from core topics to advanced patterns, aligned with the DSA Preparation item in OnCampus."
          subheadingLines={[
            "Build fundamentals with Arrays, Strings, Linked Lists",
            "Level up with Trees, Graphs, and traversal patterns",
            "Master interview sets with DP and Greedy practice",
          ]}
        >
          <DsaPreparationVisual />
        </OnCampusFeatureSection>

        <OnCampusFeatureSection
          eyebrow="Quizzes"
          title="Daily Quizzes with Progress Signals"
          description="Track quiz attempts, streaks, and accuracy in one place, matching the current Quizzes experience available in OnCampus."
        >
          <QuizzesVisual />
        </OnCampusFeatureSection>

        <OnCampusFeatureSection
          reverse
          eyebrow="Aptitude Practice"
          title="Interactive Aptitude Answer Selection"
          description="Practice aptitude with an option-based interaction model. Tap answers quickly and build speed for placement test formats."
        >
          <AptitudeAnswerVisual />
        </OnCampusFeatureSection>

        <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            <span className="text-white">What’s </span>
            <span className="text-[#FF5757]">Coming Soon</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/65 sm:text-base">
            Upcoming additions to OnCampus. Subtle preview only, full modules
            are rolling out in phases.
          </p>
          <Marquee className="mt-8" items={comingSoonItems} />
        </section>
      </main>
      <Footer variant="oncampus" />
    </Fragment>
  );
}
