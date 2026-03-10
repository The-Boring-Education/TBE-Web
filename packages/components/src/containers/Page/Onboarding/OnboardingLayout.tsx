import { FlexContainer, Section } from "@tbe/components";
import type { OnboardingLayoutProps } from "@tbe/interface";

const OnboardingLayout = ({ children }: OnboardingLayoutProps) => (
  <Section className="md:py-4 px-2 py-2">
    <FlexContainer
      className="max-w-3xl mx-auto bg-white rounded-2 border shadow-sm px-4 py-6 gap-4"
      direction="col"
    >
      {children}
    </FlexContainer>
  </Section>
);

export default OnboardingLayout;
