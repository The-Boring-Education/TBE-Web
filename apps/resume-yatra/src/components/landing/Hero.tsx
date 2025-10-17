import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const Hero = () => {
    return (
        <section className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20'>
            <div className='container mx-auto px-6 text-center'>
                <div className='max-w-4xl mx-auto animate-fade-in'>
                    <h1 className='text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight'>
                        From Average to Master: Fix Your Resume Like a Pro
                    </h1>
                    <p className='text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed'>
                        A step-by-step checklist app to help you build or
                        upgrade your resume like a world-class developer.
                    </p>
                    <div className='flex justify-center'>
                        <Link href='/builder'>
                            <Button
                                size='lg'
                                className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-xl rounded-full transition-all duration-500 hover:scale-110 hover:shadow-2xl transform animate-pulse'>
                                Start Building My Resume{" "}
                                <ArrowRight className='ml-3 w-6 h-6' />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
