import { COUNTRY_CODES } from '@/constant';
import {
  SelectInput,
  FlexContainer,
  InputFieldContainer,
  Text,
} from '@/components';
import { StepPhoneNumberProps } from '@/interfaces';

const StepPhoneNumber = ({
  countryCode,
  phoneNumber,
  onChangeCode,
  onChangeNumber,
}: StepPhoneNumberProps) => {
  const codeList = COUNTRY_CODES.map((c) => c.code);

  return (
    <FlexContainer className='gap-2' direction='col'>
      <Text level='p' className='paragraph'>
        3. Your Contact No?
      </Text>

      <FlexContainer className='gap-2 w-full items-center flex-nowrap'>
        <SelectInput
          list={codeList}
          selectedItem={countryCode}
          onChange={onChangeCode}
          className='w-24 sm:w-32 '
          aria-label='Country Code'
        />

        <InputFieldContainer
          label='Phone Number'
          type='tel'
          value={phoneNumber}
          onChange={onChangeNumber}
          className='w-full'
          labelClass='sr-only'
          isOptional={true}
        />
      </FlexContainer>
    </FlexContainer>
  );
};

export default StepPhoneNumber;
