import { Github, Instagram, Linkedin } from "lucide-react"

const Footer = () => {
    return (
        <footer className='bg-white border-t border-gray-200 py-12'>
            <div className='container mx-auto px-6'>
                <div className='text-center space-y-8'>
                    {/* Brand */}
                    <div className='space-y-2'>
                        <h3 className='text-3xl font-bold text-primary'>
                            ResumeYatra
                        </h3>
                        <p className='text-gray-600'>
                            Your journey to the perfect resume, crafted for success
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className='flex justify-center space-x-6'>
                        <button
                            className='text-gray-600 hover:text-primary transition-all duration-300 hover:scale-110'
                            onClick={() =>
                                window.open(
                                    "https://github.com/imsks",
                                    "_blank"
                                )
                            }>
                            <Github className='w-5 h-5' />
                        </button>
                        <button
                            className='text-gray-600 hover:text-primary transition-all duration-300 hover:scale-110'
                            onClick={() =>
                                window.open(
                                    "https://www.instagram.com/theboringfounder/",
                                    "_blank"
                                )
                            }>
                            <Instagram className='w-5 h-5' />
                        </button>
                        <button
                            className='text-gray-600 hover:text-primary transition-all duration-300 hover:scale-110'
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/imsks/",
                                    "_blank"
                                )
                            }>
                            <Linkedin className='w-5 h-5' />
                        </button>
                    </div>

                    {/* Credits */}
                    <div className='border-t border-gray-200 pt-8'>
                        <p className='text-gray-600'>
                            Built with ❤️ by{" "}
                            <a
                                href='https://www.linkedin.com/in/imsks/'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary hover:underline transition-colors font-semibold'>
                                Sachin
                            </a>{" "}
                            and{" "}
                            <a
                                href='https://www.theboringeducation.com/'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary hover:underline transition-colors'>
                                The Boring Education
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
