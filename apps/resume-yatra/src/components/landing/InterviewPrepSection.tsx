import { Brain, Code, ExternalLink,MessageSquare, Target } from "lucide-react"

import { Button } from "@/components/ui/button"

const InterviewPrepSection = () => {
    const features = [
        {
            icon: Code,
            title: "Coding Challenges",
            description: "Practice real interview problems"
        },
        {
            icon: MessageSquare,
            title: "Mock Interviews",
            description: "Get feedback from experts"
        },
        {
            icon: Brain,
            title: "System Design",
            description: "Master complex architectures"
        },
        {
            icon: Target,
            title: "Company Specific",
            description: "Tailored prep for top companies"
        }
    ]

    return (
        <section className='py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden'>
            {/* Animated Background Elements */}
            <div className='absolute top-10 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-pulse' />
            <div className='absolute bottom-20 right-20 w-32 h-32 bg-cyan-200 rounded-full opacity-30 animate-bounce' />
            <div className='absolute top-1/2 left-1/4 w-16 h-16 bg-teal-300 rounded-full opacity-25 animate-ping' />

            <div className='container mx-auto px-6 relative z-10'>
                <div className='max-w-6xl mx-auto text-center space-y-12'>
                    {/* Header */}
                    <div className='space-y-6'>
                        <div className='inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse'>
                            🎯 NEXT STEP: ACE YOUR INTERVIEWS
                        </div>
                        <h2 className='text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight'>
                            Prepare for Interviews with Our Interview Prep
                        </h2>
                        <p className='text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed'>
                            Don't just fix your resume—master the entire hiring
                            process. Get interview-ready with our comprehensive
                            preparation platform.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className='group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/90 cursor-pointer'>
                                <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                                    <feature.icon className='w-8 h-8 text-white' />
                                </div>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                    {feature.title}
                                </h3>
                                <p className='text-gray-600 text-sm'>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className='space-y-6'>
                        <div className='bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden'>
                            <div className='absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20' />
                            <div className='relative z-10 space-y-4'>
                                <h3 className='text-3xl font-bold'>
                                    Ready to Land Your Dream Job?
                                </h3>
                                <p className='text-xl text-white/90'>
                                    Join thousands who've successfully cracked
                                    interviews at top tech companies
                                </p>
                                <Button
                                    size='lg'
                                    className='bg-white text-emerald-700 hover:bg-gray-100 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl font-semibold'
                                    onClick={() =>
                                        window.open(
                                            "https://www.theboringeducation.com/interview-prep",
                                            "_blank"
                                        )
                                    }>
                                    <ExternalLink className='w-5 h-5 mr-2' />
                                    Get Interview Prep
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InterviewPrepSection
