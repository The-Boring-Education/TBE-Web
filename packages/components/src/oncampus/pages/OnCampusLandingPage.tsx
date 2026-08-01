import { CAMPUS_PREP_RESOURCES } from "@tbe/constants";
import { usePaymentStatus, useUser } from "@tbe/hooks";
import { useRouter } from "next/router";
import { Fragment } from "react";

import Marquee from "../../common/Marquee";
import OnCampusLandingHero from "../../containers/Page/common/OnCampusLandingHero";
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

  return (
    <Fragment>
      <Navbar
        variant="oncampus"
        theme="dark"
        hidePricingLink={isPurchased === true}
        profileRoute="/profile"
      />
      <main className="dark min-h-screen bg-[#0A0A0C] pt-20 text-white">
        <OnCampusLandingHero
          ctaText="Get Started for Free →"
          ctaHref="/login"
        />

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
