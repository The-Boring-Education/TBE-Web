import {Button, FlexContainer, Text} from "@tbe/components";
import {motion} from "framer-motion";
import {useRouter} from "next/router";
import {useState} from "react";

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const handleGetStarted = () => {
        router.push("/auth");
    };

    return (
        <motion.nav
            initial={{y: -100}}
            animate={{y: 0}}
            transition={{duration: 0.5}}
            className='fixed top-0 left-0 right-0 z-50 glass-dark backdrop-blur-md'>
            <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                <FlexContainer className='h-16' justifyCenter={false}>
                    <FlexContainer className='flex-1' justifyCenter={false}>
                        <FlexContainer direction='col' className='gap-0 items-start' itemCenter={false}>
                            <Text level='span' className='text-2xl font-bold text-primary'>
                                PrepYatra
                            </Text>
                            <Text level='span' className='text-xs text-gray-400 -mt-1'>
                                by The Boring Education
                            </Text>
                        </FlexContainer>
                    </FlexContainer>

                    <div className='hidden md:flex items-center space-x-4'>
                        <Button
                            text='Get Started'
                            onClick={handleGetStarted}
                            variant='PRIMARY'
                            size="SMALL"
                            className='bg-primary rounded-md text-black hover:bg-primary/90 font-semibold px-6 transform transition-transform hover:scale-105'
                        />
                    </div>

                    <div className='md:hidden'>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className='text-white hover:text-primary focus:outline-none transition-colors'
                            aria-label='Toggle menu'>
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
                </FlexContainer>

                {isMenuOpen && (
                    <motion.div
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        className='md:hidden'>
                        <div className='px-2 pt-2 pb-3 space-y-2 sm:px-3'>
                            <Button
                                text='Get Started'
                                onClick={handleGetStarted}
                                variant='PRIMARY'   
                                className='w-full bg-primary rounded-full text-black hover:bg-primary/90 font-semibold transform transition-transform hover:scale-105'
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navigation;
