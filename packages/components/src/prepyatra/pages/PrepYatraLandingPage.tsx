import {
  FAQSection,
  FlexContainer,
  Footer,
  LandingPageHero,
  LinkButton,
  Marquee,
  Navbar,
  Section,
  SectionHeaderContainer,
} from "@tbe/components";
import {
  PREP_YATRA_FAQS,
  PREP_YATRA_FEATURE_SPOTLIGHTS,
  PREP_YATRA_FEATURES,
} from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { Fragment } from "react";

import SEO from "../../layout/SEO";
import InstallButton from "../features/InstallButton";
import { PrepYatraFeatureSpotlights } from "../sections/PrepYatraFeatureSpotlights";

export type PrepYatraLandingPageProps = Pick<PageProps, "seoMeta">;

/**
 * Prep Yatra marketing home page.
 *
 * Fully prop-driven so it can be reused across any app.
 * Uses a modern, sleek light theme matching the Yatra ecosystem.
 */
export function PrepYatraLandingPage({ seoMeta }: PrepYatraLandingPageProps) {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <main className="min-h-screen w-full bg-white text-contentLight">
        <Navbar variant="prepyatra" />
        <InstallButton />

        <div className="pt-24">
          <LandingPageHero
            backgroundImageUrl="/landing.png"
            heroText="The ultimate community platform for job hunters to store recruiter contacts, share prep logs, and crowdsource resources together."
            primaryButton={
              <LinkButton
                buttonProps={{
                  variant: "PRIMARY",
                  text: "Start Your Prep Journey",
                  className: "w-full",
                }}
                className="w-11/12 sm:w-fit"
                href="/login"
              />
            }
            sectionHeaderProps={{
              heading: "Master Your",
              focusText: "Interview Prep",
            }}
            theme="light"
          />
        </div>

        <PrepYatraFeatureSpotlights items={PREP_YATRA_FEATURE_SPOTLIGHTS} />

        <div id="features">
          <Section className="overflow-hidden pt-16 pb-8">
            <FlexContainer className="gap-8" direction="col">
              <SectionHeaderContainer
                focusText="Prep Yatra?"
                heading="Why Choose"
                subtext="Everything you need to organize your preparation and land your dream job."
                theme="light"
              />
              <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                <Marquee
                  items={PREP_YATRA_FEATURES.map((item) => ({
                    title: item.title,
                    description: item.content,
                  }))}
                />

                {/* Add a fade effect on edges for a better marquee look */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-white dark:from-background" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-white dark:from-background" />
              </div>
            </FlexContainer>
          </Section>
        </div>

        <FAQSection
          faqs={PREP_YATRA_FAQS}
          heading="Common Questions"
          theme="light"
        />

        <Footer variant="prepyatra" />
      </main>
    </Fragment>
  );
}
