import Image from 'next/image';
import type { LandingPageHeroProps } from '@tbe/interface';

const LandingPageHero = ({
    sectionHeaderProps,
    primaryButton,
    secondaryButton,
    backgroundImageUrl,
    heroText,
    imageClassName,
}: LandingPageHeroProps & { imageClassName?: string }) => {
    const { heading, focusText } = sectionHeaderProps;
    return (
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

                    {/* Text Content */}
                    <div className="flex-1 max-w-2xl text-center lg:text-left flex flex-col items-center lg:items-start">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                            {heading}
                            <span className="text-primary block mt-2 lg:mt-4">{focusText}</span>
                        </h1>

                        <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                            {heroText}
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                            {primaryButton}
                            {secondaryButton}
                        </div>
                    </div>

                    {/* Image/Illustration */}
                    <div className="flex-1 w-full max-w-xl lg:max-w-2xl relative">
                        {/* Decorative Blob */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-primary/10 to-purple-500/10 rounded-full blur-3xl opacity-70 animate-pulse-slow"></div>

                        <div className={`relative ${imageClassName} mx-auto lg:mr-0`}>
                            <Image
                                alt='landing-page-hero-image'
                                className="object-contain drop-shadow-2xl"
                                fill
                                loading='eager'
                                src={backgroundImageUrl}
                                priority
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </section>
    );
};

export default LandingPageHero;
