import { CheckCircle, Download, Star } from "lucide-react"
import { Button } from "@tbe/components"
import router from "next/router"

const ProvenTemplateSection = () => {
    const achievements = [
        "Shortlisted in 200+ companies",
        "Used by 10,000+ developers",
        "FAANG-approved format",
        "ATS-friendly design"
    ]

    return (
        <section className='py-20 bg-white'>
            <div className='container mx-auto px-6'>
                <div className='max-w-4xl mx-auto'>
                    {/* Centered Content */}
                    <div className='space-y-8 text-center'>
                        <div className='space-y-4'>
                            <div className='flex items-center justify-center gap-2 mb-4'>
                                <Star className='w-6 h-6 text-primary fill-current' />
                                <span className='text-primary font-semibold'>
                                    PROVEN TEMPLATE
                                </span>
                            </div>
                            <h2 className='text-4xl md:text-5xl font-bold leading-tight text-gray-900'>
                                Get Our Battle-Tested Resume Template
                            </h2>
                            <p className='text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto'>
                                The exact template that helped thousands land jobs at Google, Microsoft, Amazon, and top startups.
                            </p>
                        </div>

                        {/* 2x2 Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto'>
                            {achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-3 bg-gray-50 rounded-lg p-5 transition-all duration-300 hover:bg-primary/10 hover:scale-105 border border-gray-200'>
                                    <CheckCircle className='w-6 h-6 text-primary flex-shrink-0' />
                                    <span className='text-gray-900 font-medium text-left'>
                                        {achievement}
                                    </span>
                                </div>
                            ))}
                        </div>

                            <div className='pt-4 flex justify-center'>
                            <Button 
                                        variant="PRIMARY"
                                        text="Get This Template"
                                        onClick={() => router.push('/builder')}
                                        size="MEDIUM"
                                        icon={<Download className="w-2 h-2" />}
                                        className="text-sm rounded-full"
                                    />
                            </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProvenTemplateSection
