import React from 'react';
import { RadioButtonProps } from '@/interfaces';

const RadioButton = ({
  label,
  value,
  isSelected,
  onChange,
}: RadioButtonProps) => {
  return (
    <label className='cursor-pointer flex items-center space-x-2'>
      <input
        type='radio'
        name='radio-group'
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className='hidden'
      />
      <div
        className={`px-4 py-2 font-bold rounded-lg transition-all duration-300 ${
          isSelected
            ? 'bg-primary text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-black'
        }`}
      >
        {label}
      </div>
    </label>
  );
};

export default RadioButton;
