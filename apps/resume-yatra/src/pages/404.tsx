import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Home } from "lucide-react"

export default function NotFound() {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'>
            <div className='text-center space-y-6 p-8'>
                <div className='mx-auto w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center opacity-20'>
                    <FileText className='w-12 h-12 text-white' />
                </div>
                <h1 className='text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                    404
                </h1>
                <div className='space-y-2'>
                    <h2 className='text-2xl font-semibold text-gray-800'>
                        Page Not Found
                    </h2>
                    <p className='text-gray-600 max-w-md mx-auto'>
                        The page you're looking for doesn't exist or has been
                        moved.
                    </p>
                </div>
                <Link href='/'>
                    <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105'>
                        <Home className='w-4 h-4 mr-2' />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
