import {
  FlexContainer,
  GridContainer,
  IconCard,
  SectionHeaderContainer,
} from "@tbe/components";
import { BookOpen, Share2, Target, Users } from "lucide-react";

const features = [
  {
    icon: <Users className="w-12 h-12 text-primary" />,
    title: "Recruiter Contacts",
    description:
      "Store and organize HR contacts with interview status, company details, and personal notes.",
  },
  {
    icon: <BookOpen className="w-12 h-12 text-primary" />,
    title: "Prep Logs",
    description:
      "Track your daily preparation hours, maintain streaks, and share your journey with the community.",
  },
  {
    icon: <Share2 className="w-12 h-12 text-primary" />,
    title: "Resource Sharing",
    description:
      "Crowdsource interview questions, coding challenges, and career resources with fellow job hunters.",
  },
  {
    icon: <Target className="w-12 h-12 text-primary" />,
    title: "Community Driven",
    description:
      "Connect with like-minded professionals, share experiences, and learn from each other's journeys.",
  },
];

const FeatureCards = () => {
  return (
    <section className="py-5 pb-8 px-4">
      <FlexContainer direction="col" className="container mx-auto">
        <SectionHeaderContainer
          heading="Everything You Need to "
          focusText="Land Your Dream Job"
          subtext="PrepYatra brings together all the tools and community support you need for a successful job hunt."
          headingLevel={2}
          className="mb-16"
        />

        <GridContainer className="grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-borderColor2 bg-gradient-to-br from-white to-gray-100"
            >
              <IconCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="glass rounded-2xl p-8 h-full border border-blue-400"
                bgColor="black"
              />
            </div>
          ))}
        </GridContainer>
      </FlexContainer>
    </section>
  );
};

export default FeatureCards;
