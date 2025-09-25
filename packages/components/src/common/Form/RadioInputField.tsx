import { FlexContainer, Image, Text } from '@tbe/components';
import { STATIC_FILE_PATH } from '@tbe/constants';
import type { RadioInputFieldProps } from '@tbe/interface';

const RadioInputField = ({
  label,
  value,
  selected,
  onChange,
}: RadioInputFieldProps) => (
  <label
    key={value}
    className='w-full cursor-pointer md:w-fit'
    htmlFor={value}
    onClick={() => onChange(value)}
  >
    <input className='hidden' name='custom-radio' type='radio' />
    <FlexContainer
      className={`justify-between gap-2 rounded-full border-2 border-white p-2 shadow-md ${
        selected && 'bg-primary'
      }`}
    >
      <FlexContainer direction='col'>
        <Text className='strong-text text-contentDark' level='p'>
          {label}
        </Text>
      </FlexContainer>
      {selected && (
        <Image
          alt='developer activities'
          className='w-4'
          fullHeight={false}
          fullWidth={false}
          src={`${STATIC_FILE_PATH.svg}/select-radio.svg`}
        />
      )}
    </FlexContainer>
  </label>
);

export default RadioInputField;
