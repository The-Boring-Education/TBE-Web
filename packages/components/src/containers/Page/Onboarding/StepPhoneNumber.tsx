import {
  FlexContainer,
  InputFieldContainer,
  SelectInput,
  Text,
} from "@tbe/components";
import { COUNTRY_CODES } from "@tbe/constants";
import type { StepPhoneNumberProps } from "@tbe/interface";
import { getPhoneNumberError, isValidPhoneNumber } from "@tbe/utils";

const StepPhoneNumber = ({
  countryCode,
  phoneNumber,
  onChangeCode,
  onChangeNumber,
}: StepPhoneNumberProps) => {
  const selectedFlagCode = (() => {
    const item = COUNTRY_CODES.find((c) => c.code === countryCode);
    return item ? `${item.flag} ${item.code}` : countryCode;
  })();

  const codeList = COUNTRY_CODES.map((c) => `${c.flag} ${c.code}`);
  const fullContact = `${countryCode} ${phoneNumber}`.trim();
  const isPhoneValid = isValidPhoneNumber(fullContact);
  const phoneError = getPhoneNumberError(fullContact);

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
          selectedItem={selectedFlagCode}
          onChange={(val: string) => {
            const rawCode = val.split(" ").pop() || "+91";
            onChangeCode(rawCode);
          }}
        />

        <InputFieldContainer
          className="w-full"
          isOptional
          label="Phone Number"
          labelClass="sr-only"
          type="tel"
          value={phoneNumber}
          onChange={(val: string) => {
            const cleaned = val.replace(/\D/g, "");
            const maxLen = countryCode === "+91" ? 10 : 15;
            onChangeNumber(cleaned.slice(0, maxLen));
          }}
        />
      </FlexContainer>

      {phoneNumber && phoneError ? (
        <p className="text-xs text-red-500 font-medium">{phoneError}</p>
      ) : phoneNumber && isPhoneValid ? (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ Valid contact number
        </p>
      ) : null}
    </FlexContainer>
  );
};

export default StepPhoneNumber;
