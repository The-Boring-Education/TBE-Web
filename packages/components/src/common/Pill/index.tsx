import { Text } from "@tbe/components";
import type { PillProps } from "@tbe/interface";

const Pill = ({
  text,
  variant,
  textStyleClasses = "",
  containerClasses = "",
  widthFull = false,
}: PillProps) => {
  let backgroundColor;
  let className = "";
  if (variant === "PRIMARY") {
    backgroundColor = "bg-primary/10 px-2 py-1 rounded";
    textStyleClasses = "text-primary";
  } else if (variant === "SECONDARY") {
    backgroundColor = "bg-secondary/10 text-secondary";
    textStyleClasses = "text-secondary";
  } else if (variant === "GHOST") {
    className = "bg-white strong-text";
    backgroundColor = "bg-white";
  }

  return (
    <div
      className={`rounded-1 ${backgroundColor} px-2 py-1 ${containerClasses} ${
        widthFull && "w-full"
      } ${className}`}
    >
      <Text className={`strong-text ${textStyleClasses}`} level="p" textCenter>
        {text}
      </Text>
    </div>
  );
};

export default Pill;
