import { Github, Instagram, Linkedin } from "lucide-react"

import { Button } from "@/components/ui/button"

const Footer = () => {
    return (
        <footer className='bg-gradient-to-r from-gray-900 via-purple-900 to-black text-white py-12'>
            <div className='container mx-auto px-6'>
                <div className='text-center space-y-8'>
                    {/* Brand */}
                    <div className='space-y-2'>
                        <h3 className='text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>
                            ResumeYatra
                        </h3>
                        <p className='text-gray-300'>
                            Your journey to the perfect resume, crafted for
                            success
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className='flex justify-center space-x-6'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='text-white hover:text-purple-400 hover:bg-white/10 transition-all duration-300 hover:scale-110'
                            onClick={() =>
                                window.open(
                                    "https://github.com/imsks",
                                    "_blank"
                                )
                            }>
                            <Github className='w-6 h-6' />
                        </Button>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='text-white hover:text-purple-400 hover:bg-white/10 transition-all duration-300 hover:scale-110'
                            onClick={() =>
                                window.open(
                                    "https://www.instagram.com/theboringfounder/",
                                    "_blank"
                                )
                            }>
                            <Instagram className='w-6 h-6' />
                        </Button>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='text-white hover:text-purple-400 hover:bg-white/10 transition-all duration-300 hover:scale-110'
                            onClick={() =>
                                window.open(
                                    "https://www.linkedin.com/in/imsks/",
                                    "_blank"
                                )
                            }>
                            <Linkedin className='w-6 h-6' />
                        </Button>
                    </div>

                    {/* Credits */}
                    <div className='border-t border-gray-700 pt-8'>
                        <p className='text-gray-400'>
                            Built with ❤️ by{" "}
                            <a
                                href='https://www.linkedin.com/in/imsks/'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-purple-400 hover:text-purple-300 transition-colors font-semibold'>
                                Sachin
                            </a>{" "}
                            and{" "}
                            <a
                                href='https://www.theboringeducation.com/'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-purple-400 hover:text-purple-300 transition-colors'>
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
