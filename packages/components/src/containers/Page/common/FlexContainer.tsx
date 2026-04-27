import type { FlexContainerProps } from "@tbe/interface";

const FlexContainer = ({
  children,
  className = "",
  direction = "row",
  itemCenter = true,
  justifyCenter = true,
  wrap = true,
  fullWidth = false,
  id = "",
  disabled = false,
  as = "div",
}: FlexContainerProps) => {
  const Component = as as any;

  // Clean up direction-based classes
  const directionClass = direction === "col" ? "flex-col" : "flex-row";
  const alignClass = itemCenter ? "items-center" : "";
  const justifyClass = justifyCenter ? "justify-center" : "";
  const wrapClass = wrap ? "flex-wrap" : "flex-nowrap";
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "pointer-events-none opacity-40" : "";

  return (
    <Component
      aria-disabled={disabled}
      className={`flex ${directionClass} ${alignClass} ${justifyClass} ${wrapClass} ${widthClass} ${disabledClass} ${className}`}
      id={id}
    >
      {children}
    </Component>
  );
};

export default FlexContainer;
