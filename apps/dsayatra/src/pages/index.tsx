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
    <div
      id="tailor-journey"
      className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 md:py-16"
    >
      <div className="flex flex-col items-center gap-12 lg:flex-row">
        <div className="flex-1 space-y-6">
          <h2 className="text-left text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Tailor Your <span className="text-primary">DSA Journey</span>
          </h2>
          <p className="text-left text-lg text-gray-600 dark:text-gray-400">
            Skip the one-size-fits-all approach. Tell us your target role,
            available time, and current expertise level. We will automatically
            generate a dynamic curriculum optimized for exactly what you need to
            succeed.
          </p>
          <ul className="space-y-4 text-left text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>
                <strong>Set your target:</strong> Product-based or startups
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>
                <strong>Define your timeline:</strong> Options from 2 to 12
                months
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>
                <strong>Adjust for experience:</strong> Fresher to Senior levels
              </span>
            </li>
          </ul>
        </div>
        <div className="flex w-full flex-1 justify-center lg:justify-end">
          <img
            src="/tailor-journey.png"
            alt="Tailor your DSA journey interactive form"
            className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl"
          />
        </div>
      </div>
    </div>

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
