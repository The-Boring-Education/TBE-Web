import { CheckboxButtonContainer, FlexContainer } from '@/components';
import { StepUsageProps } from '@/interfaces';
import { USER_USAGE_OPTIONS } from '@/constant';
import { Text } from '@/components';

const StepUsage = ({ selected, onChange }: StepUsageProps) => (
  <FlexContainer className='gap-4'>
    <Text level='p' className='paragraph'>
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
