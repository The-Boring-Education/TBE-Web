import { COUNTRY_CODES } from "@tbe/constants";
import type { StepPhoneNumberProps } from "@tbe/interface";

import InputFieldContainer from "../../../common/Form/InputFieldContainer";
import SelectInput from "../../../common/Form/SelectInput";
import Text from "../../../common/Typography/Text";
import FlexContainer from "../common/FlexContainer";

const StepPhoneNumber = ({
  countryCode,
  phoneNumber,
  onChangeCode,
  onChangeNumber,
}: StepPhoneNumberProps) => {
  const codeList = COUNTRY_CODES.map((c) => c.code);

  const handleNumberChange = (raw: string) => {
    let digits = raw.replace(/\D/g, "");
    const codeDigits = countryCode.replace(/\D/g, "");
    if (codeDigits && digits.startsWith(codeDigits) && digits.length > 10) {
      digits = digits.slice(codeDigits.length);
    }
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    onChangeNumber(digits);
  };

  return (
    <FlexContainer className="gap-2" direction="col">
      <Text className="paragraph" level="p">
        Your Contact No
      </Text>

      <FlexContainer className="gap-2 w-full items-center flex-nowrap">
        <SelectInput
          aria-label="Country Code"
          className=""
          list={codeList}
          selectedItem={countryCode}
          onChange={onChangeCode}
        />

        <InputFieldContainer
          className="w-full"
          isOptional
          label="Phone Number"
          labelClass="sr-only"
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          maxLength={10}
          value={phoneNumber}
          onChange={handleNumberChange}
        />
      </FlexContainer>
    </FlexContainer>
  );
};

export default StepPhoneNumber;
