import {
  CardContainerA,
  FAQSection,
  LandingPageHero,
  LinkButton,
  SEO,
  TailorYourJourney,
} from "@tbe/components";
import {
  DSA_YATRA_FEATURES,
  PAGE_REFRESH_TIMEOUT,
  routes,
  STATIC_FILE_PATH,
} from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { Fragment } from "react";

import { DSA_YATRA_FAQS } from "@/data/dsaData";

const LandingPage = ({ seoMeta }: PageProps) => (
  <Fragment>
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
    />

    {/* Tailor Your DSA Journey Section */}
    <TailorYourJourney />

    <div id="features">
      <CardContainerA
        borderColour={4}
        cards={DSA_YATRA_FEATURES}
        focusText="DSA Yatra?"
        heading="Why Choose"
        subtext="We make data structures and algorithms less boring and more effective."
      />
    </div>

    <FAQSection faqs={DSA_YATRA_FAQS} heading="Common Questions" />
  </Fragment>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: "/", appId: "dsayatra" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default LandingPage;
