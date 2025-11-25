import type { RadioButtonProps } from '@tbe/interface';
import React from 'react';

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
        isSelected ? 'bg-primary text-white' : 'bg-accent hover:bg-greyLight'
      }`}
      htmlFor={`radio-${value}`}
    >
      <input
        checked={isSelected}
        className='hidden'
        id={`radio-${value}`}
        name='radio-group'
        type='radio'
        value={value}
        onChange={handleChange}
      />
      {label}
    </label>
  );
};

export default RadioButton;
