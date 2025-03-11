import { FlexContainer, Image, Text } from '@/components';
import { STATIC_FILE_PATH } from '@/constant';
import { RadioInputFieldProps } from '@/interfaces';

const RadioInputField = ({
  label,
  value,
  selected,
  onChange,
}: RadioInputFieldProps) => {
  return (
    <label
      key={value}
      htmlFor={value}
      className='w-full cursor-pointer md:w-fit'
      onClick={() => onChange(value)}
    >
      <input type='radio' name='custom-radio' className='hidden' />
      <FlexContainer
        className={`justify-between gap-2 rounded-full border-2 border-white p-2 shadow-md ${
          selected && 'bg-primary'
        }`}
      >
        <FlexContainer direction='col'>
          <Text level='p' className='strong-text text-contentDark'>
            {label}
          </Text>
        </FlexContainer>
        {selected && (
          <Image
            src={`${STATIC_FILE_PATH.svg}/select-radio.svg`}
            alt='developer activities'
            className='w-4'
            fullWidth={false}
            fullHeight={false}
          />
        )}
      </FlexContainer>
    </label>
  );
};

export default RadioInputField;
