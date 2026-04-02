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
      className={`max-w-sm ${border} ${isDark ? "bg-[#111] border-gray-800" : ""}`}
    >
      <Image
        alt={imageAltText}
        className="h-40 w-48"
        fullHeight={false}
        fullWidth={false}
        src={`${image}`}
      />
      <Text
        className={`heading-5 mt-4 ${isDark ? "text-white" : ""}`}
        level="h5"
      >
        {title}
      </Text>

      <Text
        className={`paragraph mt-1 ${isDark ? "text-gray-400" : "text-greyDark"}`}
        level="p"
      >
        {content}
      </Text>
    </GradientContainer>
  );
};

export default PrimaryCard;
