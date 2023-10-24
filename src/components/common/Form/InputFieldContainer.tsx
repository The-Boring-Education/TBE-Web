import { FlexContainer } from '@/components';
import { InputFieldContainerProps } from '@/interfaces';

const InputFieldContainer = ({
  label,
  type,
  className,
  value,
  onChange,
  isOptional = false,
}: InputFieldContainerProps) => {
  return (
    <FlexContainer
      direction='col'
      className={`w-full gap-2.5 ${className}`}
      itemCenter={false}
    >
      <label className='pre-title text-white'>
        {label}
        {!isOptional && <span>*</span>}
      </label>
      <input
        type={type}
        value={value}
        className='w-full rounded focus:border-secondary focus:outline-none'
        onChange={(e) => onChange(e.target.value)}
      />
    </FlexContainer>
  );
};

export default InputFieldContainer;
