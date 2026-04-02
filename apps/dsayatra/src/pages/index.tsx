import {
  CardContainerA,
  FAQSection,
  LandingPageHero,
  LinkButton,
  SEO,
} from "@tbe/components";
import {
  DSA_YATRA_FEATURES,
  PAGE_REFRESH_TIMEOUT,
  routes,
  STATIC_FILE_PATH,
} from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";

import { DSA_YATRA_FAQS } from "@/data/dsaData";

const LandingPage = ({ seoMeta }: PageProps) => (
  <main
    className="dark min-h-screen bg-dark text-contentDark
      [&_.bg-white]:!bg-[#19191B] 
      [&_.border-gray-200]:!border-[#333333] 
      [&_.text-gray-800]:!text-contentDark 
      [&_.text-gray-700]:!text-grey 
      [&_.text-gray-600]:!text-grey 
      [&_.text-gray-500]:!text-greyDark 
      [&_.from-white]:!from-dark 
      [&_.to-\\[\\#f0faff\\]]:!to-[#19191B] 
      [&_section]:!bg-transparent
      [&_h2.text-primary]:!text-primary
      [&_h2:not(.text-primary)]:!text-contentDark
      [&_h3]:!text-contentDark
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

    <FAQSection faqs={DSA_YATRA_FAQS} heading="Common Questions" theme="dark" />
  </main>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: "/", appId: "dsayatra" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default LandingPage;
