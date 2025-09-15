import {useRouter} from "next/router";

import {Button} from "@/components/ui/button";

const Hero = () => {
    const router = useRouter();

    const scrollToWaitlist = () => {
        const waitlistSection = document.getElementById("waitlist");
        waitlistSection?.scrollIntoView({behavior: "smooth"});
    };

    const handleGetStarted = () => {
        router.push("/auth");
    };

    return (
        <section className='min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden'>
            {/* Background Animation Elements */}
            <div className='absolute inset-0 opacity-10'>
                <div className='absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full animate-float' />
                <div
                    className='absolute top-60 right-20 w-24 h-24 bg-primary/30 rounded-full animate-float'
                    style={{animationDelay: "1s"}} />
                <div
                    className='absolute bottom-40 left-1/4 w-20 h-20 bg-primary/25 rounded-full animate-float'
                    style={{animationDelay: "2s"}} />
            </div>

            <div className='container mx-auto text-center relative z-10'>
                <div className='animate-fade-in'>
                    <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight'>
                        Turn{" "}
                        <span className='text-primary animate-pulse'>
                            Hustle
                        </span>
                        <br />
                        Into{" "}
                        <span className='text-primary animate-pulse'>
                            Hires
                        </span>
                    </h1>

                    <p className='text-xl md:text-2xl text-gray mb-8 max-w-4xl mx-auto animate-slide-in-left'>
                        The ultimate community platform for job hunters to store
                        recruiter contacts, share prep logs, and crowdsource
                        resources together.
                        <span className='text-primary font-semibold'>
                            Your journey to success starts here!
                        </span>
                    </p>

                    <div className='animate-scale-in mb-12 flex flex-col sm:flex-row gap-4 justify-center'>
                        <Button
                            onClick={handleGetStarted}
                            size='lg'
                            className='bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4 font-semibold transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/50'>
                            🚀 Start Your Journey Free
                        </Button>
                    </div>
                </div>

                <div className='grid md:grid-cols-3 gap-6 mt-16'>
                    <div className='glass rounded-2xl p-6 animate-slide-in-left hover:scale-105 transition-transform duration-300'>
                        <div className='w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center'>
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
                        </div>
                        <h3 className='text-white font-semibold mb-2'>
                            📞 Recruiter Network
                        </h3>
                        <p className='text-gray text-sm'>
                            Build and manage your professional recruiter
                            contacts database
                        </p>
                    </div>

                    <div
                        className='glass rounded-2xl p-6 animate-scale-in hover:scale-105 transition-transform duration-300'
                        style={{animationDelay: "0.2s"}}>
                        <div className='w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center'>
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
                        </div>
                        <h3 className='text-white font-semibold mb-2'>
                            📝 Prep Logs
                        </h3>
                        <p className='text-gray text-sm'>
                            Track your interview preparation progress and
                            learnings
                        </p>
                    </div>

                    <div
                        className='glass rounded-2xl p-6 animate-slide-in-right hover:scale-105 transition-transform duration-300'
                        style={{animationDelay: "0.4s"}}>
                        <div className='w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center'>
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
                        </div>
                        <h3 className='text-white font-semibold mb-2'>
                            🔄 Resource Sharing
                        </h3>
                        <p className='text-gray text-sm'>
                            Share and discover valuable job search resources
                            with the community
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
