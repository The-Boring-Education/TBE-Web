import { Briefcase, Check, Edit3,Target } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const FeatureCards = () => {
    const features = [
        {
            icon: <Check className='w-8 h-8 text-green-500' />,
            title: "Build from Scratch or Improve Existing Resume",
            description:
                "Whether you're starting fresh or polishing an existing resume, we've got you covered."
        },
        {
            icon: <Target className='w-8 h-8 text-blue-500' />,
            title: "Interactive Checklist with Recruiter POV",
            description:
                "Get insider insights on what recruiters actually look for in top-tier resumes."
        },
        {
            icon: <Briefcase className='w-8 h-8 text-purple-500' />,
            title: "Get FAANG + Remote-Ready Tips",
            description:
                "Learn the exact strategies used by professionals landing roles at top companies."
        },
        {
            icon: <Edit3 className='w-8 h-8 text-orange-500' />,
            title: "Real Examples & Smart Writing Tricks",
            description:
                "See before/after examples and master the art of resume writing like a pro."
        }
    ]

    return (
        <section className='py-20 bg-white'>
            <div className='container mx-auto px-6'>
                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className='hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50'>
                            <CardContent className='p-6 text-center'>
                                <div className='mb-4 flex justify-center'>
                                    {feature.icon}
                                </div>
                                <h3 className='text-lg font-semibold mb-3 text-gray-800'>
                                    {feature.title}
                                </h3>
                                <p className='text-gray-600 text-sm leading-relaxed'>
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeatureCards
