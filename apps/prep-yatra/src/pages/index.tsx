import { SEO, Section,
        FeatureCards,
        PrepYatraHero, 
        InstallButton,
        
        PrepLogsShowcase,
        ProfileShowcase, 
        RecruiterContactsShowcase,
        ResourceSharingShowcase,
        Navbar } from "@tbe/components";
import { getPreFetchProps } from "@tbe/utils";
import { routes, PAGE_REFRESH_TIMEOUT } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";



const Index = ({ seoMeta }: PageProps) => {

    return (
        <> <SEO seoMeta={seoMeta} />
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
           
        </div>
        </>
    );
};
export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.prepYatra })),
  revalidate: PAGE_REFRESH_TIMEOUT.medium,
});

export default Index;
