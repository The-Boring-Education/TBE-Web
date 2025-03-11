import { FlexContainer, RadioInputField } from '@/components';
import { InputRadioContainerProps } from '@/interfaces';

const InputRadioContainer = ({
  radioItems,
  onChange,
  selectedItemValue,
  className,
}: InputRadioContainerProps) => {
  return (
    <FlexContainer className={`gap-2 ${className}`}>
      {radioItems.map(({ label, value }) => {
        return (
          <RadioInputField
            key={label}
            label={label}
            value={value}
            onChange={onChange}
            selected={selectedItemValue === value}
          />
        );
      })}
    </FlexContainer>
  );
};

export default InputRadioContainer;
