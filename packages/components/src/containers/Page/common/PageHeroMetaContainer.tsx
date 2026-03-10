import { FlexContainer, Text } from "@tbe/components";
import type { ProjectHeroMetaContainerProps } from "@tbe/interface";

const PageHeroMetaContainer = ({
  subtitle,
  title,
  titleClassName = "gradient-3",
  theme,
}: ProjectHeroMetaContainerProps) => {
  const isDark = theme === "dark";

  return (
    <FlexContainer className="gap-1" direction="col" itemCenter={false}>
      <Text
        className={`pre-title ${isDark ? "text-gray-400" : "text-greyDark"}`}
        level="span"
      >
        {subtitle}
      </Text>
      <FlexContainer className={`${titleClassName} px-2 py-1 rounded`}>
        <Text className={`strong-text ${isDark ? "text-white" : ""}`} level="p">
          {title}
        </Text>
      </FlexContainer>
    </FlexContainer>
  );
};

export default PageHeroMetaContainer;
