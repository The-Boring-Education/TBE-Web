import { FlexContainer, RadioButtonContainer, Text } from '@/components';
import { USER_ROLE_OPTIONS } from '@/constant';
import type { StepOccupationProps } from '@/interfaces';

const StepOccupation = ({ value, onChange }: StepOccupationProps) => (
  <FlexContainer className='gap-4' direction='col'>
    <Text className='paragraph' level='p'>
      2. What do You do?
    </Text>
    <RadioButtonContainer
      options={USER_ROLE_OPTIONS}
      selectedValue={value}
      onChange={onChange}
    />
  </FlexContainer>
);

export default StepOccupation;
