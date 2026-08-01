import {
  FlexContainer,
  Image,
  LinkButton,
  Section,
  Text,
} from "@tbe/components";
import type { BannerProps } from "@tbe/interface";

const BannerVariantC = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
}: BannerProps) => (
  <Section className="md:px-8 md:py-8 px-2 py-4">
    <FlexContainer justifyCenter={false}>
      <FlexContainer className="w-full gap-4 rounded-2 bg-gradient-to-br from-orange-500 via-pink-500 to-rose-600 md:px-8 md:py-8 px-2 py-4 shadow-xl shadow-orange-500/25 sm:px-8 sm:py-8 lg:px-4 lg:py-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md relative z-10">
          <Image alt="banner image" src={imageSrc} />
        </div>
        <FlexContainer
          direction="col"
          itemCenter
          className="flex-1 relative z-10"
        >
          <Text className="heading-3 text-white mb-2" level="h3" textCenter>
            {title}
          </Text>
          <Text className="paragraph text-white/90 mb-4" level="p" textCenter>
            {description}
          </Text>
          <LinkButton
            buttonProps={{
              variant: "OUTLINE",
              text: buttonText,
              className:
                "!bg-white !text-orange-600 hover:!bg-gray-100 !border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
            }}
            href={buttonLink}
          />
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  </Section>
);

export default BannerVariantC;
