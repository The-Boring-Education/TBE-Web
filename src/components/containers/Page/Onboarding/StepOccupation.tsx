import { RadioButtonContainer, Text, FlexContainer } from '@/components';
import { USER_ROLE_OPTIONS } from '@/constant';
import { StepOccupationProps } from '@/interfaces';

const StepOccupation = ({ value, onChange }: StepOccupationProps) => (
  <FlexContainer className='gap-4' direction='col'>
    <Text level='p' className='paragraph'>
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
