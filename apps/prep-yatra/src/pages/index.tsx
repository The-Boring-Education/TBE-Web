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
} from "@tbe/components";

const Index = () => {
    return (
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
    );
};

export default Index;
