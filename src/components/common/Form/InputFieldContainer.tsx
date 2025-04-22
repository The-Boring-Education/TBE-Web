import { FlexContainer, Text } from '@/components';
import { InputFieldContainerProps } from '@/interfaces';

const InputFieldContainer = ({
  label,
  type,
  className,
  value,
  onChange,
  labelClass,
  isOptional = false,
}: InputFieldContainerProps) => {
  return (
    <FlexContainer
      direction='col'
      className={`w-full gap-1 ${className}`}
      itemCenter={false}
    >
      <Text level='label' className={`label ${labelClass}`}>
        {label}
        {!isOptional && <span>*</span>}
      </Text>
      <input
        type={type}
        value={value}
        className='w-full rounded strong-text border border-grey focus:outline-none focus:border-none focus:ring focus:ring-grey'
        onChange={(e) => onChange(e.target.value)}
      />
    </FlexContainer>
  );
};

export default InputFieldContainer;
