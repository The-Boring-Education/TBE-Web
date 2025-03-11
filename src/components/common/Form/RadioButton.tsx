import React from 'react';
import { RadioButtonProps } from '@/interfaces';

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  isSelected,
  onClick,
}) => {
  const handleChange = () => {
    if (!isSelected) {
      onClick();
    }
  };

  return (
    <label
      className={`flex items-center gap-2 px-3 py-1 font-semibold rounded transition-all duration-150 cursor-pointer shadow-md 
        ${
          isSelected ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'
        }
      `}
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
