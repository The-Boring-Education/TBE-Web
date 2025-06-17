import {
  FlexContainer,
  InputFieldContainer,
  SelectInput,
  Text,
} from '@/components';
import { COUNTRY_CODES } from '@/constant';
import type { StepPhoneNumberProps } from '@/interfaces';

const StepPhoneNumber = ({
  countryCode,
  phoneNumber,
  onChangeCode,
  onChangeNumber,
}: StepPhoneNumberProps) => {
  const codeList = COUNTRY_CODES.map((c) => c.code);

  return (
    <FlexContainer className='gap-2' direction='col'>
      <Text className='paragraph' level='p'>
        Your Contact No
      </Text>

      <FlexContainer className='gap-2 w-full items-center flex-nowrap'>
        <SelectInput
          aria-label='Country Code'
          className=''
          list={codeList}
          selectedItem={countryCode}
          onChange={onChangeCode}
        />

        <InputFieldContainer
          className='w-full'
          isOptional
          label='Phone Number'
          labelClass='sr-only'
          type='tel'
          value={phoneNumber}
          onChange={onChangeNumber}
        />
      </FlexContainer>
    </FlexContainer>
  );
};

export default StepPhoneNumber;
