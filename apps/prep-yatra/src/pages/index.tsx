import {Section} from "@tbe/components";
import {FeatureCards} from "@tbe/components";
import {PrepYatraHero} from "@tbe/components";
import {InstallButton} from "@tbe/components";
import {PrepYatraFooter} from "@tbe/components";
import {PrepLogsShowcase} from "@tbe/components";
import {ProfileShowcase} from "@tbe/components";
import {RecruiterContactsShowcase} from "@tbe/components";
import {ResourceSharingShowcase} from "@tbe/components";
import {Navbar} from "@tbe/components";

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
            <PrepYatraFooter />
        </div>
    );
};

export default Index;
