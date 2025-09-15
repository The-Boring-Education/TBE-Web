import {Users, BookOpen, Share2, Target} from "lucide-react";

const features = [
    {
        icon: Users,
        title: "Recruiter Contacts",
        description:
            "Store and organize HR contacts with interview status, company details, and personal notes.",
        animation: "animate-slide-in-left"
    },
    {
        icon: BookOpen,
        title: "Prep Logs",
        description:
            "Track your daily preparation hours, maintain streaks, and share your journey with the community.",
        animation: "animate-slide-in-right"
    },
    {
        icon: Share2,
        title: "Resource Sharing",
        description:
            "Crowdsource interview questions, coding challenges, and career resources with fellow job hunters.",
        animation: "animate-slide-in-left"
    },
    {
        icon: Target,
        title: "Community Driven",
        description:
            "Connect with like-minded professionals, share experiences, and learn from each other's journeys.",
        animation: "animate-slide-in-right"
    }
];

const FeatureCards = () => {
    return (
        <section className='py-20 px-4'>
            <div className='container mx-auto'>
                <div className='text-center mb-16'>
                    <h2 className='text-3xl md:text-5xl font-bold text-white mb-6'>
                        Everything You Need to{" "}
                        <span className='text-primary'>
                            Land Your Dream Job
                        </span>
                    </h2>
                    <p className='text-xl text-gray max-w-2xl mx-auto'>
                        PrepYatra brings together all the tools and community
                        support you need for a successful job hunt.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className={`glass-dark rounded-2xl p-8 hover:scale-105 transition-transform duration-300 ${feature.animation}`}
                                style={{animationDelay: `${index * 0.2}s`}}>
                                <div className='w-16 h-16 bg-primary rounded-xl mb-6 flex items-center justify-center'>
                                    <Icon className='w-8 h-8 text-primary-foreground' />
                                </div>
                                <h3 className='text-2xl font-bold text-white mb-4'>
                                    {feature.title}
                                </h3>
                                <p className='text-gray text-lg leading-relaxed'>
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeatureCards;
