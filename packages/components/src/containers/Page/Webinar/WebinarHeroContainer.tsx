import { FlexContainer, LoginRedirectButton, Text } from "@tbe/components";

const WebinarHeroContainer = () => (
  <FlexContainer>
    <FlexContainer className="flex-col items-center md:flex-row border md:w-4/5 gap-4 w-full p-2 my-4 justify-between rounded">
      <FlexContainer className="gap-1 md:items-start" direction="col">
        <Text className="heading-4" level="h4">
          Hello there!
        </Text>
        <Text className="paragraph text-greyDark" level="p" textCenter>
          Please Login to generate your Certificate
        </Text>
      </FlexContainer>

      <FlexContainer>
        <LoginRedirectButton text="Login to Generate" />
      </FlexContainer>
    </FlexContainer>
  </FlexContainer>
);

export default WebinarHeroContainer;
