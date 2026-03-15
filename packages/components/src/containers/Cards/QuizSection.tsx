import {
  FlexContainer,
  Image,
  LinkButton,
  Section,
  Text,
} from "@tbe/components";

interface QuizSectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
}

const QuizSection = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
}: QuizSectionProps) => (
  <Section className="md:px-8 md:py-4 px-2 py-4">
    <FlexContainer justifyCenter={false}>
      <FlexContainer className="w-full gap-6 rounded-lg bg-gray-900 md:px-8 md:py-8 px-4 py-6 shadow-lg">
        <div className="flex-shrink-0">
          <Image
            alt="quiz section image"
            fullHeight={false}
            fullWidth={false}
            src={imageSrc}
          />
        </div>
        <FlexContainer direction="col" itemCenter className="flex-1">
          <Text className="heading-3 mb-3 text-white" level="h3" textCenter>
            {title}
          </Text>
          <Text className="paragraph mb-6 text-gray-300" level="p" textCenter>
            {description}
          </Text>
          <LinkButton
            buttonProps={{
              variant: "PRIMARY",
              text: buttonText,
            }}
            href={buttonLink}
            target="_blank"
          />
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  </Section>
);

export default QuizSection;
