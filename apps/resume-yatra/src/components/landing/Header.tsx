import { Button } from "@tbe/components"
const Header = () => {
    return (
        <header className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200'>
            <div className='container mx-auto px-6 py-2 flex items-center justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-2xl font-bold text-primary'>
                        ResumeYatra
                    </h1>
                    <p className='text-sm text-gray-500'>
                        by The Boring Education
                    </p>
                </div>
                <Button
                    variant="PRIMARY"
                    size="SMALL"
                    onClick={() =>
                        window.open(
                            "https://www.theboringeducation.com/",
                            "_blank"
                        )
                    }
                    text="Explore"
                    />
            </div>
        </header>
    )
}

export default Header
