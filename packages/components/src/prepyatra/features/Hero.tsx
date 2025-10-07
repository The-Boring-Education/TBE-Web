import {useRouter} from "next/router";
import {motion} from "framer-motion";

import {Button, Text, FlexContainer, GridContainer} from "@tbe/components";

const PrepYatraHero = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push("/auth");
    };

    const features = [
        {
            icon: (
                <svg
                    className='w-8 h-8 text-primary-foreground'
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
                    className='w-8 h-8 text-primary-foreground'
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
                    className='w-8 h-8 text-primary-foreground'
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
        <section className='min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden'>
            {/* Background Animation Elements */}
            <div className='absolute inset-0 opacity-10'>
                <motion.div
                    className='absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full'
                    animate={{y: [0, 20, 0]}}
                    transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
                />
                <motion.div
                    className='absolute top-60 right-20 w-24 h-24 bg-primary/30 rounded-full'
                    animate={{y: [0, -20, 0]}}
                    transition={{duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1}}
                />
                <motion.div
                    className='absolute bottom-40 left-1/4 w-20 h-20 bg-primary/25 rounded-full'
                    animate={{y: [0, 15, 0]}}
                    transition={{duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2}}
                />
            </div>

            <FlexContainer direction='col' className='container mx-auto text-center relative z-10'>
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}>
                    <Text level='h1' className='text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight'>
                        Turn{" "}
                        <motion.span
                            className='text-primary'
                            animate={{opacity: [1, 0.5, 1]}}
                            transition={{duration: 2, repeat: Infinity}}>
                            Hustle
                        </motion.span>
                        <br />
                        Into{" "}
                        <motion.span
                            className='text-primary'
                            animate={{opacity: [1, 0.5, 1]}}
                            transition={{duration: 2, repeat: Infinity, delay: 1}}>
                            Hires
                        </motion.span>
                    </Text>

                    <Text level='p' className='text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto'>
                        The ultimate community platform for job hunters to store
                        recruiter contacts, share prep logs, and crowdsource
                        resources together.{" "}
                        <span className='text-primary font-semibold'>
                            Your journey to success starts here!
                        </span>
                    </Text>

                    <FlexContainer className='mb-12 flex-col sm:flex-row gap-4'>
                        <Button
                            text='🚀 Start Your Journey Free'
                            onClick={handleGetStarted}
                            variant='NEUTRAL'
                            className='rounded-md text-black hover:bg-primary/90 text-lg px-8 py-2 font-semibold transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/50'
                        />
                    </FlexContainer>
                </motion.div>

                <GridContainer className='md:grid-cols-3 gap-6 mt-16'>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.6, delay: feature.delay}}
                            whileHover={{scale: 1.05}}
                            className='glass rounded-2xl p-6 transition-transform duration-300'>
                            <FlexContainer direction='col'>
                                <div className='w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center'>
                                    {feature.icon}
                                </div>
                                <Text level='h3' className='text-white font-semibold mb-2'>
                                    {feature.title}
                                </Text>
                                <Text level='p' className='text-gray-300 text-sm'>
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

export default PrepYatraHero;
