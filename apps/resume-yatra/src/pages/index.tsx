import Header from "@/components/landing/Header"
import Hero from "@/components/landing/Hero"
import FeatureCards from "@/components/landing/FeatureCards"
import ProvenTemplateSection from "@/components/landing/ProvenTemplateSection"
import InterviewPrepSection from "@/components/landing/InterviewPrepSection"
import Footer from "@/components/landing/Footer"

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
