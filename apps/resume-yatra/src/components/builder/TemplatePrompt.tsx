import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { UseResumeBuilderReturn } from "@/types/builder"

interface TemplatePromptProps {
    builder: UseResumeBuilderReturn
}

export default function TemplatePrompt({ builder }: TemplatePromptProps) {
    return (
        <div className='min-h-screen bg-white flex items-center justify-center pt-20'>
            <div className='container mx-auto px-6'>
                <div className='max-w-2xl mx-auto text-center space-y-8 animate-fade-in'>
                    <h1 className='text-4xl font-bold text-gray-900'>
                        Let's Get You a Template First
                    </h1>
                    <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                            Why Google Docs?
                        </h3>
                        <ul className='text-gray-700 space-y-2 text-left'>
                            <li>• Easy to share with recruiters and mentors</li>
                            <li>• Simple, clean templates that work everywhere</li>
                            <li>• No formatting issues when converting to PDF</li>
                            <li>• Collaborative editing for feedback</li>
                        </ul>
                    </div>

                    <div className='space-y-6'>
                        <Button
                            size='lg'
                            className='w-full bg-primary hover:bg-red-600 text-white py-4 text-lg transition-all duration-300'
                            onClick={() =>
                                window.open(
                                    "https://docs.google.com/document/d/1w4EBKKmkLg4iF_nCdceXslhZGJVdDpCJtfXsx7NmD58/edit?usp=sharing",
                                    "_blank"
                                )
                            }>
                            <ExternalLink className='w-5 h-5 mr-2' />
                            Get Template from Google Docs
                        </Button>
                        <Button
                            variant='outline'
                            onClick={() => builder.setShowTemplate(true)}
                            className='w-full border-primary text-primary hover:bg-primary hover:text-white py-4 text-lg transition-all duration-300'>
                            Skip Template - Start Checklist
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
