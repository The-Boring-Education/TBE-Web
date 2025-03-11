import { FlexContainer, RadioButton } from '@/components';
import { RadioGroupProps } from '@/interfaces';

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
          label={option.label}
          value={option.value}
          isSelected={selectedValue === option.value}
          onClick={() => handleClick(option.value)}
        />
      ))}
    </FlexContainer>
  );
};

export default RadioButtonContainer;
