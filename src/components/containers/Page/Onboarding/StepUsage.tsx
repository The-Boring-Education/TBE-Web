import { CheckboxButtonContainer, FlexContainer } from '@/components';
import { Text } from '@/components';
import { USER_USAGE_OPTIONS } from '@/constant';
import type { StepUsageProps } from '@/interfaces';

const StepUsage = ({ selected, onChange }: StepUsageProps) => (
  <FlexContainer className='gap-4'>
    <Text className='paragraph' level='p'>
      3. How would You use the Platform?
    </Text>
    <CheckboxButtonContainer
      options={USER_USAGE_OPTIONS.map(({ label, value }) => ({
        label,
        value,
      }))}
      selectedValues={selected}
      onChange={onChange}
    />
  </FlexContainer>
);

export default StepUsage;
