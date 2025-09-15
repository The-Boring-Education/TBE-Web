import { FlexContainer, RadioButton } from '@/components';
import type { RadioGroupProps } from '@/interfaces';

const RadioButtonContainer = ({
  options,
  selectedValue,
  onChange,
}: RadioGroupProps) => {
  const handleClick = (value: string) => {
    onChange(selectedValue === value ? '' : value);
  };

  return (
    <FlexContainer className='gap-2'>
      {options.map((option, index) => (
        <RadioButton
          key={index}
          isSelected={selectedValue === option.value}
          label={option.label}
          value={option.value}
          onClick={() => handleClick(option.value)}
        />
      ))}
    </FlexContainer>
  );
};

export default RadioButtonContainer;
