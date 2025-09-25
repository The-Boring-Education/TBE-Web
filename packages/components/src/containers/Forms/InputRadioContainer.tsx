import { FlexContainer, RadioInputField } from '@tbe/components';
import type { InputRadioContainerProps } from '@tbe/interface';

const InputRadioContainer = ({
  radioItems,
  onChange,
  selectedItemValue,
  className,
}: InputRadioContainerProps) => (
  <FlexContainer className={`gap-2 ${className}`}>
    {radioItems.map(({ label, value }) => (
      <RadioInputField
        key={label}
        label={label}
        selected={selectedItemValue === value}
        value={value}
        onChange={onChange}
      />
    ))}
  </FlexContainer>
);

export default InputRadioContainer;
