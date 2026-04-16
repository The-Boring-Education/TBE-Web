import React from "react";

import Button from "../common/Buttons/Button";
import Text from "../common/Typography/Text";
import Section from "../layout/Section";

export type TechYatraHeroProps = {
  onExplore: () => void;
  onLearnFree: () => void;
};

/**
 * Marketing hero for Tech Yatra — uses Section, Text, and design-system Button
 * (same stack as Prep Yatra / platform landings).
 */
const TechYatraHero = ({ onExplore, onLearnFree }: TechYatraHeroProps) => {
  return (
    <Section className="bg-lightBG px-4 py-24 text-center mt-16">
      <div className="max-w-5xl mx-auto">
        <Text
          level="h1"
          className="text-5xl md:text-7xl font-bold mb-6 text-center"
          textCenter
        >
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Confused What to Learn
          </span>
          <br />
          <span className="bg-gradient-to-r from-secondary via-primary to-destructive bg-clip-text text-transparent">
            in Tech?
          </span>
        </Text>

        <Text
          level="h2"
          className="text-3xl md:text-4xl font-bold text-contentLight mb-6"
          textCenter
        >
          Start Your Yatra Here 🚀
        </Text>

        <Text
          level="p"
          className="text-xl text-greyDark mb-10 max-w-3xl mx-auto leading-relaxed"
          textCenter
        >
          Get personalized learning paths based on your interests and goals.
          Whether you&apos;re a student starting fresh or a working professional
          looking to upskill — we&apos;ve got the perfect roadmap for you.
        </Text>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={onExplore}
            variant="PRIMARY"
            size="LARGE"
            className="w-full sm:w-auto"
          >
            Start Exploring 🎯
          </Button>

          <Button
            onClick={onLearnFree}
            variant="OUTLINE"
            size="LARGE"
            className="w-full sm:w-auto"
          >
            Learn Tech Free 📚
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default TechYatraHero;
