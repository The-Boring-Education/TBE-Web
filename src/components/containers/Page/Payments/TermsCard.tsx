import { Section, Text } from "@/components";
import { TermsAndConditionContent } from "@/constant";

const TermsAndConditionsCard = () => {
  return (
    <Section>
      <Text
        level="h1"
        className="mx-auto mb-8 w-full text-4xl font-bold text-primary md:mb-12 md:text-5xl"
        textCenter
      >
        Terms & Conditions
      </Text>

      <Text
        level="p"
        className="mx-auto text-lg font-medium text-foreground/70"
        textCenter
      >
        Last Updated At:{" "}
        <span className="text-primary">June 2, 2025</span>
      </Text>

      <br />

      {TermsAndConditionContent.map((item) => (
        <Section key={item.id} className="mb-6 mx-auto max-w-3xl">
          <Text
            level="p"
            className="mb-2 text-lg font-medium text-foreground/80"
          >
            {item.description}
          </Text>

          {item.points?.map((point) => (
            <Text
              key={point.id}
              level="p"
              className="ml-4 mt-2 text-base text-foreground/70"
            >
              {point.id}. {point.description}
            </Text>
          ))}
        </Section>
      ))}
    </Section>
  );
};

export default TermsAndConditionsCard;
