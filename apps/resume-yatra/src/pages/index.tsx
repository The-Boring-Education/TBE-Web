import { Footer,Navbar } from "@tbe/components"

import FeatureCards from "@/components/landing/FeatureCards"
import Hero from "@/components/landing/Hero"
import InterviewPrepSection from "@/components/landing/InterviewPrepSection"
import ProvenTemplateSection from "@/components/landing/ProvenTemplateSection"

export default function Index() {
    return (
        <div className='min-h-screen'>
            <Navbar variant='resume-yatra' />
            <Hero />
            <FeatureCards />
            <ProvenTemplateSection />
            <InterviewPrepSection />
            <Footer variant="resumeyatra" />
        </div>
    )
}   
