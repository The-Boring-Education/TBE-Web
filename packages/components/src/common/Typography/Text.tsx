import type { TextProps } from "@tbe/interface";
import type { CSSProperties } from "react";

const Text = ({
  level,
  children,
  variant,
  textCenter,
  className = "",
  style,
}: TextProps) => {
  const HeadingTag = level;
  let variantClasses = "";

  if (variant === "SUCCESS") variantClasses = "text-success";
  else if (variant === "ERROR") variantClasses = "text-primary";

  return (
    <HeadingTag
      className={`${className} ${variantClasses} ${
        textCenter ? "text-center" : ""
      }`}
      style={style as CSSProperties | undefined}
    >
      {children}
    </HeadingTag>
  );
};

export default Text;
