import {
  FAQSection,
  FlexContainer,
  Footer,
  Marquee,
  Navbar,
  Section,
  SectionHeaderContainer,
} from "@tbe/components";
import {
  RESUME_YATRA_FAQS,
  RESUME_YATRA_FEATURE_SPOTLIGHTS,
  RESUME_YATRA_FEATURES,
} from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import type { ResumeYatraFeatureSpotlightItem } from "@tbe/types";

import SEO from "../../layout/SEO";
import ResumeYatraHero from "../features/Hero";
import { ResumeYatraFeatureSpotlights } from "../sections/ResumeYatraFeatureSpotlights";

export type ResumeYatraLandingPageProps = Pick<PageProps, "seoMeta"> & {
  /**
   * Override the default hero component.
   */
  heroComponent?: React.ReactNode;
  /**
   * Override the default feature spotlight items.
   * Defaults to RESUME_YATRA_FEATURE_SPOTLIGHTS from constants.
   */
  featureSpotlights?: ResumeYatraFeatureSpotlightItem[];
  /**
   * Override the default feature cards.
   * Defaults to RESUME_YATRA_FEATURES from constants.
   */
  featureCards?: typeof RESUME_YATRA_FEATURES;
  /**
   * Override the default FAQ items.
   * Defaults to RESUME_YATRA_FAQS from constants.
   */
  faqs?: typeof RESUME_YATRA_FAQS;
};

/**
 * Resume Yatra marketing home page (`/`).
 *
 * Fully prop-driven so it can be reused across any app.
 * Uses the light theme matching Resume Yatra's brand.
 */
export function ResumeYatraLandingPage({
  seoMeta,
  heroComponent,
  featureSpotlights = RESUME_YATRA_FEATURE_SPOTLIGHTS,
  featureCards = RESUME_YATRA_FEATURES,
  faqs = RESUME_YATRA_FAQS,
}: ResumeYatraLandingPageProps) {
  return (
    <main className="min-h-screen w-full bg-white text-contentLight">
      <SEO seoMeta={seoMeta} />

      <Navbar variant="resume-yatra" profileRoute="/profile" />

      {heroComponent ? heroComponent : <ResumeYatraHero />}

      <ResumeYatraFeatureSpotlights items={featureSpotlights} />

      <div id="features">
        <Section className="overflow-hidden pt-16 pb-8">
          <FlexContainer className="gap-8" direction="col">
            <SectionHeaderContainer
              focusText="Resume Yatra?"
              heading="Why Choose"
              subtext="Everything you need to build a resume that gets noticed — not filtered out."
              theme="light"
            />
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
              <Marquee
                theme="light"
                items={featureCards.map((item) => ({
                  title: item.title,
                  description: item.content,
                }))}
              />

              {/* Add a fade effect on edges for a better marquee look */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-white to-transparent" />
            </div>
          </FlexContainer>
        </Section>
      </div>

      <FAQSection faqs={faqs} heading="Common Questions" theme="light" />

      <Footer variant="resumeyatra" />
    </main>
  );
}
