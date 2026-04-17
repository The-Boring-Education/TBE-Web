import {
  DSA_YATRA_FAQS,
  DSA_YATRA_FEATURE_SPOTLIGHTS,
  DSA_YATRA_FEATURES,
  routes,
  STATIC_FILE_PATH,
} from "@tbe/constants";
import type { PageProps } from "@tbe/interface";

import LinkButton from "../../common/Buttons/LinkButton";
import FAQSection from "../../common/FAQSection";
import TailorYourJourney from "../../common/TailorYourJourney";
import CardContainerA from "../../containers/Cards/CardContainerA";
import LandingPageHero from "../../containers/Page/common/Hero";
import SEO from "../../layout/SEO";
import { DsaYatraFeatureSpotlights } from "../sections/DsaYatraFeatureSpotlights";

export type DsaYatraLandingPageProps = Pick<PageProps, "seoMeta">;

/**
 * DSA Yatra marketing home (`/`).
 */
export function DsaYatraLandingPage({ seoMeta }: DsaYatraLandingPageProps) {
  return (
    <main
      className="dark min-h-screen w-full bg-dark text-contentDark
      [&_.bg-white]:!bg-[#19191B]
      [&_.border-gray-200]:!border-[#333333]
      [&_.text-gray-800]:!text-contentDark
      [&_.text-gray-700]:!text-grey
      [&_.text-gray-600]:!text-grey
      [&_.text-gray-500]:!text-greyDark
      [&_.from-white]:!from-dark
      [&_.to-\\[\\#f0faff\\]]:!to-[#19191B]
      [&_section]:!bg-transparent
      [&_h1]:!text-contentDark
      [&_h2.text-primary]:!text-primary
      [&_h2:not(.text-primary)]:!text-contentDark
      [&_h3]:!text-contentDark
      [&_h4]:!text-contentDark
      [&_h5]:!text-contentDark
      [&_h6]:!text-contentDark
      [&_.text-contentLight]:!text-contentDark
      [&_.text-greyDark]:!text-grey"
    >
      <SEO seoMeta={seoMeta} />

      <LandingPageHero
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/dsa-yatra.svg`}
        heroText="Stop grinding random LeetCode questions. Follow a structured path tailored to your goals and timeline."
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: "PRIMARY",
              text: "Get Started",
              className: "w-full",
            }}
            className="w-full sm:w-fit"
            href={routes.dsayatra.dashboard}
          />
        }
        sectionHeaderProps={{
          heading: "Stop Grinding Random",
          focusText: "LeetCode Questions",
        }}
        theme="dark"
      />

      <TailorYourJourney
        heading="Tailor Your"
        highlightText="DSA Journey"
        description="Skip the one-size-fits-all approach. Tell us your target role, available time, and current expertise level. We will automatically generate a dynamic curriculum optimized for exactly what you need to succeed."
        features={[
          {
            label: "Set your target",
            description: "Product-based or startups",
          },
          {
            label: "Define your timeline",
            description: "Options from 2 to 12 months",
          },
          {
            label: "Adjust for experience",
            description: "Fresher to Senior levels",
          },
        ]}
        imageVariant="placeholder"
        imageSrc=""
        imageAlt="Tailor your DSA journey — screenshot placeholder"
      />

      <DsaYatraFeatureSpotlights items={DSA_YATRA_FEATURE_SPOTLIGHTS} />

      <div id="features">
        <CardContainerA
          borderColour={4}
          cards={DSA_YATRA_FEATURES}
          focusText="DSA Yatra?"
          heading="Why Choose"
          subtext="We make data structures and algorithms less boring and more effective."
          theme="dark"
        />
      </div>

      <FAQSection
        faqs={DSA_YATRA_FAQS}
        heading="Common Questions"
        theme="dark"
      />
    </main>
  );
}
