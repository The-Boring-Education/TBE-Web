import type { PageProps } from "@tbe/interface";
import { Fragment } from "react";

import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import Section from "../../layout/Section";
import SEO from "../../layout/SEO";
import FeatureCards from "../cards/FeatureCards";
import PrepYatraHero from "../features/Hero";
import InstallButton from "../features/InstallButton";
import PrepLogsShowcase from "../showcase/PrepLogsShowcase";
import ProfileShowcase from "../showcase/ProfileShowcase";
import RecruiterContactsShowcase from "../showcase/RecruiterContactsShowcase";
import ResourceSharingShowcase from "../showcase/ResourceSharingShowcase";

export type PrepYatraLandingPageProps = Pick<PageProps, "seoMeta">;

/**
 * Prep Yatra marketing home — composed from shared prepyatra sections.
 */
export function PrepYatraLandingPage({ seoMeta }: PrepYatraLandingPageProps) {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <div className="min-h-screen bg-lightBG">
        <Navbar variant="prepyatra" />
        <Section className="pt-16">
          <InstallButton />
          <PrepYatraHero />
          <FeatureCards />
          <RecruiterContactsShowcase />
          <PrepLogsShowcase />
          <ResourceSharingShowcase />
          <ProfileShowcase />
        </Section>
        <Footer variant="prepyatra" />
      </div>
    </Fragment>
  );
}
