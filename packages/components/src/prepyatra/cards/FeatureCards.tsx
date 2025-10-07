import {Users, BookOpen, Share2, Target} from "lucide-react";
import {motion} from "framer-motion";

import {IconCard, Text, GridContainer, FlexContainer, SectionHeaderContainer} from "@tbe/components";

const features = [
    {
        icon: <Users className='w-12 h-12 text-primary' />,
        title: "Recruiter Contacts",
        description:
            "Store and organize HR contacts with interview status, company details, and personal notes.",
    },
    {
        icon: <BookOpen className='w-12 h-12 text-primary' />,
        title: "Prep Logs",
        description:
            "Track your daily preparation hours, maintain streaks, and share your journey with the community.",
    },
    {
        icon: <Share2 className='w-12 h-12 text-primary' />,
        title: "Resource Sharing",
        description:
            "Crowdsource interview questions, coding challenges, and career resources with fellow job hunters.",
    },
    {
        icon: <Target className='w-12 h-12 text-primary' />,
        title: "Community Driven",
        description:
            "Connect with like-minded professionals, share experiences, and learn from each other's journeys.",
    }
];

const FeatureCards = () => {
    return (
        <section className='py-20 px-4'>
            <FlexContainer direction='col' className='container mx-auto'>
                <SectionHeaderContainer
                    heading='Everything You Need to '
                    focusText='Land Your Dream Job'
                    subtext='PrepYatra brings together all the tools and community support you need for a successful job hunt.'
                    headingLevel={2}
                    className='mb-16'
                />

                <GridContainer className='grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.6, delay: index * 0.15}}>
                            <IconCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                className='glass-dark rounded-2xl p-8 h-full border border-white/10'
                                bgColor='bg-transparent'
                            />
                        </motion.div>
                    ))}
                </GridContainer>
            </FlexContainer>
        </section>
    );
};

export default FeatureCards;
