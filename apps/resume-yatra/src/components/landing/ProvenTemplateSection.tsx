import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Star } from "lucide-react"

const ProvenTemplateSection = () => {
    const achievements = [
        "Shortlisted in 200+ companies",
        "Used by 10,000+ developers",
        "FAANG-approved format",
        "ATS-friendly design"
    ]

    return (
        <section className='py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden'>
            {/* Background Pattern */}
            <div className='absolute inset-0 bg-black/10'></div>
            <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent'></div>

            <div className='container mx-auto px-6 relative z-10'>
                <div className='max-w-6xl mx-auto'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        {/* Left Content */}
                        <div className='text-white space-y-8'>
                            <div className='space-y-4'>
                                <div className='flex items-center gap-2 mb-4'>
                                    <Star className='w-6 h-6 text-yellow-400 fill-current' />
                                    <span className='text-yellow-400 font-semibold'>
                                        PROVEN TEMPLATE
                                    </span>
                                </div>
                                <h2 className='text-5xl font-bold leading-tight'>
                                    Get Our Battle-Tested Resume Template
                                </h2>
                                <p className='text-xl text-white/90 leading-relaxed'>
                                    The exact template that helped thousands
                                    land jobs at Google, Microsoft, Amazon, and
                                    top startups.
                                </p>
                            </div>

                            <div className='grid sm:grid-cols-2 gap-4'>
                                {achievements.map((achievement, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-white/20'>
                                        <CheckCircle className='w-5 h-5 text-green-400 flex-shrink-0' />
                                        <span className='text-white/90'>
                                            {achievement}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                size='lg'
                                className='bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl font-semibold'
                                onClick={() =>
                                    window.open(
                                        "https://docs.google.com/document/d/1w4EBKKmkLg4iF_nCdceXslhZGJVdDpCJtfXsx7NmD58/edit?usp=sharing",
                                        "_blank"
                                    )
                                }>
                                <Download className='w-5 h-5 mr-2' />
                                Get This Template
                            </Button>
                        </div>

                        {/* Right Content - Resume Preview */}
                        <div className='relative'>
                            <div className='bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-all duration-500'>
                                <div className='space-y-4'>
                                    <div className='border-b border-gray-200 pb-4'>
                                        <h3 className='text-2xl font-bold text-gray-900'>
                                            Sachin Kumar Singh
                                        </h3>
                                        <p className='text-gray-600'>
                                            Full Stack Developer
                                        </p>
                                        <p className='text-sm text-gray-500'>
                                            sachin@example.com | +91 XXXXX XXXXX
                                        </p>
                                    </div>

                                    <div className='space-y-3'>
                                        <h4 className='font-semibold text-gray-900'>
                                            Professional Summary
                                        </h4>
                                        <p className='text-sm text-gray-600 leading-relaxed'>
                                            Software Engineer with 5+ years
                                            building scalable web
                                            applications...
                                        </p>
                                    </div>

                                    <div className='space-y-3'>
                                        <h4 className='font-semibold text-gray-900'>
                                            Experience
                                        </h4>
                                        <div className='space-y-2'>
                                            <p className='text-sm font-medium text-gray-800'>
                                                Senior Software Engineer |
                                                TechCorp
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                • Led development of
                                                microservices architecture...
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                • Improved system performance by
                                                60%...
                                            </p>
                                        </div>
                                    </div>

                                    <div className='text-center pt-4'>
                                        <div className='inline-block bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full'>
                                            <span className='text-sm font-medium text-purple-700'>
                                                And much more...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating badges */}
                            <div className='absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-bounce'>
                                ATS Approved ✓
                            </div>
                            <div className='absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse'>
                                FAANG Ready ✓
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProvenTemplateSection
