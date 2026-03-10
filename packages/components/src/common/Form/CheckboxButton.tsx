import type { CheckboxButtonProps } from "@tbe/interface";
import React from "react";

const CheckboxButton = ({
  label,
  value,
  isSelected,
  onClick,
}: CheckboxButtonProps) => (
  <label
    className={`checkbox 
        ${isSelected ? "bg-primary text-white" : "bg-accent hover:bg-greyLight"}
      `}
    htmlFor={`checkbox-${value}`}
  >
    <input
      checked={isSelected}
      className="hidden"
      id={`checkbox-${value}`}
      type="checkbox"
      value={value}
      onChange={onClick}
    />
    {label}
  </label>
);

export default CheckboxButton;
