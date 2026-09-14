import type { InputFieldContainerProps } from "@tbe/interface";

import Text from "../Typography/Text";
import FlexContainer from "../../containers/Page/common/FlexContainer";

const InputFieldContainer = ({
  label,
  type,
  className,
  value,
  onChange,
  labelClass,
  isOptional = false,
  maxLength,
  placeholder,
  pattern,
  inputMode,
}: InputFieldContainerProps) => (
  <FlexContainer
    className={`w-full gap-1 ${className}`}
    direction="col"
    itemCenter={false}
  >
    <Text className={`label ${labelClass}`} level="label">
      {label}
      {!isOptional && <span>*</span>}
    </Text>
    <input
      className="w-full rounded strong-text border border-grey focus:outline-none focus:border-none focus:ring focus:ring-grey"
      type={type}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      pattern={pattern}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
    />
  </FlexContainer>
);

export default InputFieldContainer;
