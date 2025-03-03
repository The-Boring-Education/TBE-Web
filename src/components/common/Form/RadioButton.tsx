import React from 'react';

interface RadioButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`px-4 py-1 font-bold rounded-lg transition-all duration-300 cursor-pointer ${
        isSelected ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default RadioButton;
