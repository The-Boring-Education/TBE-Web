import { GradientContainer, Image, Text } from "@tbe/components";
import type { PrimaryCardProps } from "@tbe/interface";

const PrimaryCard = ({
  image,
  imageAltText,
  title,
  content,
  borderColour = 4,
  theme = "light",
}: PrimaryCardProps) => {
  const border = `border-borderColor${borderColour}`;
  const isDark = theme === "dark";

  return (
    <GradientContainer
      className={`max-w-sm ${border} bg-card text-card-foreground border-border transition-colors duration-300`}
    >
      <Image
        alt={imageAltText}
        className="h-40 w-48"
        fullHeight={false}
        fullWidth={false}
        src={`${image}`}
      />
      <Text className="heading-5 mt-4 text-foreground" level="h5">
        {title}
      </Text>

      <Text className="paragraph mt-1 text-muted-foreground" level="p">
        {content}
      </Text>
    </GradientContainer>
  );
};

export default PrimaryCard;
