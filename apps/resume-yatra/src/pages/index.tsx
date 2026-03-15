import { Footer, Navbar, SEO } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { Fragment } from "react";

import FeatureCards from "@/components/landing/FeatureCards";
import Hero from "@/components/landing/Hero";
import InterviewPrepSection from "@/components/landing/InterviewPrepSection";
import ProvenTemplateSection from "@/components/landing/ProvenTemplateSection";

export default function Index({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <div className="min-h-screen">
        <Navbar variant="resume-yatra" />
        <Hero />
        <FeatureCards />
        <ProvenTemplateSection />
        <InterviewPrepSection />
        <Footer variant="resumeyatra" />
      </div>
    </Fragment>
  );
}

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: routes.resumeYatra.home,
    appId: "resume-yatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});
