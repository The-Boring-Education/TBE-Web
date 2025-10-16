import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { UseResumeBuilderReturn } from "@/types/builder"

interface TemplatePromptProps {
    builder: UseResumeBuilderReturn
}

export default function TemplatePrompt({ builder }: TemplatePromptProps) {
    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
            <div className='container mx-auto px-6'>
                <div className='max-w-2xl mx-auto text-center space-y-8 animate-fade-in'>
                    <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                        Let's Get You a Template First
                    </h1>
                    <div className='bg-blue-50 p-6 rounded-lg'>
                        <h3 className='text-xl font-semibold text-blue-800 mb-4'>
                            Why Google Docs?
                        </h3>
                        <ul className='text-blue-700 space-y-2 text-left'>
                            <li>• Easy to share with recruiters and mentors</li>
                            <li>
                                • Simple, clean templates that work everywhere
                            </li>
                            <li>
                                • No formatting issues when converting to PDF
                            </li>
                            <li>• Collaborative editing for feedback</li>
                        </ul>
                    </div>

                    <div className='space-y-6'>
                        <Button
                            size='lg'
                            className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg transition-all duration-300 hover:scale-105'
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
                            className='w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white py-4 text-lg transition-all duration-300 hover:scale-105'>
                            Skip Template - Start Checklist
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
