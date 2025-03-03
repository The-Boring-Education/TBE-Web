import React from 'react';
import { RadioButton } from '@/components';
import { RadioGroupProps } from '@/interfaces';

const RadioGroup = ({ options, selectedValue, onChange }: RadioGroupProps) => {
  return (
    <div className='flex flex-wrap justify-center gap-2'>
      {options.map((option, index) => (
        <RadioButton
          key={index}
          label={option.label}
          isSelected={selectedValue === option.label}
          onClick={() => onChange(option.label)}
        />
      ))}
    </div>
  );
};

export default RadioGroup;
