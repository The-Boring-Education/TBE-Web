import FeatureCards from "@/components/cards/FeatureCards";
import Hero from "@/components/features/Hero";
import InstallButton from "@/components/features/InstallButton";
import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import PrepLogsShowcase from "@/components/showcase/PrepLogsShowcase";
import ProfileShowcase from "@/components/showcase/ProfileShowcase";
import RecruiterContactsShowcase from "@/components/showcase/RecruiterContactsShowcase";
import ResourceSharingShowcase from "@/components/showcase/ResourceSharingShowcase";

const Index = () => {
    return (
        <div className='min-h-screen'>
            <Navigation />
            <InstallButton />
            <Hero />
            <FeatureCards />
            <RecruiterContactsShowcase />
            <PrepLogsShowcase />
            <ResourceSharingShowcase />
            <ProfileShowcase />
            <Footer />
        </div>
    );
};

export default Index;
