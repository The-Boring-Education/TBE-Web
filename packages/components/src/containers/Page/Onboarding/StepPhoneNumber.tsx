import { FlexContainer, Text } from "@tbe/components";
import type { StepPhoneNumberProps } from "@tbe/interface";
import type { CountryCode } from "@tbe/utils";
import { getCountryInfo } from "@tbe/utils";

import PhoneInput from "../../../common/Form/PhoneInput";

const StepPhoneNumber = ({
  countryCode = "+91",
  phoneNumber = "",
  onChangeCode,
  onChangeNumber,
  value,
  onChange,
}: StepPhoneNumberProps) => {
  const currentFullValue =
    value !== undefined
      ? value
      : countryCode && phoneNumber
        ? `${countryCode} ${phoneNumber}`.trim()
        : phoneNumber || countryCode || "+91";

  const defaultCountry: CountryCode =
    (getCountryInfo(countryCode).country as CountryCode) || "IN";

  const handlePhoneChange = (
    fullVal: string,
    meta: {
      isValid: boolean;
      country: CountryCode;
      dialCode: string;
      nationalNumber: string;
    },
  ) => {
    if (onChange) {
      onChange(fullVal);
    }
    if (onChangeCode) {
      onChangeCode(meta.dialCode);
    }
    if (onChangeNumber) {
      onChangeNumber(meta.nationalNumber);
    }
  };

  return (
    <FlexContainer className="gap-2 w-full" direction="col" itemCenter={false}>
      <Text
        className="paragraph text-xs sm:text-sm font-bold text-slate-800"
        level="p"
      >
        Your Contact No
      </Text>

      <PhoneInput
        value={currentFullValue}
        defaultCountry={defaultCountry}
        onChange={handlePhoneChange}
      />
    </FlexContainer>
  );
};

export default StepPhoneNumber;
