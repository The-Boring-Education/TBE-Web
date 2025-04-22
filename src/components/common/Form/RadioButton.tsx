import React from 'react';
import { RadioButtonProps } from '@/interfaces';

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
        type='radio'
        id={`radio-${value}`}
        name='radio-group'
        value={value}
        checked={isSelected}
        onChange={handleChange}
        className='hidden'
      />
      {label}
    </label>
  );
};

export default RadioButton;
