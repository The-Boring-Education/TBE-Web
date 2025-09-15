import {useRouter} from "next/router";
import {useState} from "react";

import {Button} from "@/components/ui/button";

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const scrollToWaitlist = () => {
        const waitlistSection = document.getElementById("waitlist");
        waitlistSection?.scrollIntoView({behavior: "smooth"});
    };

    const handleGetStarted = () => {
        router.push("/auth");
    };

    return (
        <nav className='fixed top-0 left-0 right-0 z-50 glass-dark'>
            <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    <div className='flex items-center'>
                        <div className='text-left gap-2'>
                            <span className='block text-2xl font-bold text-primary'>
                                PrepYatra
                            </span>
                            <span className='block text-xs text-gray -mt-1'>
                                by The Boring Education
                            </span>
                        </div>
                    </div>

                    <div className='hidden md:flex items-center space-x-4'>
                        <Button
                            onClick={handleGetStarted}
                            className='bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 transform transition-transform hover:scale-105'>
                            Get Started
                        </Button>
                    </div>

                    <div className='md:hidden'>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className='text-white hover:text-primary focus:outline-none transition-colors'>
                            <svg
                                className='h-6 w-6'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M4 6h16M4 12h16M4 18h16'
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className='md:hidden animate-fade-in'>
                        <div className='px-2 pt-2 pb-3 space-y-2 sm:px-3'>
                            <Button
                                onClick={handleGetStarted}
                                className='w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transform transition-transform hover:scale-105'>
                                Get Started
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
