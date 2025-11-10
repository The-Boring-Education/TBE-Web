import { Brain, Code, ExternalLink, MessageSquare, Target } from "lucide-react"
import { Button } from "@tbe/components"

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
        <section className='py-20 bg-gray-50'>
            <div className='container mx-auto px-6'>
                <div className='max-w-6xl mx-auto text-center space-y-12'>
                    {/* Header */}
                    <div className='space-y-6'>
                        <div className='inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold'>
                            🎯 NEXT STEP: ACE YOUR INTERVIEWS
                        </div>
                        <h2 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
                            Prepare for Interviews with Our <span className='text-primary'>Interview Prep</span>
                        </h2>
                        <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
                            Don't just fix your resume—master the entire hiring process. Get interview-ready with our comprehensive preparation platform.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className='group bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200'>
                                <div className='w-14 h-14 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                                    <feature.icon className='w-7 h-7 text-white' />
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
                        <div className='bg-white border-2 border-primary rounded-2xl p-8 relative overflow-hidden'>
                            <div className='space-y-4'>
                                <h3 className='text-3xl font-bold text-gray-900'>
                                    Ready to Land Your Dream Job?
                                </h3>
                                <p className='text-lg md:text-xl text-gray-600'>
                                    Join thousands who've successfully cracked interviews at top tech companies
                                </p>
                                <div className='pt-2 flex justify-center'>
                                    <Button
                                        variant="PRIMARY"
                                        size="MEDIUM"
                                        className='rounded-full text-sm'
                                        onClick={() =>
                                            window.open(
                                                "https://www.theboringeducation.com/interview-prep",
                                                "_blank"
                                            )
                                        }
                                        icon={<ExternalLink className='w-4 h-4' />}
                                        text="Get Interview Prep"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InterviewPrepSection
