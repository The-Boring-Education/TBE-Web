import {
  RadioButtonContainer,
  GridContainer,
  Text,
  FlexContainer,
} from '@/components';
import { StepOccupationProps } from '@/interfaces';

const StepOccupation = ({ value, onChange }: StepOccupationProps) => (
  <FlexContainer className='gap-4' direction='col'>
    <Text level='p' className='paragraph'>
      2. What do You do?
    </Text>
    <GridContainer className='grid-row-2 gap-4'>
      <RadioButtonContainer
        options={[
          { label: 'Student', value: 'Student' },
          { label: 'Working Professional', value: 'Working Professional' },
        ]}
        selectedValue={value}
        onChange={onChange}
      />
    </GridContainer>
  </FlexContainer>
);

export default StepOccupation;
