import { CheckCircle, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UseResumeBuilderReturn } from "@/types/builder"

interface InitialChoiceProps {
    builder: UseResumeBuilderReturn
}

export default function InitialChoice({ builder }: InitialChoiceProps) {
    return (
        <div className='min-h-screen bg-white flex items-center justify-center transition-all duration-500 pt-20'>
            <div className='container mx-auto px-6'>
                <div className='max-w-2xl mx-auto text-center space-y-8 animate-fade-in'>
                    <h1 className='text-4xl font-bold text-gray-900'>
                        Let's Build Your Perfect Resume
                    </h1>
                    <p className='text-xl text-gray-600'>
                        Choose your starting point to begin the resume improvement process
                    </p>

                    <div className='grid gap-6'>
                        <Card
                            className='hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-2'
                            onClick={() => builder.setHasResume(false)}>
                            <CardHeader className='text-center'>
                                <CardTitle className='flex items-center justify-center gap-3'>
                                    <FileText className='w-6 h-6 text-primary' />
                                    Create Resume
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='text-center'>
                                <p className='text-gray-600 mb-4'>
                                    Start from scratch with our guided process
                                </p>
                                <Button className='w-full bg-primary hover:bg-red-600 text-white transition-all duration-300'>
                                    Start Fresh
                                </Button>
                            </CardContent>
                        </Card>

                        <Card
                            className='hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-2'
                            onClick={() => builder.setHasResume(true)}>
                            <CardHeader className='text-center'>
                                <CardTitle className='flex items-center justify-center gap-3'>
                                    <CheckCircle className='w-6 h-6 text-primary' />
                                    Modify Resume
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='text-center'>
                                <p className='text-gray-600 mb-4'>
                                    Improve your existing resume step by step
                                </p>
                                <Button
                                    variant='outline'
                                    className='w-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300'>
                                    Improve Existing
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
