import React from 'react';
import { CheckboxButtonProps } from '@/interfaces';

const CheckboxButton = ({
  label,
  value,
  isSelected,
  onClick,
}: CheckboxButtonProps) => {
  return (
    <label
      className={`checkbox 
        ${isSelected ? 'bg-primary text-white' : 'bg-accent hover:bg-greyLight'}
      `}
      htmlFor={`checkbox-${value}`}
    >
      <input
        type='checkbox'
        id={`checkbox-${value}`}
        value={value}
        checked={isSelected}
        onChange={onClick}
        className='hidden'
      />
      {label}
    </label>
  );
};

export default CheckboxButton;
