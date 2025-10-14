import FeatureCards from "@/components/landing/FeatureCards"
import Footer from "@/components/landing/Footer"
import Header from "@/components/landing/Header"
import Hero from "@/components/landing/Hero"
import InterviewPrepSection from "@/components/landing/InterviewPrepSection"
import ProvenTemplateSection from "@/components/landing/ProvenTemplateSection"

export default function Index() {
    return (
        <div className='min-h-screen'>
            <Header />
            <Hero />
            <FeatureCards />
            <ProvenTemplateSection />
            <InterviewPrepSection />
            <Footer />
        </div>
    )
}
