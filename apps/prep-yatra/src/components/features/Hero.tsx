import {Button, FlexContainer, GridContainer,Text} from "@tbe/components";
import {motion} from "framer-motion";
import {useRouter} from "next/router";

const Hero = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push("/auth");
    };

    const features = [
        {
            icon: (
                <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                </svg>
            ),
            title: "📞 Recruiter Network",
            description: "Build and manage your professional recruiter contacts database",
            delay: 0
        },
        {
            icon: (
                <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                </svg>
            ),
            title: "📝 Prep Logs",
            description: "Track your interview preparation progress and learnings",
            delay: 0.2
        },
        {
            icon: (
                <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                    />
                </svg>
            ),
            title: "🔄 Resource Sharing",
            description: "Share and discover valuable job search resources with the community",
            delay: 0.4
        }
    ];

    return (
        <section className='min-h-[70vh] flex items-center justify-center px-3 pt-16 relative overflow-hidden bg-lightBG'>
            {/* Background Animation Elements */}
            <div className='absolute inset-0 opacity-5'>
                <motion.div
                    className='absolute top-20 left-10 w-32 h-32 bg-primary/30 rounded-full'
                    animate={{y: [0, 20, 0]}}
                    transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
                />
                <motion.div
                    className='absolute top-60 right-20 w-24 h-24 bg-secondary/40 rounded-full'
                    animate={{y: [0, -20, 0]}}
                    transition={{duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1}}
                />
                <motion.div
                    className='absolute bottom-40 left-1/4 w-20 h-20 bg-primary/35 rounded-full'
                    animate={{y: [0, 15, 0]}}
                    transition={{duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2}}
                />
            </div>

            <FlexContainer direction='col' className='container mx-auto text-center relative z-10'>
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}>
                    <Text level='h1' className='text-3xl md:text-5xl font-bold mb-4 leading-tight'>
                        Turn{" "}
                        <motion.span
                            className='text-primary'
                            animate={{opacity: [1, 0.7, 1]}}
                            transition={{duration: 2, repeat: Infinity}}>
                            Hustle
                        </motion.span>
                        <br />
                        Into{" "}
                        <motion.span
                            className='text-primary'
                            animate={{opacity: [1, 0.7, 1]}}
                            transition={{duration: 2, repeat: Infinity, delay: 1}}>
                            Hires
                        </motion.span>
                    </Text>

                    <Text level='p' className='text-base md:text-lg text-greyDark mb-6 max-w-3xl mx-auto'>
                        The ultimate community platform for job hunters to store
                        recruiter contacts, share prep logs, and crowdsource
                        resources together.{" "}
                        <span className='text-primary font-semibold'>
                            Your journey to success starts here!
                        </span>
                    </Text>

                    <FlexContainer className='mb-8 flex-col sm:flex-row gap-3'>
                        <Button
                            text='🚀 Start Your Journey Free'
                            onClick={handleGetStarted}
                            variant='PRIMARY'
                            className='text-sm px-4 py-2 font-semibold'
                            animationType='BOUNCE'
                        />
                    </FlexContainer>
                </motion.div>

                <GridContainer className='md:grid-cols-3 gap-4 mt-10'>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.6, delay: feature.delay}}
                            whileHover={{scale: 1.02, y: -3}}
                            className='glass rounded-1 p-4 transition-all duration-200 shadow hover:shadow-md'>
                            <FlexContainer direction='col'>
                                <div className='w-12 h-12 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center shadow'>
                                    {feature.icon}
                                </div>
                                <Text level='h3' className='text-lg font-semibold mb-1'>
                                    {feature.title}
                                </Text>
                                <Text level='p' className='text-sm text-greyDark'>
                                    {feature.description}
                                </Text>
                            </FlexContainer>
                        </motion.div>
                    ))}
                </GridContainer>
            </FlexContainer>
        </section>
    );
};

export default Hero;
