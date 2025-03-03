import React from 'react';
import { SkillButtonProps } from '@/interfaces';

const SkillButton = ({ skill, isSelected, onClick }: SkillButtonProps) => {
  return (
    <div
      className={`px-4 py-1 text-black font-bold rounded-lg transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-b from-yellow-300 to-green-400'
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={() => onClick(skill)}
    >
      {isSelected && '✔ '}
      {skill}
    </div>
  );
};

export default SkillButton;
