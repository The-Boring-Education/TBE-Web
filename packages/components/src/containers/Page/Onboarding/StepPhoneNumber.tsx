import { FlexContainer, Text } from "@tbe/components";
import type { StepPhoneNumberProps } from "@tbe/interface";
import type { CountryCode } from "@tbe/utils";
import { getCountryInfo } from "@tbe/utils";

import PhoneInput from "../../../common/Form/PhoneInput";

const StepPhoneNumber = (props: StepPhoneNumberProps) => {
  const isControlled = "value" in props && props.value !== undefined;
  const currentFullValue = isControlled
    ? props.value
    : props.countryCode && props.phoneNumber
      ? `${props.countryCode} ${props.phoneNumber}`.trim()
      : props.phoneNumber || props.countryCode || "+91";

  const countryCode =
    !isControlled && props.countryCode ? props.countryCode : "+91";
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
    if ("onChange" in props && props.onChange) {
      props.onChange(fullVal);
    }
    if ("onChangeCode" in props && props.onChangeCode) {
      props.onChangeCode(meta.dialCode);
    }
    if ("onChangeNumber" in props && props.onChangeNumber) {
      props.onChangeNumber(meta.nationalNumber);
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
