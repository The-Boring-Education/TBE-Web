import { GradientContainer, Image, Text } from "@tbe/components";
import type { PrimaryCardProps } from "@tbe/interface";

const PrimaryCard = ({
  image,
  imageAltText,
  title,
  content,
  borderColour = 4,
  className = "",
}: PrimaryCardProps) => {
  const border = `border-borderColor${borderColour}`;

  return (
    <GradientContainer
      className={`max-w-sm ${border} ${className}`}
      isOncampusCard={className.includes("oncampus-card")}
    >
      <Image
        alt={imageAltText}
        className="h-40 w-48"
        fullHeight={false}
        fullWidth={false}
        src={`${image}`}
      />
      <div className="flex flex-col gap-2 mt-4">
        <Text className="heading-5" level="h5">
          {title}
        </Text>

        <Text className="paragraph text-greyDark" level="p">
          {content}
        </Text>
      </div>
    </GradientContainer>
  );
};

export default PrimaryCard;
