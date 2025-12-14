import {
  FeatureCards,
  Footer,
  InstallButton,
  Navbar,
  PrepLogsShowcase,
  PrepYatraHero,
  ProfileShowcase,
  RecruiterContactsShowcase,
  ResourceSharingShowcase,
  Section,
  SEO,
} from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const Index = ({ seoMeta }: PageProps) => {
    return (
        <Fragment>
            <SEO seoMeta={seoMeta} />
            <div className='min-h-screen bg-lightBG'>
                <Navbar variant='prepyatra' />
                <Section className='pt-16'>
                    <InstallButton />
                    <PrepYatraHero />
                    <FeatureCards />
                    <RecruiterContactsShowcase />
                    <PrepLogsShowcase />
                    <ResourceSharingShowcase />
                    <ProfileShowcase />
                </Section>
                <Footer variant="prepyatra"/>
            </div>
        </Fragment>
    );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.prepYatra.home, appId: "prep-yatra" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Index;
