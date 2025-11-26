import {Button, FlexContainer,Text} from "@tbe/components";
import {motion} from "framer-motion";
import {useRouter} from "next/router";

const PrepYatraHero = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push("/auth");
    };


    return (
        <section className='min-h-[70vh] flex items-center justify-center px-3 pt-3 relative overflow-hidden bg-lightBG'>
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

                 <img 
                            src="/landing.png" 
                            alt="prepping handshake (serious mode)" 
                            className="mx-auto mb-5 w-96 md:w-[400px]"
                  />
                       
          <Text
                level='h1'
                className='text-3xl md:text-5xl font-bold text-[#222222] mb-4 leading-tight'
                >
                Turn{" "} 
                <span className='text-[#222222] font-bold'>Hustle</span>{" "}
                <span className='text-[#222222] font-bold'>Into</span>{" "}
                <motion.span
                    className='text-[#fd6d6d] font-bold'
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
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
                            text='Start Your Journey for Free'
                            onClick={handleGetStarted}
                            variant='PRIMARY'
                            className='text-sm px-4 py-2 font-semibold'
                        />
                    </FlexContainer>
                </motion.div>

            </FlexContainer>
        </section>
    );
};

export default PrepYatraHero;
