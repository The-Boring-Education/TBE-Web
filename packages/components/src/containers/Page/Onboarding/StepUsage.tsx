import { CheckboxButtonContainer, FlexContainer, Text } from "@tbe/components";
import { USER_USAGE_OPTIONS } from "@tbe/constants";
import type { StepUsageProps } from "@tbe/interface";

const StepUsage = ({ selected, onChange }: StepUsageProps) => (
  <FlexContainer className="gap-4">
    <Text className="paragraph" level="p">
      3. How would You use the Platform?
    </Text>
    <CheckboxButtonContainer
      options={USER_USAGE_OPTIONS.map(({ label, value }: any) => ({
        label,
        value,
      }))}
      selectedValues={selected}
      onChange={onChange}
    />
  </FlexContainer>
);

export default StepUsage;
