import { FlexContainer, RadioInputField } from '@/components';

import type { InputRadioContainerProps } from '@/interfaces';

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
            selected={selectedItemValue === value}
            value={value}
            onChange={onChange}
          />
        );
      })}
    </FlexContainer>
  );
};

export default InputRadioContainer;
