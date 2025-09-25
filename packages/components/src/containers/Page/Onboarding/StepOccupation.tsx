import { FlexContainer, RadioButtonContainer, Text } from '@tbe/components';
import { USER_ROLE_OPTIONS } from '@tbe/constants';
import type { StepOccupationProps } from '@tbe/interface';

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
