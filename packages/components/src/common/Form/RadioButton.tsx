import type { RadioButtonProps } from "@tbe/interface";
import React from "react";

const RadioButton = ({
  label,
  value,
  isSelected,
  onClick,
}: RadioButtonProps) => {
  const handleChange = () => {
    if (!isSelected) {
      onClick();
    }
  };

  return (
    <label
      className={`radio ${
        isSelected
          ? "bg-primary text-white border-primary"
          : "bg-accent dark:bg-white/[0.06] text-contentLight dark:text-zinc-200 border-border dark:border-white/10 hover:bg-greyLight dark:hover:bg-white/[0.1]"
      }`}
      htmlFor={`radio-${value}`}
    >
      <input
        checked={isSelected}
        className="hidden"
        id={`radio-${value}`}
        name="radio-group"
        type="radio"
        value={value}
        onChange={handleChange}
      />
      {label}
    </label>
  );
};

export default RadioButton;
