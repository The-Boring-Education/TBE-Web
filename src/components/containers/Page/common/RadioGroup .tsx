// src/components/RadioGroup.tsx
import React, { useState } from 'react';
import { RadioButton, FlexContainer } from '@/components';
import { RadioGroupProps } from '@/interfaces';

const RadioGroup = ({ options, selectedValue, onChange }: RadioGroupProps) => {
  const [selected, setSelected] = useState<string>(selectedValue || '');

  const handleSelection = (value: string) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <FlexContainer className='flex-wrap justify-center gap-1 md:gap-2 mx-auto max-w-lg py-5'>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          label={option.label}
          value={option.value}
          isSelected={selected === option.value}
          onChange={handleSelection}
        />
      ))}
    </FlexContainer>
  );
};

export default RadioGroup;
