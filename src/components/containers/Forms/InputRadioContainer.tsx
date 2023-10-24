import { FlexContainer, RadioInputField } from '@/components';
import { InputRadioContainerProps } from '@/interfaces';

const InputRadioContainer = ({
  radioItems,
  onChange,
  selectedItemId,
  className,
}: InputRadioContainerProps) => {
  return (
    <FlexContainer className={`gap-2 ${className}`}>
      {radioItems.map(({ id, label, description }) => {
        return (
          <RadioInputField
            key={id}
            id={id}
            label={label}
            description={description}
            onChange={onChange}
            selected={selectedItemId === id}
          />
        );
      })}
    </FlexContainer>
  );
};

export default InputRadioContainer;
