import { Button } from "@/components/ui/button"

const Header = () => {
    return (
        <header className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200'>
            <div className='container mx-auto px-6 py-4 flex items-center justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                        ResumeYatra
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        by The Boring Education
                    </p>
                </div>
                <Button
                    className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    onClick={() =>
                        window.open(
                            "https://www.theboringeducation.com/",
                            "_blank"
                        )
                    }>
                    Explore Free Courses
                </Button>
            </div>
        </header>
    )
}

export default Header
