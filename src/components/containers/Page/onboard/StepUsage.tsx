import { CheckboxButtonContainer, FlexContainer } from '@/components';
import { StepUsageProps } from '@/interfaces';
import { usageOptions } from '@/constant';
import { Text } from '@/components';

const StepUsage = ({ selected, onChange }: StepUsageProps) => (
  <FlexContainer className='gap-4'>
    <Text level='p' className='paragraph'>
      3. How would You use the Platform?
    </Text>
    <CheckboxButtonContainer
      options={usageOptions.map((opt) => ({ label: opt.label, value: opt.id }))}
      selectedValues={selected}
      onChange={onChange}
    />
  </FlexContainer>
);

export default StepUsage;
