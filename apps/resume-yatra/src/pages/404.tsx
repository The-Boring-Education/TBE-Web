import { FileText, Home } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className='min-h-screen flex items-center justify-center bg-white'>
            <div className='text-center space-y-6 p-8'>
                <div className='mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center'>
                    <FileText className='w-12 h-12 text-primary' />
                </div>
                <h1 className='text-6xl font-bold text-primary'>
                    404
                </h1>
                <div className='space-y-2'>
                    <h2 className='text-2xl font-semibold text-gray-800'>
                        Page Not Found
                    </h2>
                    <p className='text-gray-600 max-w-md mx-auto'>
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>
                <Link href='/'>
                    <Button className='bg-primary hover:bg-red-600 text-white transition-all duration-300'>
                        <Home className='w-4 h-4 mr-2' />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
